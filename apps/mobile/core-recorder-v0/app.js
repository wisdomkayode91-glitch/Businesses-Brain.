// TEMPORARY: until the auth/login flow is built, hardcode a test business ID.
// Create one manually in Supabase (insert a row into `businesses`) and paste its id here.
const TEST_BUSINESS_ID = "PASTE_A_TEST_BUSINESS_UUID_HERE";

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

function formatNaira(amount) {
  return '₦' + Number(amount || 0).toLocaleString('en-NG');
}

function updateTotal() {
  const total = (Number(quantity.value) || 0) * (Number(unitPrice.value) || 0);
  totalDisplay.textContent = formatNaira(total);
}

quantity.addEventListener('input', updateTotal);
unitPrice.addEventListener('input', updateTotal);

paymentMethod.addEventListener('change', () => {
  customerField.classList.toggle('hidden', paymentMethod.value !== 'credit');
  customerName.required = paymentMethod.value === 'credit';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusMessage.textContent = 'Saving...';
  statusMessage.className = '';

  const qty = Number(quantity.value);
  const price = Number(unitPrice.value);
  const total = qty * price;
  const isCredit = paymentMethod.value === 'credit';

  try {
    let { data: existingItem } = await supabaseClient
      .from('items')
      .select('id')
      .eq('business_id', TEST_BUSINESS_ID)
      .eq('name', itemName.value)
      .maybeSingle();

    let itemId = existingItem?.id;

    if (!itemId) {
      const { data: newItem, error: itemError } = await supabaseClient
        .from('items')
        .insert({ business_id: TEST_BUSINESS_ID, name: itemName.value, unit_price: price })
        .select('id')
        .single();
      if (itemError) throw itemError;
      itemId = newItem.id;
    }

    let customerId = null;
    if (isCredit) {
      const { data: newCustomer, error: customerError } = await supabaseClient
        .from('customers')
        .insert({ business_id: TEST_BUSINESS_ID, name: customerName.value })
        .select('id')
        .single();
      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        business_id: TEST_BUSINESS_ID,
        customer_id: customerId,
        type: 'sale',
        status: isCredit ? 'owed' : 'paid',
        total_amount: total,
        amount_paid: isCredit ? 0 : total,
        amount_owed: isCredit ? total : 0,
        channel: 'in_house'
      })
      .select('id')
      .single();
    if (txError) throw txError;

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

    if (isCredit) {
      const { error: ledgerError } = await supabaseClient
        .from('ledger_entries')
        .insert({
          business_id: TEST_BUSINESS_ID,
          customer_id: customerId,
          linked_transaction_id: transaction.id,
          amount_owed: total,
          amount_paid: 0,
          status: 'current'
        });
      if (ledgerError) throw ledgerError;
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: TEST_BUSINESS_ID,
      item_id: itemId,
      type: 'sale',
      quantity: -qty,
      reason: 'Sale recorded'
    });

    statusMessage.textContent = 'Sale saved ✓';
    statusMessage.className = 'success';
    form.reset();
    updateTotal();
    customerField.classList.add('hidden');

  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong — check console.';
    statusMessage.className = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
