let CURRENT_BUSINESS_ID = null;
let CURRENT_AUTH_USER_ID = null;

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
  showScreen('authScreen');
});
document.getElementById('seeHowBtn').addEventListener('click', () => {
  goToSlide(1);
});

// ── Real Authentication ────────────────────────────────────
let isSignUpMode = true;
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authError = document.getElementById('authError');
const authToggleLink = document.getElementById('authToggleLink');
const authHeadline = document.getElementById('authHeadline');

authToggleLink.addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  authHeadline.textContent = isSignUpMode ? 'Create your account' : 'Welcome back';
  authSubmitBtn.textContent = isSignUpMode ? 'Create Account' : 'Sign In';
  authToggleLink.textContent = isSignUpMode ? 'Already have an account? Sign in' : "New here? Create an account";
  authError.textContent = '';
});

authSubmitBtn.addEventListener('click', async () => {
  authError.textContent = '';
  authError.className = 'error';
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || password.length < 6) {
    authError.textContent = 'Enter a valid email and a password of at least 6 characters.';
    return;
  }
  authSubmitBtn.disabled = true;

  try {
    if (isSignUpMode) {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;

      if (!data.session) {
        authError.textContent = 'Account created — check your email to confirm, then sign in.';
        authError.className = 'success';
        isSignUpMode = false;
        authHeadline.textContent = 'Welcome back';
        authSubmitBtn.textContent = 'Sign In';
        authToggleLink.textContent = "New here? Create an account";
        return;
      }

      CURRENT_AUTH_USER_ID = data.user.id;
      showScreen('nameScreen'); // continue to business setup for a brand-new account

    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;

      CURRENT_AUTH_USER_ID = data.user.id;
      const resolved = await resolveBusinessForUser(CURRENT_AUTH_USER_ID);
      if (resolved) {
        showScreen('briefingScreen');
        loadBriefing();
      } else {
        // Signed in, but no business set up yet on this account
        showScreen('nameScreen');
      }
    }
  } catch (err) {
    console.error(err);
    authError.textContent = err.message || 'Something went wrong — please try again.';
  } finally {
    authSubmitBtn.disabled = false;
  }
});

async function resolveBusinessForUser(authUserId) {
  const { data, error } = await supabaseClient
    .from('app_users').select('business_id').eq('auth_user_id', authUserId).maybeSingle();
  if (error) { console.error(error); return false; }
  if (data?.business_id) {
    CURRENT_BUSINESS_ID = data.business_id;
    return true;
  }
  return false;
}

// On page load: if already signed in, skip straight to the Daily Briefing
(async function checkExistingSession() {
  if (typeof supabaseClient === 'undefined') return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    CURRENT_AUTH_USER_ID = session.user.id;
    const resolved = await resolveBusinessForUser(CURRENT_AUTH_USER_ID);
    clearInterval(autoTimer);
    if (resolved) {
      showScreen('briefingScreen');
      loadBriefing();
    } else {
      showScreen('nameScreen');
    }
  }
})();

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  CURRENT_BUSINESS_ID = null;
  CURRENT_AUTH_USER_ID = null;
  showScreen('carouselScreen');
  goToSlide(0);
  startAutoAdvance();
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
});
document.getElementById('noPhotoBtn').addEventListener('click', () => {
  // Just acknowledges skip; Complete Setup below always proceeds
});
document.getElementById('completeSetupBtn').addEventListener('click', enterMyBook);

async function enterMyBook() {
  const completeBtn = document.getElementById('completeSetupBtn');
  completeBtn.disabled = true;
  completeBtn.textContent = 'Setting up...';

  try {
    if (!CURRENT_AUTH_USER_ID) throw new Error('You need to be signed in to finish setup.');

    // Create the real business + link it to this owner
    const { data: newBusiness, error: bizError } = await supabaseClient
      .from('businesses')
      .insert({
        name: businessName || 'My Business',
        archetype_type: selectedType || 'inventory_retail',
        owner_user_id: CURRENT_AUTH_USER_ID
      })
      .select('id').single();
    if (bizError) throw bizError;

    const { error: userError } = await supabaseClient.from('app_users').insert({
      business_id: newBusiness.id,
      auth_user_id: CURRENT_AUTH_USER_ID,
      name: businessName || 'Owner',
      role: 'owner'
    });
    if (userError) throw userError;

    CURRENT_BUSINESS_ID = newBusiness.id;
    showScreen('briefingScreen');
    loadBriefing();

  } catch (err) {
    console.error(err);
    alert('Could not finish setup — check your connection and try again.');
    completeBtn.disabled = false;
    completeBtn.textContent = 'Complete Setup →';
  }
}



