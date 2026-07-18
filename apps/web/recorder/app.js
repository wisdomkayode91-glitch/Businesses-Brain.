// ── Configuration ──────────────────────────────────────
// TEMPORARY: until login is built, get business ID from localStorage or use test ID
// Create one manually in Supabase (insert a row into `businesses`) and paste its id below.
const TEST_BUSINESS_ID = "PASTE_A_TEST_BUSINESS_UUID_HERE";

// ── DOM Elements ──────────────────────────────────────
const form = document.getElementById('saleForm');
const itemName = document.getElementById('itemName');
const quantity = document.getElementById('quantity');
const unitPrice = document.getElementById('unitPrice');
const paymentMethod = document.getElementById('paymentMethod');
const customerField = document.getElementById('customerField');
const customerName = document.getElementById('customerName');
const totalDisplay = document.getElementById('totalDisplay');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const businessNameDisplay = document.getElementById('businessNameDisplay');
const backToDashboard = document.getElementById('backToDashboard');

// ── State ──────────────────────────────────────────────
let businessId = TEST_BUSINESS_ID;

// ── Initialize ────────────────────────────────────────
function init() {
  // Try to get business ID from localStorage (set by onboarding)
  try {
    const setupData = JSON.parse(localStorage.getItem('ledgermind_setup'));
    if (setupData && setupData.businessName) {
      businessNameDisplay.textContent = `${setupData.businessName} — New Entry`;
    }
    // In a real implementation, you'd also get the business ID from localStorage
    // or from a URL parameter after the business is created in Supabase
  } catch (e) {
    console.warn('Could not load setup data:', e);
  }

  // Set default unit price placeholder
  updateTotal();
}

// ── Formatting helpers ──────────────────────────────
function formatNaira(amount) {
  return '₦' + Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatNairaWithDecimal(amount) {
  return '₦' + Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── Total calculation ──────────────────────────────────
function updateTotal() {
  const qty = Number(quantity.value) || 0;
  const price = Number(unitPrice.value) || 0;
  const total = qty * price;
  totalDisplay.textContent = formatNaira(total);
}

quantity.addEventListener('input', updateTotal);
unitPrice.addEventListener('input', updateTotal);

// ── Payment method toggle ─────────────────────────────
paymentMethod.addEventListener('change', () => {
  const isCredit = paymentMethod.value === 'credit';
  customerField.classList.toggle('hidden', !isCredit);
  customerName.required = isCredit;
  if (!isCredit) {
    customerName.value = '';
  }
});

// ── Form submission ────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validate
  if (!businessId || businessId === "PASTE_A_TEST_BUSINESS_UUID_HERE") {
    statusMessage.textContent = '⚠️ Please set up a valid business ID first.';
    statusMessage.className = 'error';
    return;
  }

  const qty = Number(quantity.value);
  const price = Number(unitPrice.value);
  const total = qty * price;
  const isCredit = paymentMethod.value === 'credit';
  const itemNameValue = itemName.value.trim();
  const customerNameValue = customerName.value.trim();

  if (!itemNameValue) {
    statusMessage.textContent = 'Please enter what you sold.';
    statusMessage.className = 'error';
    itemName.focus();
    return;
  }

  if (isCredit && !customerNameValue) {
    statusMessage.textContent = 'Please enter the customer name for credit sale.';
    statusMessage.className = 'error';
    customerName.focus();
    return;
  }

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  statusMessage.textContent = 'Saving to My Book...';
  statusMessage.className = 'loading';

  try {
    // ── 1. Get or create item ──────────────────────────
    let { data: existingItem } = await supabaseClient
      .from('items')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', itemNameValue)
      .maybeSingle();

    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error: itemError } = await supabaseClient
        .from('items')
        .insert({
          business_id: businessId,
          name: itemNameValue,
          unit_price: price,
          tracks_inventory: true,
          stock_quantity: 0
        })
        .select('id')
        .single();
      if (itemError) throw itemError;
      itemId = newItem.id;
    }

    // ── 2. Get or create customer (for credit) ─────────
    let customerId = null;
    if (isCredit) {
      // Check if customer already exists
      let { data: existingCustomer } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('business_id', businessId)
        .eq('name', customerNameValue)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabaseClient
          .from('customers')
          .insert({
            business_id: businessId,
            name: customerNameValue,
            last_interaction_date: new Date().toISOString()
          })
          .select('id')
          .single();
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }
    }

    // ── 3. Create transaction ─────────────────────────
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        type: 'sale',
        status: isCredit ? 'owed' : 'paid',
        total_amount: total,
        amount_paid: isCredit ? 0 : total,
        amount_owed: isCredit ? total : 0,
        channel: paymentMethod.value === 'pos' ? 'pos' : 'in_house',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    if (txError) throw txError;

    // ── 4. Create transaction line item ────────────────
    const { error: lineError } = await supabaseClient
      .from('transaction_line_items')
      .insert({
        transaction_id: transaction.id,
        item_id: itemId,
        quantity: qty,
        unit_price: price,
        subtotal: total
      });
    if (lineError) throw lineError;

    // ── 5. Create ledger entry (if credit) ─────────────
    if (isCredit) {
      const { error: ledgerError } = await supabaseClient
        .from('ledger_entries')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          linked_transaction_id: transaction.id,
          amount_owed: total,
          amount_paid: 0,
          status: 'current',
          created_at: new Date().toISOString()
        });
      if (ledgerError) throw ledgerError;
    }

    // ── 6. Update inventory ────────────────────────────
    const { error: inventoryError } = await supabaseClient
      .from('inventory_movements')
      .insert({
        business_id: businessId,
        item_id: itemId,
        type: 'sale',
        quantity: -qty,
        reason: `Sale recorded - ${itemNameValue}`,
        created_at: new Date().toISOString()
      });
    if (inventoryError) throw inventoryError;

    // ── 7. Update item stock quantity ──────────────────
    // First get current stock
    const { data: itemData } = await supabaseClient
      .from('items')
      .select('stock_quantity')
      .eq('id', itemId)
      .single();
    
    if (itemData) {
      const currentStock = Number(itemData.stock_quantity) || 0;
      const newStock = Math.max(0, currentStock - qty);
      await supabaseClient
        .from('items')
        .update({ stock_quantity: newStock })
        .eq('id', itemId);
    }

    // ── Success ────────────────────────────────────────
    const successMsg = isCredit 
      ? `✓ Saved! ${customerNameValue} owes ${formatNaira(total)}`
      : `✓ Saved! ${formatNaira(total)} recorded`;
    
    statusMessage.textContent = successMsg;
    statusMessage.className = 'success';
    
    // Reset form
    form.reset();
    quantity.value = 1;
    customerField.classList.add('hidden');
    customerName.required = false;
    updateTotal();
    itemName.focus();

  } catch (err) {
    console.error('Error saving sale:', err);
    statusMessage.textContent = '❌ Something went wrong. Check console for details.';
    statusMessage.className = 'error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save to My Book';
  }
});

// ── Keyboard shortcut: Ctrl+Enter to submit ────────────
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    form.dispatchEvent(new Event('submit'));
  }
});

// ── Back to dashboard ──────────────────────────────────
backToDashboard.addEventListener('click', (e) => {
  e.preventDefault();
  // In production, this would go to a dashboard view
  // For now, go back to onboarding or show a message
  if (confirm('Return to the welcome screen?')) {
    window.location.href = '../onboarding/index.html';
  }
});

// ── Initialize ──────────────────────────────────────────
init();
