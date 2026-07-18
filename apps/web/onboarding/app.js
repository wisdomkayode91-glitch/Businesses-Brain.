// ── Carousel setup ──────────────────────────────────────
const carousel = document.getElementById('carousel');
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

// Create dots
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

// Update dots on scroll
carousel.addEventListener('scroll', () => {
  const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
});

// ── Carousel navigation ──────────────────────────────────
let currentSlide = 0;
const carouselNextBtn = document.getElementById('carouselNextBtn');
const skipBtn = document.getElementById('skipBtn');

carouselNextBtn.addEventListener('click', () => {
  currentSlide++;
  if (currentSlide < slides.length) {
    carousel.scrollTo({ 
      left: currentSlide * carousel.clientWidth, 
      behavior: 'smooth' 
    });
    // Update button text on last slide
    if (currentSlide === slides.length - 1) {
      carouselNextBtn.textContent = 'Get Started';
    }
  } else {
    showScreen('nameScreen');
  }
});

skipBtn.addEventListener('click', () => showScreen('nameScreen'));

// ── Screen switching ─────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Step 1: business name ────────────────────────────────
const businessNameInput = document.getElementById('businessNameInput');
const nameNextBtn = document.getElementById('nameNextBtn');
let businessName = '';

businessNameInput.addEventListener('input', () => {
  const trimmed = businessNameInput.value.trim();
  nameNextBtn.disabled = trimmed.length === 0;
  businessName = trimmed;
});

nameNextBtn.addEventListener('click', () => {
  if (businessName) {
    showScreen('typeScreen');
  }
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
    
    // Show/hide "other" input
    const isOther = selectedType === 'other';
    otherTypeLabel.classList.toggle('hidden', !isOther);
    
    // Update button state
    updateTypeNextBtn();
  });
});

otherTypeInput.addEventListener('input', updateTypeNextBtn);

function updateTypeNextBtn() {
  if (selectedType === 'other') {
    typeNextBtn.disabled = otherTypeInput.value.trim().length === 0;
  } else {
    typeNextBtn.disabled = selectedType === null;
  }
}

typeNextBtn.addEventListener('click', () => {
  showScreen('photoScreen');
});

// ── Step 3: photo onboarding ──────────────────────────────
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const noPhotoBtn = document.getElementById('noPhotoBtn');

uploadPhotoBtn.addEventListener('click', () => {
  // Real implementation: open device camera/file picker, send image to the
  // AI extraction service, then show a confirmation screen before saving.
  // Placeholder for now — wire this to your actual extraction endpoint.
  alert('📸 This opens your camera or photo library in the real build.\n\nFor now, continuing to the next step.');
  finishSetup(true);
});

noPhotoBtn.addEventListener('click', () => finishSetup(false));

// ── Complete setup ──────────────────────────────────────
function finishSetup(usedPhoto) {
  // Update the done screen with the business name
  const headline = document.getElementById('doneHeadline');
  headline.textContent = `Welcome, ${businessName || 'friend'}.`;
  
  // Store setup data in localStorage for the recorder app to use
  try {
    const setupData = {
      businessName: businessName,
      businessType: selectedType === 'other' ? otherTypeInput.value.trim() : selectedType,
      usedPhoto: usedPhoto,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('ledgermind_setup', JSON.stringify(setupData));
  } catch (e) {
    // localStorage might not be available (e.g., in some browsers)
    console.warn('Could not save setup data:', e);
  }
  
  showScreen('doneScreen');

  // TODO: this is where the actual business record gets created in Supabase —
  // insert into `businesses` with name, archetype_type (selectedType or otherTypeInput.value),
  // then redirect to apps/web/recorder/index.html with the new business id.
}

// ── Open My Book button ──────────────────────────────────
document.getElementById('openBookBtn').addEventListener('click', () => {
  // Redirect to the recorder app (My Book)
  // In production, you'd pass the business ID as a URL parameter
  window.location.href = '../recorder/index.html';
});

// ── Keyboard shortcuts (accessibility) ──────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeScreen = document.querySelector('.screen:not(.hidden)');
    if (activeScreen) {
      const primaryBtn = activeScreen.querySelector('.btn-primary:not(:disabled)');
      if (primaryBtn) primaryBtn.click();
    }
  }
});