document.getElementById('goToRecordBtn').addEventListener('click', () => showScreen('bookScreen'));
document.getElementById('goToPurchaseBtn').addEventListener('click', () => showScreen('purchaseScreen'));
document.getElementById('backToListBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('backToListFromPurchaseBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('goToStockBtn').addEventListener('click', () => { showScreen('stockScreen'); loadStockList(); });
document.getElementById('backToListFromStockBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('goToBriefingBtn').addEventListener('click', () => { showScreen('briefingScreen'); loadBriefing(); });
document.getElementById('goToBookFromBriefingBtn').addEventListener('click', () => { showScreen('bookListScreen'); loadBookList(); });
document.getElementById('exportBtn').addEventListener('click', () => {
  alert('Full spreadsheet export is coming soon — your data is always yours to download.');
});

// ── Daily Briefing ────────────────────────────────────────
function line(text, type = 'neutral') {
  return `<div class="briefing-line ${type}">${text}</div>`;
}

async function loadBriefing() {
  const body = document.getElementById('briefingBody');
  const dateEl = document.getElementById('briefingDate');
  const greetEl = document.getElementById('briefingGreeting');

  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' });
  const hour = now.getHours();
  greetEl.textContent = hour < 12 ? 'Good morning.' : hour < 17 ? 'Good afternoon.' : 'Good evening.';

  body.innerHTML = line('Reading your book...');

  if (typeof supabaseClient === 'undefined') {
    body.innerHTML = line('Supabase is not connected yet.', 'critical');
    return;
  }

  try {
    const since = new Date(); since.setDate(since.getDate() - 1);
    const [salesRes, owedRes] = await Promise.all([
      supabaseClient.from('transactions').select('total_amount')
        .eq('business_id', CURRENT_BUSINESS_ID).is('deleted_at', null).gte('created_at', since.toISOString()),
      supabaseClient.from('ledger_entries').select('amount_owed, direction')
        .eq('business_id', CURRENT_BUSINESS_ID).eq('status', 'current').is('deleted_at', null)
    ]);

    const sales = salesRes.data || [];
    const owed = owedRes.data || [];

    if (sales.length === 0 && owed.length === 0) {
      body.innerHTML = line("You're just getting started — nothing recorded yet. Once you log a few sales, I'll start noticing patterns and warning you before problems happen.");
      return;
    }

    let html = '';
    const total = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    if (sales.length > 0) {
      html += line(`You recorded <strong>₦${total.toLocaleString('en-NG')}</strong> in sales over the last day.`, 'positive');
    }
    const receivable = owed.filter(o => o.direction === 'receivable').reduce((s, o) => s + Number(o.amount_owed), 0);
    if (receivable > 0) {
      html += line(`Customers currently owe you <strong>₦${receivable.toLocaleString('en-NG')}</strong>.`, 'caution');
    }
    const payable = owed.filter(o => o.direction === 'payable').reduce((s, o) => s + Number(o.amount_owed), 0);
    if (payable > 0) {
      html += line(`You currently owe suppliers <strong>₦${payable.toLocaleString('en-NG')}</strong>.`, 'caution');
    }
    body.innerHTML = html || line("Nothing new to report right now — your book is up to date.");

  } catch (err) {
    console.error(err);
    body.innerHTML = line('Could not load your briefing — check your connection.', 'critical');
  }
}

// ── My Stock ──────────────────────────────────────────────
const LOW_STOCK_THRESHOLD = 5;

async function loadStockList() {
  const tbody = document.getElementById('stockTableBody');
  tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Loading your stock...</td></tr>';

  try {
    const { data, error } = await supabaseClient
      .from('items').select('name, stock_quantity')
      .eq('business_id', CURRENT_BUSINESS_ID).eq('tracks_inventory', true).order('name', { ascending: true });
    if (error) throw error;

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="empty-state">No items recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.forEach(item => {
      const qty = Number(item.stock_quantity) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${item.name}</td><td class="${qty <= LOW_STOCK_THRESHOLD ? 'stock-low' : ''}">${qty}${qty <= LOW_STOCK_THRESHOLD ? ' ⚠' : ''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Could not load stock.</td></tr>';
  }
}

// ── My Book list ──────────────────────────────────────────
let selectedEntry = null;

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
        .eq('business_id', CURRENT_BUSINESS_ID).is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('expenses').select('*')
        .eq('business_id', CURRENT_BUSINESS_ID).eq('category', 'Stock Purchase').is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(20),
      supabaseClient.from('ledger_entries').select('*, suppliers(name)')
        .eq('business_id', CURRENT_BUSINESS_ID).eq('direction', 'payable').eq('status', 'current').is('deleted_at', null)
    ]);

    if (salesRes.error) throw salesRes.error;
    if (purchasesRes.error) throw purchasesRes.error;
    if (payablesRes.error) throw payablesRes.error;

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
      bookList.innerHTML = '<p class="empty-state">Nothing recorded yet.</p>';
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
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
      `;
      row.addEventListener('click', () => openActionSheet(entry));
      bookList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    bookList.innerHTML = '<p class="empty-state">Could not load your book.</p>';
  }
}

// ── Action sheet: Edit / Mark as Paid / Move to Trash ────
const actionSheetBackdrop = document.getElementById('actionSheetBackdrop');
const actionSheetTitle = document.getElementById('actionSheetTitle');
const editEntryBtn = document.getElementById('editEntryBtn');
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
}
cancelActionBtn.addEventListener('click', closeActionSheet);
actionSheetBackdrop.addEventListener('click', (e) => { if (e.target === actionSheetBackdrop) closeActionSheet(); });

// Edit modal
const editModalBackdrop = document.getElementById('editModalBackdrop');
const editAmountInput = document.getElementById('editAmountInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

editEntryBtn.addEventListener('click', () => {
  if (!selectedEntry) return;
  editAmountInput.value = selectedEntry.amount;
  closeActionSheet();
  editModalBackdrop.classList.remove('hidden');
});
cancelEditBtn.addEventListener('click', () => editModalBackdrop.classList.add('hidden'));
editModalBackdrop.addEventListener('click', (e) => { if (e.target === editModalBackdrop) editModalBackdrop.classList.add('hidden'); });

saveEditBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  const newAmount = Number(editAmountInput.value);
  if (!newAmount || newAmount < 0) { alert('Enter a valid amount.'); return; }

  try {
    if (selectedEntry.kind === 'sale') {
      const isOwed = selectedEntry.isOwed;
      await supabaseClient.from('transactions').update({
        total_amount: newAmount,
        amount_paid: isOwed ? 0 : newAmount,
        amount_owed: isOwed ? newAmount : 0
      }).eq('id', selectedEntry.id);
      if (isOwed) {
        await supabaseClient.from('ledger_entries').update({ amount_owed: newAmount }).eq('linked_transaction_id', selectedEntry.id);
      }
    } else {
      await supabaseClient.from('expenses').update({ amount: newAmount }).eq('id', selectedEntry.id);
      if (selectedEntry.ledgerEntryId) {
        await supabaseClient.from('ledger_entries').update({ amount_owed: newAmount }).eq('id', selectedEntry.ledgerEntryId);
      }
    }
    editModalBackdrop.classList.add('hidden');
    loadBookList();
  } catch (err) {
    console.error(err);
    alert('Could not save changes — check your connection.');
  }
});

markPaidBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  try {
    if (selectedEntry.kind === 'sale') {
      const { data: tx, error: fetchErr } = await supabaseClient
        .from('transactions').select('total_amount').eq('id', selectedEntry.id).single();
      if (fetchErr) throw fetchErr;
      await supabaseClient.from('transactions').update({ status: 'paid', amount_paid: tx.total_amount, amount_owed: 0 }).eq('id', selectedEntry.id);
      await supabaseClient.from('ledger_entries').update({ status: 'resolved', amount_paid: tx.total_amount, amount_owed: 0 }).eq('linked_transaction_id', selectedEntry.id);
    } else {
      if (!selectedEntry.ledgerEntryId) throw new Error('No open supplier debt found.');
      const { data: le, error: fetchErr } = await supabaseClient
        .from('ledger_entries').select('amount_owed').eq('id', selectedEntry.ledgerEntryId).single();
      if (fetchErr) throw fetchErr;
      await supabaseClient.from('ledger_entries').update({ status: 'resolved', amount_paid: le.amount_owed, amount_owed: 0 }).eq('id', selectedEntry.ledgerEntryId);
    }
    closeActionSheet();
    loadBookList();
  } catch (err) {
    console.error(err);
    alert('Could not mark as paid — check your connection.');
  }
});

// Soft delete — moves to Trash instead of destroying instantly
deleteEntryBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;
  if (!confirm('Move this entry to Trash? You can restore it later.')) return;

  try {
    const now = new Date().toISOString();
    if (selectedEntry.kind === 'sale') {
      await supabaseClient.from('ledger_entries').update({ deleted_at: now }).eq('linked_transaction_id', selectedEntry.id);
      await supabaseClient.from('transactions').update({ deleted_at: now }).eq('id', selectedEntry.id);
    } else {
      if (selectedEntry.ledgerEntryId) {
        await supabaseClient.from('ledger_entries').update({ deleted_at: now }).eq('id', selectedEntry.ledgerEntryId);
      }
      await supabaseClient.from('expenses').update({ deleted_at: now }).eq('id', selectedEntry.id);
    }
    closeActionSheet();
    loadBookList();
  } catch (err) {
    console.error(err);
    alert('Could not move to Trash — check your connection.');
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
      .from('items').select('id').eq('business_id', CURRENT_BUSINESS_ID).eq('name', itemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items')
        .insert({ business_id: CURRENT_BUSINESS_ID, name: itemName.value, unit_price: price, stock_quantity: 0 }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }

    let customerId = null;
    if (isCredit) {
      const { data: newCustomer, error } = await supabaseClient.from('customers')
        .insert({ business_id: CURRENT_BUSINESS_ID, name: customerName.value }).select('id').single();
      if (error) throw error;
      customerId = newCustomer.id;
    }

    const { data: transaction, error: txError } = await supabaseClient.from('transactions').insert({
      business_id: CURRENT_BUSINESS_ID, customer_id: customerId, type: 'sale',
      status: isCredit ? 'owed' : 'paid', total_amount: total,
      amount_paid: isCredit ? 0 : total, amount_owed: isCredit ? total : 0, channel: 'in_house'
    }).select('id').single();
    if (txError) throw txError;

    await supabaseClient.from('transaction_line_items').insert({
      transaction_id: transaction.id, item_id: itemId, quantity: qty, unit_price: price, subtotal: total
    });

    if (isCredit) {
      await supabaseClient.from('ledger_entries').insert({
        business_id: CURRENT_BUSINESS_ID, customer_id: customerId, linked_transaction_id: transaction.id,
        amount_owed: total, amount_paid: 0, status: 'current', direction: 'receivable'
      });
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: CURRENT_BUSINESS_ID, item_id: itemId, type: 'sale', quantity: -qty, reason: 'Sale recorded'
    });

    await adjustStock(itemId, -qty);

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
      .from('items').select('id').eq('business_id', CURRENT_BUSINESS_ID).eq('name', purchaseItemName.value).maybeSingle();
    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient.from('items')
        .insert({ business_id: CURRENT_BUSINESS_ID, name: purchaseItemName.value, cost_price: cost, stock_quantity: 0 }).select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: CURRENT_BUSINESS_ID, item_id: itemId, type: 'restock', quantity: qty, reason: 'Stock purchased'
    });
    await adjustStock(itemId, qty);

    const linkedToNote = isOwed ? `${purchaseItemName.value} — owed to ${supplierName.value}` : purchaseItemName.value;

    const { data: expense, error: expenseError } = await supabaseClient.from('expenses').insert({
      business_id: CURRENT_BUSINESS_ID, category: 'Stock Purchase', amount: total, linked_to: linkedToNote
    }).select('id').single();
    if (expenseError) throw expenseError;

    if (isOwed) {
      let { data: existingSupplier } = await supabaseClient
        .from('suppliers').select('id').eq('business_id', CURRENT_BUSINESS_ID).eq('name', supplierName.value).maybeSingle();
      let supplierId = existingSupplier?.id;
      if (!supplierId) {
        const { data: newSupplier, error: supplierError } = await supabaseClient
          .from('suppliers').insert({ business_id: CURRENT_BUSINESS_ID, name: supplierName.value }).select('id').single();
        if (supplierError) throw supplierError;
        supplierId = newSupplier.id;
      }
      const { error: payableError } = await supabaseClient.from('ledger_entries').insert({
        business_id: CURRENT_BUSINESS_ID, supplier_id: supplierId, direction: 'payable',
        amount_owed: total, amount_paid: 0, status: 'current', attributes: { expense_id: expense.id }
      });
      if (payableError) throw payableError;
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
                              
