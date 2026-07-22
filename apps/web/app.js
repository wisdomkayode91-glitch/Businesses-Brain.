const TEST_BUSINESS_ID = "1708f447-77b8-41d4-8764-64e5843bc2a2";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Carousel: 6 slides, auto-advance every 5s, true press-and-hold pause ──
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
  autoTimer = setInterval(() => { if (!isPaused) goToSlide(currentSlide + 1); }, 5000);
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
    selectedType = card.dataset.t;
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
  enterApp();
});
document.getElementById('noPhotoBtn').addEventListener('click', enterApp);

function enterApp() {
  showScreen('briefingScreen');
  loadBriefing();
}

document.getElementById('openBookBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('backToBriefingBtn').addEventListener('click', () => { showScreen('briefingScreen'); loadBriefing(); });
document.getElementById('goToRecordBtn').addEventListener('click', () => showScreen('bookScreen'));
document.getElementById('goToPurchaseBtn').addEventListener('click', () => showScreen('purchaseScreen'));
document.getElementById('backToListBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('backToListFromPurchaseBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('goToStockBtn').addEventListener('click', () => { showScreen('stockScreen'); loadStockList(); });
document.getElementById('backToListFromStockBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });

// ── Daily Briefing — real data, honest on day one ─────────
async function loadBriefing() {
  document.getElementById('briefDate').textContent = new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' });
  document.getElementById('greetName').textContent = 'Good day, ' + (businessName || 'friend') + '.';
  const body = document.getElementById('briefingBody');
  const lead = document.getElementById('briefLead');
  body.innerHTML = '<p class="empty-state">Reading your book...</p>';

  if (typeof supabaseClient === 'undefined') {
    body.innerHTML = '<p class="empty-state">Supabase is not connected yet.</p>';
    return;
  }

  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    const [todayTx, lowStock, receivables] = await Promise.all([
      supabaseClient.from('transactions').select('total_amount').eq('business_id', TEST_BUSINESS_ID).gte('created_at', todayStart.toISOString()),
      supabaseClient.from('items').select('name, stock_quantity').eq('business_id', TEST_BUSINESS_ID).eq('tracks_inventory', true).lte('stock_quantity', 5),
      supabaseClient.from('ledger_entries').select('amount_owed').eq('business_id', TEST_BUSINESS_ID).eq('status', 'current').eq('direction', 'receivable')
    ]);

    const todaySales = (todayTx.data || []).reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const lowItems = lowStock.data || [];
    const totalOwed = (receivables.data || []).reduce((sum, l) => sum + Number(l.amount_owed || 0), 0);

    const hasAnyData = todaySales > 0 || lowItems.length > 0 || totalOwed > 0;

    if (!hasAnyData) {
      lead.textContent = "You're just getting started.";
      body.innerHTML = '<div class="card"><span class="tag">Welcome</span><p>Nothing recorded yet. Once you log a few sales, I\'ll start noticing patterns and warning you before problems happen.</p></div>';
      return;
    }

    lead.textContent = 'Your shop is stable today.';
    let cards = '';
    cards += `<div class="card hero-card"><span class="tag">↑ Today</span><p><strong>₦${todaySales.toLocaleString()}</strong> in sales recorded so far today.</p></div>`;
    if (lowItems.length > 0) {
      const first = lowItems[0];
      const extra = lowItems.length > 1 ? ` and ${lowItems.length - 1} more item${lowItems.length > 2 ? 's' : ''}` : '';
      cards += `<div class="card caution"><span class="tag">⚠ Low Stock</span><p><strong>${first.name}</strong> is down to ${first.stock_quantity}${extra}.</p></div>`;
    }
    if (totalOwed > 0) {
      cards += `<div class="card critical"><span class="tag">₦ Cash</span><p><strong>₦${totalOwed.toLocaleString()}</strong> is currently tied up in unpaid customer debt.</p></div>`;
    }
    body.innerHTML = cards;

  } catch (err) {
    console.error(err);
    body.innerHTML = '<p class="empty-state">Could not load your briefing — check your connection.</p>';
  }
}

// ── My Stock ────────────────────────────────────────────
const LOW_STOCK_THRESHOLD = 5;
async function loadStockList() {
  const tbody = document.getElementById('stockTableBody');
  tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Loading your stock...</td></tr>';
  try {
    const { data, error } = await supabaseClient.from('items').select('name, stock_quantity')
      .eq('business_id', TEST_BUSINESS_ID).eq('tracks_inventory', true).order('name', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="2" class="empty-state">No items recorded yet.</td></tr>'; return; }
    tbody.innerHTML = '';
    data.forEach(item => {
      const qty = Number(item.stock_quantity) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${item.name}</td><td>${qty <= LOW_STOCK_THRESHOLD ? '<span class="pill owed">'+qty+' ⚠</span>' : qty}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Could not load stock.</td></tr>';
  }
}

// ── My Book list ────────────────────────────────────────
let selectedEntry = null;
async function loadBookList() {
  const tbody = document.getElementById('bookTableBody');
  if (typeof supabaseClient === 'undefined') { tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Supabase is not connected yet.</td></tr>'; return; }
  tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Loading your book...</td></tr>';
  try {
    const [salesRes, purchasesRes, payablesRes] = await Promise.all([
      supabaseClient.from('transactions').select('*, customers(name)').eq('business_id', TEST_BUSINESS_ID).order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('expenses').select('*').eq('business_id', TEST_BUSINESS_ID).eq('category', 'Stock Purchase').order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('ledger_entries').select('*, suppliers(name)').eq('business_id', TEST_BUSINESS_ID).eq('direction', 'payable').eq('status', 'current')
    ]);
    if (salesRes.error) throw salesRes.error;
    if (purchasesRes.error) throw purchasesRes.error;
    if (payablesRes.error) throw payablesRes.error;

    const payableByExpenseId = {};
    (payablesRes.data || []).forEach(le => { const eid = le.attributes?.expense_id; if (eid) payableByExpenseId[eid] = le; });

    const sales = (salesRes.data || []).map(tx => ({
      kind: 'sale', id: tx.id, created_at: tx.created_at, amount: tx.total_amount, isOwed: tx.status === 'owed',
      title: tx.status === 'owed' && tx.customers?.name ? `${tx.customers.name} owes you` : 'Sale', ledgerEntryId: null
    }));
    const purchases = (purchasesRes.data || []).map(ex => {
      const openPayable = payableByExpenseId[ex.id];
      const isOwed = !!openPayable;
      const supplierName = openPayable?.suppliers?.name;
      return {
        kind: 'purchase', id: ex.id, created_at: ex.created_at, amount: ex.amount, isOwed,
        title: isOwed && supplierName ? `You owe ${supplierName}` : `Bought: ${ex.linked_to || 'stock'}`,
        ledgerEntryId: openPayable?.id || null
      };
    });
    const combined = [...sales, ...purchases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (combined.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nothing recorded yet.</td></tr>'; return; }

    tbody.innerHTML = '';
    combined.forEach(entry => {
      const tr = document.createElement('tr');
      let statusLabel, statusClass;
      if (entry.kind === 'purchase') { statusLabel = entry.isOwed ? 'You Owe' : 'Purchase'; statusClass = entry.isOwed ? 'owed' : 'neutral'; }
      else { statusLabel = entry.isOwed ? 'Owed' : 'Paid'; statusClass = entry.isOwed ? 'owed' : 'paid'; }
      tr.innerHTML = `<td>${entry.title}</td><td>₦${Number(entry.amount).toLocaleString('en-NG')}</td><td><span class="pill ${statusClass}">${statusLabel}</span></td>`;
      tr.addEventListener('click', () => openActionSheet(entry));
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Could not load your book.</td></tr>';
  }
}

// ── Action sheet ──────────────────────────────────────────
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
  actionSheetBackdrop.classList.add('open');
}
function closeActionSheet() { actionSheetBackdrop.classList.remove('open'); selectedEntry = null; }
cancelActionBtn.addEventListener('click', closeActionSheet);
actionSheetBackdrop.addEventListener('click', (e) => { if (e.target === actionSheetBackdrop) closeActionSheet(); });

markPaidBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  try {
    if (selectedEntry.kind === 'sale') {
      const { data: tx, error: fetchErr } = await supabaseClient.from('transactions').select('total_amount').eq('id', selectedEntry.id).single();
      if (fetchErr) throw fetchErr;
      await supabaseClient.from('transactions').update({ status: 'paid', amount_paid: tx.total_amount, amount_owed: 0 }).eq('id', selectedEntry.id);
      await supabaseClient.from('ledger_entries').update({ status: 'resolved', amount_paid: tx.total_amount, amount_owed: 0 }).eq('linked_transaction_id', selectedEntry.id);
    } else {
      if (!selectedEntry.ledgerEntryId) throw new Error('No open supplier debt found.');
      const { data: le, error: fetchErr } = await supabaseClient.from('ledger_entries').select('amount_owed').eq('id', selectedEntry.ledgerEntryId).single();
      if (fetchErr) throw fetchErr;
      await supabaseClient.from('ledger_entries').update({ status: 'resolved', amount_paid: le.amount_owed, amount_owed: 0 }).eq('id', selectedEntry.ledgerEntryId);
    }
    closeActionSheet(); loadBookList();
  } catch (err) { console.error(err); alert('Could not mark as paid — try again.'); }
});

deleteEntryBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  try {
    if (selectedEntry.kind === 'sale') {
      await supabaseClient.from('ledger_entries').delete().eq('linked_transaction_id', selectedEntry.id);
      await supabaseClient.from('transactions').delete().eq('id', selectedEntry.id);
    } else {
      if (selectedEntry.ledgerEntryId) await supabaseClient.from('ledger_entries').delete().eq('id', selectedEntry.ledgerEntryId);
      await supabaseClient.from('expenses').delete().eq('id', selectedEntry.id);
    }
    closeActionSheet(); loadBookList();
  } catch (err) { console.error(err); alert('Could not delete — try again.'); }
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

function formatNaira(a) { return '₦' + Number(a || 0).toLocaleString('en-NG'); }
function updateTotal() { totalDisplay.textContent = formatNaira((Number(quantity.value)||0) * (Number(unitPrice.value)||0)); }
quantity.addEventListener('input', updateTotal);
unitPrice.addEventListener('input', updateTotal);
paymentMethod.addEventListener('change', () => {
  const isCredit = paymentMethod.value === 'credit';
  customerField.classList.toggle('hidden', !isCredit);
  customerName.required = isCredit;
});

async function adjustStock(itemId, delta) {
  const { data: item, error } = await supabaseClient.from('items').select('stock_quantity').eq('id', itemId).single();
  if (error) throw error;
  const newQty = (Number(item.stock_quantity) || 0) + delta;
  const { error: updateError } = await supabaseClient.from('items').update({ stock_quantity: newQty }).eq('id', itemId);
  if (updateError) throw updateError;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusMessage.textContent = 'Saving to My Book...'; statusMessage.className = '';
  if (typeof supabaseClient === 'undefined') { statusMessage.textContent = 'Supabase is not connected yet.'; statusMessage.className = 'error'; submitBtn.disabled = false; return; }

  const qty = Number(quantity.value), price = Number(unitPrice.value), total = qty * price;
  const isCredit = paymentMethod.value === 'credit';

  try {
    let { data: existingItem } = await supabaseClient.from('items').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', itemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items').insert({ business_id: TEST_BUSINESS_ID, name: itemName.value, unit_price: price, stock_quantity: 0 }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }
    let customerId = null;
    if (isCredit) {
      const { data: newCustomer, error } = await supabaseClient.from('customers').insert({ business_id: TEST_BUSINESS_ID, name: customerName.value }).select('id').single();
      if (error) throw error;
      customerId = newCustomer.id;
    }
    const { data: transaction, error: txError } = await supabaseClient.from('transactions').insert({
      business_id: TEST_BUSINESS_ID, customer_id: customerId, type: 'sale', status: isCredit ? 'owed' : 'paid',
      total_amount: total, amount_paid: isCredit ? 0 : total, amount_owed: isCredit ? total : 0, channel: 'in_house'
    }).select('id').single();
    if (txError) throw txError;

    await supabaseClient.from('transaction_line_items').insert({ transaction_id: transaction.id, item_id: itemId, quantity: qty, unit_price: price, subtotal: total });
    if (isCredit) {
      await supabaseClient.from('ledger_entries').insert({ business_id: TEST_BUSINESS_ID, customer_id: customerId, linked_transaction_id: transaction.id, amount_owed: total, amount_paid: 0, status: 'current', direction: 'receivable' });
    }
    await supabaseClient.from('inventory_movements').insert({ business_id: TEST_BUSINESS_ID, item_id: itemId, type: 'sale', quantity: -qty, reason: 'Sale recorded' });
    await adjustStock(itemId, -qty);

    statusMessage.textContent = 'Saved to My Book ✓'; statusMessage.className = 'success';
    form.reset(); updateTotal(); customerField.classList.add('hidden');
    setTimeout(() => { showScreen('bookListScreen'); loadBookList(); }, 800);
  } catch (err) {
    console.error(err); statusMessage.textContent = 'Something went wrong.'; statusMessage.className = 'error';
  } finally { submitBtn.disabled = false; }
});

// ── Record a Purchase ─────────────────────────────────────
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

function updatePurchaseTotal() { purchaseTotalDisplay.textContent = formatNaira((Number(purchaseQuantity.value)||0) * (Number(purchaseUnitCost.value)||0)); }
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
  purchaseStatusMessage.textContent = 'Saving purchase...'; purchaseStatusMessage.className = '';
  if (typeof supabaseClient === 'undefined') { purchaseStatusMessage.textContent = 'Supabase is not connected yet.'; purchaseStatusMessage.className = 'error'; purchaseSubmitBtn.disabled = false; return; }

  const qty = Number(purchaseQuantity.value), cost = Number(purchaseUnitCost.value), total = qty * cost;
  const isOwed = purchasePaymentStatus.value === 'owed';

  try {
    let { data: existingItem } = await supabaseClient.from('items').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', purchaseItemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items').insert({ business_id: TEST_BUSINESS_ID, name: purchaseItemName.value, cost_price: cost, stock_quantity: 0 }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }
    await supabaseClient.from('inventory_movements').insert({ business_id: TEST_BUSINESS_ID, item_id: itemId, type: 'restock', quantity: qty, reason: 'Stock purchased' });
    await adjustStock(itemId, qty);

    const linkedToNote = isOwed ? `${purchaseItemName.value} — owed to ${supplierName.value}` : purchaseItemName.value;
    const { data: expense, error: expenseError } = await supabaseClient.from('expenses').insert({ business_id: TEST_BUSINESS_ID, category: 'Stock Purchase', amount: total, linked_to: linkedToNote }).select('id').single();
    if (expenseError) throw expenseError;

    if (isOwed) {
      let { data: existingSupplier } = await supabaseClient.from('suppliers').select('id').eq('business_id', TEST_BUSINESS_ID).eq('name', supplierName.value).maybeSingle();
      let supplierId = existingSupplier?.id;
      if (!supplierId) {
        const { data: newSupplier, error: supplierError } = await supabaseClient.from('suppliers').insert({ business_id: TEST_BUSINESS_ID, name: supplierName.value }).select('id').single();
        if (supplierError) throw supplierError;
        supplierId = newSupplier.id;
      }
      const { error: payableError } = await supabaseClient.from('ledger_entries').insert({ business_id: TEST_BUSINESS_ID, supplier_id: supplierId, direction: 'payable', amount_owed: total, amount_paid: 0, status: 'current', attributes: { expense_id: expense.id } });
      if (payableError) throw payableError;
    }

    purchaseStatusMessage.textContent = 'Purchase saved ✓'; purchaseStatusMessage.className = 'success';
    purchaseForm.reset(); updatePurchaseTotal(); supplierField.classList.add('hidden');
    setTimeout(() => { showScreen('bookListScreen'); loadBookList(); }, 800);
  } catch (err) {
    console.error(err); purchaseStatusMessage.textContent = 'Something went wrong.'; purchaseStatusMessage.className = 'error';
  } finally { purchaseSubmitBtn.disabled = false; }
});
