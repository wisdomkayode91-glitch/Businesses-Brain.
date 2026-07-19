const TEST_BUSINESS_ID = "1708f447-77b8-41d4-8764-64e5843bc2a2";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Carousel ──────────────────────────────────────────────
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
const carouselWrap = document.getElementById('carouselWrap');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0, autoTimer, isPaused = false;

slides.forEach((s, i) => {
  s.classList.toggle('active', i === 0);
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}
function startAutoAdvance() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => { if (!isPaused) goToSlide(currentSlide + 1); }, 6000);
}
startAutoAdvance();

function pauseCarousel() { isPaused = true; }
function resumeCarousel() { isPaused = false; }
carouselWrap.addEventListener('touchstart', pauseCarousel, { passive: true });
carouselWrap.addEventListener('touchend', resumeCarousel, { passive: true });
carouselWrap.addEventListener('touchcancel', resumeCarousel, { passive: true });
carouselWrap.addEventListener('mousedown', pauseCarousel);
carouselWrap.addEventListener('mouseup', resumeCarousel);
carouselWrap.addEventListener('mouseleave', resumeCarousel);

nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoAdvance(); });
prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoAdvance(); });

document.getElementById('getStartedBtn').addEventListener('click', () => {
  clearInterval(autoTimer);
  showScreen('nameScreen');
});

// ── Setup flow ────────────────────────────────────────────
const businessNameInput = document.getElementById('businessNameInput');
const nameNextBtn = document.getElementById('nameNextBtn');
let businessName = '';

businessNameInput.addEventListener('input', () => {
  nameNextBtn.disabled = businessNameInput.value.trim().length === 0;
});
nameNextBtn.addEventListener('click', () => {
  businessName = businessNameInput.value.trim();
  showScreen('typeScreen');
});

const typeCards = document.querySelectorAll('.type-card');
const otherTypeLabel = document.getElementById('otherTypeLabel');
const otherTypeInput = document.getElementById('otherTypeInput');
const typeNextBtn = document.getElementById('typeNextBtn');
let selectedType = null;

typeCards.forEach(card => {
  card.addEventListener('click', () => {
    typeCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedType = card.dataset.type;
    otherTypeLabel.classList.toggle('hidden', selectedType !== 'other');
    typeNextBtn.disabled = selectedType === 'other' && otherTypeInput.value.trim() === '';
    if (selectedType !== 'other') typeNextBtn.disabled = false;
  });
});
otherTypeInput.addEventListener('input', () => {
  typeNextBtn.disabled = otherTypeInput.value.trim().length === 0;
});
typeNextBtn.addEventListener('click', () => showScreen('photoScreen'));

document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
  alert('This opens your camera or photo library in the real build.');
  enterMyBook();
});
document.getElementById('noPhotoBtn').addEventListener('click', enterMyBook);

function enterMyBook() {
  showScreen('bookListScreen');
  loadBookList();
}

document.getElementById('goToRecordBtn').addEventListener('click', () => showScreen('bookScreen'));
document.getElementById('goToPurchaseBtn').addEventListener('click', () => showScreen('purchaseScreen'));
document.getElementById('backToListBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('backToListFromPurchaseBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });

// ── My Book list — merges sales + purchases, now with real payable status ──
let selectedEntry = null; // { id, kind: 'sale'|'purchase', isOwed, ledgerEntryId }

