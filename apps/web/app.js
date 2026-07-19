const TEST_BUSINESS_ID = "1708f447-77b8-41d4-8764-64e5843bc2a2";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
const carouselWrap = document.getElementById('carouselWrap');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let autoTimer;
let isPaused = false;

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
  autoTimer = setInterval(() => {
    if (!isPaused) goToSlide(currentSlide + 1);
  }, 6000);
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

document.getElementById('goToRecordBtn').addEventListener('click', () => {
  showScreen('bookScreen');
});
document.getElementById('backToListBtn').addEventListener('click', () => {
  showScreen('bookListScreen');
  loadBookList();
});

// ── My Book list — fetches and renders real recorded sales ──
async function loadBookList() {
  const bookList = document.getElementById('bookList');
  const emptyState = document.getElementById('emptyState');

  if (typeof supabaseClient === 'undefined') {
    bookList.innerHTML = '<p class="empty-state">Supabase is not connected yet.</p>';
    return;
  }

  bookList.innerHTML = '<p class="empty-state">Loading your book...</p>';

  try {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*, customers(name)')
      .eq('business_id', TEST_BUSINESS_ID)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!data || data.length === 0) {
      bookList.innerHTML = '<p class="empty-state">Nothing recorded yet. Tap below to add your first sale.</p>';
      return;
    }

    bookList.innerHTML = '';
    data.forEach(tx => {
      const row = document.createElement('div');
      row.className = 'book-row';

      const isOwed = tx.status === 'owed';
      const title = isOwed && tx.customers?.name
        ? `${tx.customers.name} owes you`
        : 'Sale';

      const date = new Date(tx.created_at).toLocaleDateString('en-NG', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      row.innerHTML = `
        <div class="book-row-left">
          <div class="book-row-title">${title}</div>
          <div class="book-row-date">${date}</div>
        </div>
        <div class="book-row-right">
          <div class="book-row-amount">₦${Number(tx.total_amount).toLocaleString('en-NG')}</div>
          <div class="book-row-status ${isOwed ? 'owed' : 'paid'}">${isOwed ? 'Owed' : 'Paid'}</div>
        </div>
      `;
      bookList.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    bookList.innerHTML = '<p class="empty-state">Could not load your book — check your connection.</p>';
  }
}

// ── Record a Sale form ────────────────────────────────────
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
    statusMessage.textContent = 'Supabase is not connected yet — check supabaseClient.js.';
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
      .from('items').select('id')
      .eq('business_id', TEST_BUSINESS_ID).eq('name', itemName.value)
      .maybeSingle();

    let itemId = existingItem?.id;
    if (!itemId) {
      const { data: newItem, error } = await supabaseClient
        .from('items')
        .insert({ business_id: TEST_BUSINESS_ID, name: itemName.value, unit_price: price })
        .select('id').single();
      if (error) throw error;
      itemId = newItem.id;
    }

    let customerId = null;
    if (isCredit) {
      const { data: newCustomer, error } = await supabaseClient
        .from('customers')
        .insert({ business_id: TEST_BUSINESS_ID, name: customerName.value })
        .select('id').single();
      if (error) throw error;
      customerId = newCustomer.id;
    }

    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        business_id: TEST_BUSINESS_ID, customer_id: customerId, type: 'sale',
        status: isCredit ? 'owed' : 'paid', total_amount: total,
        amount_paid: isCredit ? 0 : total, amount_owed: isCredit ? total : 0,
        channel: 'in_house'
      }).select('id').single();
    if (txError) throw txError;

    await supabaseClient.from('transaction_line_items').insert({
      transaction_id: transaction.id, item_id: itemId, quantity: qty, unit_price: price, subtotal: total
    });

    if (isCredit) {
      await supabaseClient.from('ledger_entries').insert({
        business_id: TEST_BUSINESS_ID, customer_id: customerId, linked_transaction_id: transaction.id,
        amount_owed: total, amount_paid: 0, status: 'current'
      });
    }

    await supabaseClient.from('inventory_movements').insert({
      business_id: TEST_BUSINESS_ID, item_id: itemId, type: 'sale', quantity: -qty, reason: 'Sale recorded'
    });

    statusMessage.textContent = 'Saved to My Book ✓';
    statusMessage.className = 'success';
    form.reset();
    updateTotal();
    customerField.classList.add('hidden');

    setTimeout(() => {
      showScreen('bookListScreen');
      loadBookList();
    }, 900);

  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong — check the browser console.';
    statusMessage.className = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
                 
