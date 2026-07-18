// TEMPORARY until real login is built.
const TEST_BUSINESS_ID = "PASTE_A_TEST_BUSINESS_UUID_HERE";

// ── Screen switching ─────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Carousel: auto-advances every 6s, pauses on hover/touch ──
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselWrap = document.querySelector('.carousel-wrap');
let currentSlide = 0;
let autoTimer;
let isPaused = false;

slides.forEach((s, i) => {
  s.style.display = i === 0 ? 'block' : 'none';
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function goToSlide(index) {
  currentSlide = ((index % slides.length) + slides.length) % slides.length;
  slides.forEach((s, i) => s.style.display = i === currentSlide ? 'block' : 'none');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function startAutoAdvance() {
  if (autoTimer) clearInterval(autoTimer);
  if (!isPaused) {
    autoTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
  }
}
function resetAutoAdvance() {
  clearInterval(autoTimer);
  startAutoAdvance();
}

// ── Pause on hover (desktop) ──
carouselWrap.addEventListener('mouseenter', () => {
  isPaused = true;
  clearInterval(autoTimer);
});
carouselWrap.addEventListener('mouseleave', () => {
  isPaused = false;
  startAutoAdvance();
});

// ── Pause on touch (mobile) ──
carouselWrap.addEventListener('touchstart', () => {
  isPaused = true;
  clearInterval(autoTimer);
});
carouselWrap.addEventListener('touchend', () => {
  isPaused = false;
  startAutoAdvance();
});
carouselWrap.addEventListener('touchcancel', () => {
  isPaused = false;
  startAutoAdvance();
});

// Arrow buttons
prevBtn.addEventListener('click', () => {
  goToSlide(currentSlide - 1);
  resetAutoAdvance();
});
nextBtn.addEventListener('click', () => {
  goToSlide(currentSlide + 1);
  resetAutoAdvance();
});

startAutoAdvance();

document.getElementById('getStartedBtn').addEventListener('click', () => {
  clearInterval(autoTimer);
  showScreen('nameScreen');
});

// ── Step 1: business name ────────────────────────────────
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

// ── Step 2: business type ────────────────────────────────
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

// ── Step 3: photo onboarding → straight into My Book, same page ──
document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
  alert('This opens your camera or photo library in the real build.');
  enterMyBook();
});
document.getElementById('noPhotoBtn').addEventListener('click', enterMyBook);

function enterMyBook() {
  showScreen('bookScreen');
}

// ── My Book — the real recorder ──────────────────────────
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

  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong — check the browser console.';
    statusMessage.className = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