async function loadBookList() {
  const bookList = document.getElementById('bookList');

  if (typeof supabaseClient === 'undefined') {
    bookList.innerHTML = '<p class="empty-state">Supabase is not connected yet.</p>';
    return;
  }

  bookList.innerHTML = '<p class="empty-state">Loading your book...</p>';

  try {
    const [salesRes, purchasesRes, payablesRes] = await Promise.all([
      supabaseClient.from('transactions').select('*, customers(name)')
        .eq('business_id', TEST_BUSINESS_ID).order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('expenses').select('*')
        .eq('business_id', TEST_BUSINESS_ID).eq('category', 'Stock Purchase')
        .order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('ledger_entries').select('*, suppliers(name)')
        .eq('business_id', TEST_BUSINESS_ID).eq('direction', 'payable').eq('status', 'current')
    ]);

    if (salesRes.error) throw salesRes.error;
    if (purchasesRes.error) throw purchasesRes.error;
    if (payablesRes.error) throw payablesRes.error;

    // Map expense id -> open payable ledger entry, using the expense_id we stored in attributes
    const payableByExpenseId = {};
    (payablesRes.data || []).forEach(le => {
      const expenseId = le.attributes?.expense_id;
      if (expenseId) payableByExpenseId[expenseId] = le;
    });

    const sales = (salesRes.data || []).map(tx => ({
      kind: 'sale', id: tx.id, created_at: tx.created_at,
      amount: tx.total_amount, isOwed: tx.status === 'owed',
      title: tx.status === 'owed' && tx.customers?.name ? `${tx.customers.name} owes you` : 'Sale',
      ledgerEntryId: null
    }));

    const purchases = (purchasesRes.data || []).map(ex => {
      const openPayable = payableByExpenseId[ex.id];
      const isOwed = !!openPayable;
      const supplierName = openPayable?.suppliers?.name;
      return {
        kind: 'purchase', id: ex.id, created_at: ex.created_at,
        amount: ex.amount, isOwed,
        title: isOwed && supplierName ? `You owe ${supplierName}` : `Bought: ${ex.linked_to || 'stock'}`,
        ledgerEntryId: openPayable?.id || null
      };
    });

    const combined = [...sales, ...purchases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (combined.length === 0) {
      bookList.innerHTML = '<p class="empty-state">Nothing recorded yet. Tap below to add your first sale.</p>';
      return;
    }

    bookList.innerHTML = '';
    combined.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'book-row';
      const date = new Date(entry.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      let statusLabel, statusClass;
      if (entry.kind === 'purchase') {
        statusLabel = entry.isOwed ? 'You Owe' : 'Purchase';
        statusClass = entry.isOwed ? 'owed' : 'purchase';
      } else {
        statusLabel = entry.isOwed ? 'Owed' : 'Paid';
        statusClass = entry.isOwed ? 'owed' : 'paid';
      }

      row.innerHTML = `
        <div class="book-row-left">
          <div class="book-row-title">${entry.title}</div>
          <div class="book-row-date">${date}</div>
        </div>
        <div class="book-row-right">
          <div class="book-row-amount">₦${Number(entry.amount).toLocaleString('en-NG')}</div>
          <div class="book-row-status ${statusClass}">${statusLabel}</div>
        </div>
      `;
      row.addEventListener('click', () => openActionSheet(entry));
      bookList.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    bookList.innerHTML = '<p class="empty-state">Could not load your book — check your connection.</p>';
  }
}

// ── Action sheet: Mark as Paid / Delete — works for both directions now ──
const actionSheetBackdrop = document.getElementById('actionSheetBackdrop');
const actionSheetTitle = document.getElementById('actionSheetTitle');
const markPaidBtn = document.getElementById('markPaidBtn');
const deleteEntryBtn = document.getElementById('deleteEntryBtn');
const cancelActionBtn = document.getElementById('cancelActionBtn');

function openActionSheet(entry) {
  selectedEntry = entry;
  actionSheetTitle.textContent = entry.title;
  markPaidBtn.classList.toggle('hidden', !entry.isOwed);
  markPaidBtn.textContent = entry.kind === 'purchase' ? '✓ Mark as Paid to Supplier' : '✓ Mark as Paid';
  actionSheetBackdrop.classList.remove('hidden');
}
function closeActionSheet() {
  actionSheetBackdrop.classList.add('hidden');
  selectedEntry = null;
}
cancelActionBtn.addEventListener('click', closeActionSheet);
actionSheetBackdrop.addEventListener('click', (e) => { if (e.target === actionSheetBackdrop) closeActionSheet(); });

markPaidBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  try {
    if (selectedEntry.kind === 'sale') {
      const { data: tx, error: fetchErr } = await supabaseClient
        .from('transactions').select('total_amount').eq('id', selectedEntry.id).single();
      if (fetchErr) throw fetchErr;

      await supabaseClient.from('transactions')
        .update({ status: 'paid', amount_paid: tx.total_amount, amount_owed: 0 })
        .eq('id', selectedEntry.id);

      await supabaseClient.from('ledger_entries')
        .update({ status: 'resolved', amount_paid: tx.total_amount, amount_owed: 0 })
        .eq('linked_transaction_id', selectedEntry.id);

    } else {
      // purchase — settling what you owe a supplier
      if (!selectedEntry.ledgerEntryId) throw new Error('No open supplier debt found for this entry.');

      const { data: le, error: fetchErr } = await supabaseClient
        .from('ledger_entries').select('amount_owed').eq('id', selectedEntry.ledgerEntryId).single();
      if (fetchErr) throw fetchErr;

      await supabaseClient.from('ledger_entries')
        .update({ status: 'resolved', amount_paid: le.amount_owed, amount_owed: 0 })
        .eq('id', selectedEntry.ledgerEntryId);
    }

    closeActionSheet();
    loadBookList();
  } catch (err) {
    console.error(err);
    alert('Could not mark as paid — check your connection and try again.');
  }
});

deleteEntryBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  if (!confirm('Delete this entry? This cannot be undone.')) return;

  try {
    if (selectedEntry.kind === 'sale') {
      await supabaseClient.from('ledger_entries').delete().eq('linked_transaction_id', selectedEntry.id);
      await supabaseClient.from('transactions').delete().eq('id', selectedEntry.id);
    } else {
      if (selectedEntry.ledgerEntryId) {
        await supabaseClient.from('ledger_entries').delete().eq('id', selectedEntry.ledgerEntryId);
      }
      await supabaseClient.from('expenses').delete().eq('id', selectedEntry.id);
    }
    closeActionSheet();
    loadBookList();
  } catch (err) {
    console.error(err);
    alert('Could not delete — check your connection and try again.');
  }
});

// ── Record a Sale ─────────────────────────────────────────
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

function formatNaira(amount) { return '₦' + Number(amount || 0).toLocaleString('en-NG'); }
function updateTotal() {
  const total = (Number(quantity.value) || 0) * (Number(unitPrice.value) || 0);
  totalDisplay.textContent = formatNaira(total);
}
quantity.addEventListener('input', updateTotal);
unitPrice.addEventListener('input', updateTotal);

paymentMethod.addEventListener('change', () => {
  const isCredit = paymentMethod.value === 'credit';
  customerField.classList.toggle('hidden', !isCredit);
  customerName.required = isCredit;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusMessage.textContent = 'Saving to My Book...';
  statusMessage.className = '';

  if (typeof supabaseClient === 'undefined') {
    statusMessage.textContent = 'Supabase is not connected yet.';
    statusMessage.className = 'error';
    submitBtn.disabled = false;
    return;
  }

  const qty = Number(quantity.value);
  const price = Number(unitPrice.value);
  const total = qty * price;
  const isCredit = paymentMethod.value === 'credit';

  try {
    let { data: existingItem } = await supabaseClient
      .from('items').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', itemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items')
        .insert({ business_id: TEST_BUSINESS_ID, name: itemName.value, unit_price: price }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }

    let customerId = null;
    if (isCredit) {
      const { data: newCustomer, error } = await supabaseClient.from('customers')
        .insert({ business_id: TEST_BUSINESS_ID, name: customerName.value }).select('id').single();
      if (error) throw error;
      customerId = newCustomer.id;
    }

    const { data: transaction, error: txError } = await supabaseClient.from('transactions').insert({
      business_id: TEST_BUSINESS_ID, customer_id: customerId, type: 'sale',
      status: isCredit ? 'owed' : 'paid', total_amount: total,
      amount_paid: isCredit ? 0 : total, amount_owed: isCredit ? total : 0, channel: 'in_house'
    }).select('id').single();
    if (txError) throw txError;

    await supabaseClient.from('transaction_line_items').insert({
      transaction_id: transaction.id, item_id: itemId, quantity: qty, unit_price: price, subtotal: total
    });

    if (isCredit) {
      await supabaseClient.from('ledger_entries').insert({
        business_id: TEST_BUSINESS_ID, customer_id: customerId, linked_transaction_id: transaction.id,
        amount_owed: total, amount_paid: 0, status: 'current', direction: 'receivable'
      });
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: TEST_BUSINESS_ID, item_id: itemId, type: 'sale', quantity: -qty, reason: 'Sale recorded'
    });

    statusMessage.textContent = 'Saved to My Book ✓';
    statusMessage.className = 'success';
    form.reset(); updateTotal(); customerField.classList.add('hidden');
    setTimeout(() => { showScreen('bookListScreen'); loadBookList(); }, 900);

  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong — check the browser console.';
    statusMessage.className = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});

// ── Record a Purchase — now creates a real payable debt when unpaid ──
const purchaseForm = document.getElementById('purchaseForm');
const purchaseItemName = document.getElementById('purchaseItemName');
const purchaseQuantity = document.getElementById('purchaseQuantity');
const purchaseUnitCost = document.getElementById('purchaseUnitCost');
const purchasePaymentStatus = document.getElementById('purchasePaymentStatus');
const supplierField = document.getElementById('supplierField');
const supplierName = document.getElementById('supplierName');
const purchaseTotalDisplay = document.getElementById('purchaseTotalDisplay');
const purchaseSubmitBtn = document.getElementById('purchaseSubmitBtn');
const purchaseStatusMessage = document.getElementById('purchaseStatusMessage');

function updatePurchaseTotal() {
  const total = (Number(purchaseQuantity.value) || 0) * (Number(purchaseUnitCost.value) || 0);
  purchaseTotalDisplay.textContent = formatNaira(total);
}
purchaseQuantity.addEventListener('input', updatePurchaseTotal);
purchaseUnitCost.addEventListener('input', updatePurchaseTotal);

purchasePaymentStatus.addEventListener('change', () => {
  const isOwed = purchasePaymentStatus.value === 'owed';
  supplierField.classList.toggle('hidden', !isOwed);
  supplierName.required = isOwed;
});

purchaseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  purchaseSubmitBtn.disabled = true;
  purchaseStatusMessage.textContent = 'Saving purchase...';
  purchaseStatusMessage.className = '';

  if (typeof supabaseClient === 'undefined') {
    purchaseStatusMessage.textContent = 'Supabase is not connected yet.';
    purchaseStatusMessage.className = 'error';
    purchaseSubmitBtn.disabled = false;
    return;
  }

  const qty = Number(purchaseQuantity.value);
  const cost = Number(purchaseUnitCost.value);
  const total = qty * cost;
  const isOwed = purchasePaymentStatus.value === 'owed';

  try {
    let { data: existingItem } = await supabaseClient
      .from('items').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', purchaseItemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items')
        .insert({ business_id: TEST_BUSINESS_ID, name: purchaseItemName.value, cost_price: cost }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: TEST_BUSINESS_ID, item_id: itemId, type: 'restock', quantity: qty, reason: 'Stock purchased'
    });

    const linkedToNote = isOwed
      ? `${purchaseItemName.value} — owed to ${supplierName.value}`
      : purchaseItemName.value;

    const { data: expense, error: expenseError } = await supabaseClient.from('expenses').insert({
      business_id: TEST_BUSINESS_ID, category: 'Stock Purchase', amount: total, linked_to: linkedToNote
    }).select('id').single();
    if (expenseError) throw expenseError;

    if (isOwed) {
      let { data: existingSupplier } = await supabaseClient
        .from('suppliers').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', supplierName.value).maybeSingle();
      let supplierId = existingSupplier?.id;
      if (!supplierId) {
        const { data: newSupplier, error: supplierError } = await supabaseClient
          .from('suppliers').insert({ business_id: TEST_BUSINESS_ID, name: supplierName.value })
          .select('id').single();
        if (supplierError) throw supplierError;
        supplierId = newSupplier.id;
      }

      await supabaseClient.from('ledger_entries').insert({
        business_id: TEST_BUSINESS_ID, supplier_id: supplierId, direction: 'payable',
        amount_owed: total, amount_paid: 0, status: 'current',
        attributes: { expense_id: expense.id }
      });
    }

    purchaseStatusMessage.textContent = 'Purchase saved ✓';
    purchaseStatusMessage.className = 'success';
    purchaseForm.reset(); updatePurchaseTotal(); supplierField.classList.add('hidden');
    setTimeout(() => { showScreen('bookListScreen'); loadBookList(); }, 900);

  } catch (err) {
    console.error(err);
    purchaseStatusMessage.textContent = 'Something went wrong — check the browser console.';
    purchaseStatusMessage.className = 'error';
  } finally {
    purchaseSubmitBtn.disabled = false;
  }
});
  
