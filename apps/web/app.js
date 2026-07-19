<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <title>LedgerMind</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ----- RESET & BASE ----- */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #f5f3f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      padding: 16px;
    }

    /* phone frame */
    .phone {
      max-width: 400px;
      width: 100%;
      background: #ffffff;
      border-radius: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      padding: 24px 20px 32px;
      position: relative;
      transition: all 0.2s;
    }

    /* ----- BRAND HEADER (shared) ----- */
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eeece8;
    }
    .brand-logo {
      height: 40px;
      width: auto;
      border-radius: 8px;
      object-fit: contain;
      background: #f0ede8;
      padding: 4px 8px;
    }
    .brand-tagline {
      font-size: 12px;
      font-weight: 500;
      color: #6b5f52;
      letter-spacing: 0.3px;
      margin-left: auto;
      font-style: italic;
    }

    /* ----- SCREENS (show/hide) ----- */
    .screen {
      display: block;
      animation: fadeUp 0.25s ease;
    }
    .screen.hidden {
      display: none;
    }

    @keyframes fadeUp {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* ----- TYPOGRAPHY & ELEMENTS ----- */
    h1 {
      font-family: 'Fraunces', serif;
      font-weight: 600;
      font-size: 26px;
      line-height: 1.2;
      color: #1e1a16;
      margin: 8px 0 10px;
    }

    .eyebrow {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #8f7e6b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .helper {
      font-size: 15px;
      color: #5b4f42;
      margin: 4px 0 18px;
      line-height: 1.4;
    }

    p {
      color: #2f2a24;
      font-size: 15px;
      line-height: 1.5;
    }

    .btn-primary {
      background: #1e1a16;
      border: none;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      padding: 16px 20px;
      border-radius: 60px;
      width: 100%;
      cursor: pointer;
      transition: 0.2s;
      font-family: 'Inter', sans-serif;
      margin-top: 16px;
      letter-spacing: 0.3px;
    }
    .btn-primary:disabled {
      background: #cbc3ba;
      cursor: not-allowed;
      opacity: 0.7;
    }
    .btn-primary:not(:disabled):hover {
      background: #2f2a24;
    }

    .btn-text {
      background: transparent;
      border: none;
      color: #6b5f52;
      font-size: 15px;
      font-weight: 500;
      text-decoration: underline;
      cursor: pointer;
      margin-top: 20px;
      width: 100%;
      text-align: center;
      font-family: 'Inter', sans-serif;
    }

    /* ----- CAROUSEL ----- */
    .carousel-wrap {
      overflow: hidden;
      border-radius: 20px;
      background: #faf8f5;
      padding: 8px 0 4px;
      margin: 8px 0 12px;
    }
    .carousel {
      display: flex;
      transition: transform 0.3s ease;
      will-change: transform;
    }
    .slide {
      flex: 0 0 100%;
      padding: 16px 12px 4px;
    }
    .slide-icon {
      font-size: 38px;
      margin-bottom: 8px;
    }
    .slide h1 {
      font-size: 22px;
      margin-top: 0;
    }
    .slide p {
      font-size: 15px;
      color: #3b342d;
    }
    .example {
      background: #f0ebe5;
      border-left: 4px solid #b7a693;
      padding: 14px 14px;
      border-radius: 12px;
      margin: 14px 0;
      font-size: 15px;
      color: #2a241f;
      line-height: 1.4;
    }
    .works-for-line {
      margin-top: 14px;
      font-style: italic;
      color: #5b4f42;
      font-size: 14px;
      background: #efebe7;
      padding: 10px 12px;
      border-radius: 40px;
      text-align: center;
    }

    .dots {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 6px 0 12px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 20px;
      background: #d6cec5;
      transition: 0.2s;
    }
    .dot.active {
      background: #1e1a16;
      width: 24px;
    }

    .carousel-nav {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 6px;
    }
    .arrow-btn {
      background: #f0ebe5;
      border: none;
      width: 56px;
      height: 48px;
      border-radius: 60px;
      font-size: 22px;
      font-weight: 300;
      cursor: pointer;
      transition: 0.2s;
      color: #1e1a16;
    }
    .arrow-btn.active {
      background: #1e1a16;
      color: #fff;
    }
    .arrow-btn:active {
      transform: scale(0.94);
    }

    /* ----- INPUTS, FORMS ----- */
    input, select {
      width: 100%;
      padding: 14px 16px;
      border: 1.5px solid #e3ddd6;
      border-radius: 16px;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      background: #fcfaf8;
      transition: 0.15s;
      margin-top: 6px;
      color: #1e1a16;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #1e1a16;
      background: #fff;
    }
    label {
      font-weight: 500;
      font-size: 14px;
      color: #2f2a24;
      display: block;
      margin-top: 16px;
    }
    .row {
      display: flex;
      gap: 14px;
    }
    .row label {
      flex: 1;
    }

    .total-preview {
      display: flex;
      justify-content: space-between;
      background: #f2eee9;
      padding: 14px 18px;
      border-radius: 40px;
      margin: 18px 0 6px;
      font-weight: 500;
      font-size: 16px;
      color: #1e1a16;
    }
    #totalDisplay {
      font-weight: 700;
    }

    /* ----- BUSINESS TYPE GRID ----- */
    .type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0 8px;
    }
    .type-card {
      background: #f8f5f1;
      border: 2px solid transparent;
      border-radius: 20px;
      padding: 16px 8px;
      text-align: center;
      font-weight: 500;
      font-size: 15px;
      color: #1e1a16;
      cursor: pointer;
      transition: 0.15s;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .type-card span {
      font-size: 26px;
    }
    .type-card.selected {
      border-color: #1e1a16;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .type-card:active {
      transform: scale(0.96);
    }

    #otherTypeLabel {
      margin-top: 16px;
      font-weight: 500;
      color: #2f2a24;
    }
    #otherTypeLabel input {
      margin-top: 6px;
    }
    .hidden {
      display: none !important;
    }

    /* status message */
    #statusMessage {
      margin-top: 12px;
      font-size: 15px;
      color: #3a6b4b;
      text-align: center;
    }

    /* ----- RESPONSIVE TWEAKS ----- */
    @media (max-width: 420px) {
      .phone {
        padding: 16px 14px 24px;
        border-radius: 28px;
      }
      h1 { font-size: 22px; }
      .slide h1 { font-size: 20px; }
    }
  </style>
</head>
<body>

<div class="phone">

  <!-- ===== BRAND HEADER (always visible) ===== -->
  <div class="brand-header">
    <!-- if you have the actual image, replace src; otherwise placeholder -->
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' fill='%23ede8e0' rx='8'/%3E%3Ctext x='12' y='26' font-family='Inter, sans-serif' font-weight='700' font-size='20' fill='%231e1a16'%3ELedgerMind%3C/text%3E%3C/svg%3E"
         alt="LedgerMind" class="brand-logo" />
    <p class="brand-tagline">The business that understands itself</p>
  </div>

  <!-- ===== SCREEN 1: CAROUSEL ===== -->
  <div class="screen" id="carouselScreen">
    <div class="carousel-wrap" id="carouselWrap">
      <div class="carousel" id="carousel">
        <!-- slide 1 -->
        <div class="slide">
          <div class="slide-icon">📒</div>
          <h1>Everything you already use to run your business is here.</h1>
          <p>Sales, stock, expenses, customers, debts — just like your notebook.</p>
          <p class="works-for-line">Built for every kind of business — pharmacies, hotels, restaurants, mechanic workshops, salons, schools, and more.</p>
        </div>
        <!-- slide 2 -->
        <div class="slide">
          <div class="slide-icon">💡</div>
          <h1>But it doesn't just record. It understands.</h1>
          <div class="example">This batch of paracetamol expires in two days — move it to the front of the shelf so it sells before it's wasted.</div>
          <div class="example">Rice usually sells out every Thursday. Your supplier is closed tomorrow — reorder today or you'll likely lose weekend sales.</div>
          <div class="example">Room 204 already has a booking for Friday night — confirm before accepting another guest for the same date.</div>
        </div>
        <!-- slide 3 -->
        <div class="slide">
          <div class="slide-icon">🔒</div>
          <h1>Your money, your data — always yours to keep.</h1>
          <p>Nothing is ever held back from you. Download everything, anytime, in one tap.</p>
        </div>
      </div>
    </div>

    <div class="dots" id="dots"></div>

    <div class="carousel-nav">
      <button class="arrow-btn" id="prevBtn" aria-label="Previous">←</button>
      <button class="arrow-btn active" id="nextBtn" aria-label="Next">→</button>
    </div>

    <button class="btn-primary" id="getStartedBtn">Get Started</button>
  </div>

  <!-- ===== SCREEN 2: BUSINESS NAME ===== -->
  <div class="screen hidden" id="nameScreen">
    <p class="eyebrow">Step 1 of 3</p>
    <h1>What's your business called?</h1>
    <p class="helper">This is the name you'll see every time you open LedgerMind.</p>
    <input type="text" id="businessNameInput" placeholder="e.g. Adeyemi Provisions Store" />
    <button class="btn-primary" id="nameNextBtn" disabled>Continue</button>
  </div>

  <!-- ===== SCREEN 3: BUSINESS TYPE ===== -->
  <div class="screen hidden" id="typeScreen">
    <p class="eyebrow">Step 2 of 3</p>
    <h1>Which of these best describes your business?</h1>
    <p class="helper">Please choose the closest match. If nothing quite fits, select "Other" and tell us a little more.</p>
    <div class="type-grid" id="typeGrid">
      <button class="type-card" data-type="inventory_retail"><span>🛒</span>Shop / Store</button>
      <button class="type-card" data-type="pharmacy"><span>💊</span>Pharmacy</button>
      <button class="type-card" data-type="restaurant"><span>🍲</span>Restaurant</button>
      <button class="type-card" data-type="hotel"><span>🏨</span>Hotel</button>
      <button class="type-card" data-type="salon"><span>💇</span>Salon / Barber</button>
      <button class="type-card" data-type="mechanic"><span>🔧</span>Mechanic Workshop</button>
      <button class="type-card" data-type="school"><span>🎓</span>School / Training Centre</button>
      <button class="type-card" data-type="other"><span>✏️</span>Other</button>
    </div>
    <label id="otherTypeLabel" class="hidden">
      Please tell us what kind of business
      <input type="text" id="otherTypeInput" placeholder="e.g. Tailoring shop" />
    </label>
    <button class="btn-primary" id="typeNextBtn" disabled>Continue</button>
  </div>

  <!-- ===== SCREEN 4: PHOTO ONBOARDING ===== -->
  <div class="screen hidden" id="photoScreen">
    <p class="eyebrow">Step 3 of 3</p>
    <h1>Do you already keep records on paper?</h1>
    <p class="helper">Snap a photo of your stock list or sales book and we'll set it up for you — no typing needed. You'll always see exactly what we read before anything is saved.</p>
    <button class="btn-primary" id="uploadPhotoBtn">📷 Take or Upload a Photo</button>
    <button class="btn-text" id="noPhotoBtn">I'll start fresh instead</button>
  </div>

  <!-- ===== SCREEN 5: MY BOOK ===== -->
  <div class="screen hidden" id="bookScreen">
    <header>
      <p class="eyebrow" id="bookEyebrow">My Book — New Entry</p>
      <h1>Record a Sale</h1>
      <p class="helper">This is your recording space, just like your notebook.</p>
    </header>

    <form id="saleForm">
      <label>
        What did you sell?
        <input type="text" id="itemName" placeholder="e.g. Rice (50kg bag)" required />
      </label>
      <div class="row">
        <label>
          How many?
          <input type="number" id="quantity" value="1" min="1" required />
        </label>
        <label>
          Price per one (₦)
          <input type="number" id="unitPrice" placeholder="e.g. 2000" min="0" required />
        </label>
      </div>
      <label>
        How did the customer pay?
        <select id="paymentMethod">
          <option value="cash">Cash</option>
          <option value="pos">POS / Card</option>
          <option value="transfer">Bank Transfer</option>
          <option value="credit">Not yet — they'll pay later</option>
        </select>
      </label>
      <label id="customerField" class="hidden">
        Who owes you this money?
        <input type="text" id="customerName" placeholder="e.g. Chief Bola" />
      </label>
      <div class="total-preview">
        <span>Total for this sale</span>
        <span id="totalDisplay">₦0</span>
      </div>
      <button type="submit" id="submitBtn" class="btn-primary">Save to My Book</button>
      <p id="statusMessage"></p>
    </form>
  </div>

</div>

<!-- ===== JAVASCRIPT (no external deps – all logic here) ===== -->
<script>
  (function(){
    "use strict";

    // ----- DOM refs -----
    const carouselScreen = document.getElementById('carouselScreen');
    const nameScreen = document.getElementById('nameScreen');
    const typeScreen = document.getElementById('typeScreen');
    const photoScreen = document.getElementById('photoScreen');
    const bookScreen = document.getElementById('bookScreen');

    const carousel = document.getElementById('carousel');
    const dotsContainer = document.getElementById('dots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');

    const businessNameInput = document.getElementById('businessNameInput');
    const nameNextBtn = document.getElementById('nameNextBtn');

    const typeCards = document.querySelectorAll('.type-card');
    const typeNextBtn = document.getElementById('typeNextBtn');
    const otherTypeLabel = document.getElementById('otherTypeLabel');
    const otherTypeInput = document.getElementById('otherTypeInput');

    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const noPhotoBtn = document.getElementById('noPhotoBtn');

    const saleForm = document.getElementById('saleForm');
    const itemName = document.getElementById('itemName');
    const quantity = document.getElementById('quantity');
    const unitPrice = document.getElementById('unitPrice');
    const paymentMethod = document.getElementById('paymentMethod');
    const customerField = document.getElementById('customerField');
    const customerName = document.getElementById('customerName');
    const totalDisplay = document.getElementById('totalDisplay');
    const statusMsg = document.getElementById('statusMessage');

    // ----- STATE -----
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let selectedType = null;
    let businessName = '';

    // ----- CAROUSEL -----
    function renderDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === currentSlide ? ' active' : '');
        dotsContainer.appendChild(dot);
      }
    }

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;
      carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
      renderDots();
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    // init dots
    renderDots();

    // event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // keyboard / swipe not needed for this demo, but we add minimal touch support
    let touchStartX = 0;
    const wrap = document.getElementById('carouselWrap');
    wrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    wrap.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    });

    // ----- NAVIGATION -----
    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      const target = document.getElementById(screenId);
      if (target) target.classList.remove('hidden');
    }

    // Get Started -> name screen
    getStartedBtn.addEventListener('click', () => {
      showScreen('nameScreen');
    });

    // ----- BUSINESS NAME -----
    businessNameInput.addEventListener('input', function() {
      nameNextBtn.disabled = this.value.trim().length === 0;
    });

    nameNextBtn.addEventListener('click', function() {
      if (this.disabled) return;
      businessName = businessNameInput.value.trim();
      showScreen('typeScreen');
    });

    // ----- BUSINESS TYPE -----
    typeCards.forEach(card => {
      card.addEventListener('click', function() {
        typeCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedType = this.dataset.type;
        // if other, show extra input
        if (selectedType === 'other') {
          otherTypeLabel.classList.remove('hidden');
        } else {
          otherTypeLabel.classList.add('hidden');
        }
        typeNextBtn.disabled = false;
      });
    });

    otherTypeInput.addEventListener('input', function() {
      // if other selected and input not empty, enable continue
      if (selectedType === 'other') {
        typeNextBtn.disabled = this.value.trim().length === 0;
      }
    });

    typeNextBtn.addEventListener('click', function() {
      if (this.disabled) return;
      // if other, ensure input filled
      if (selectedType === 'other' && otherTypeInput.value.trim().length === 0) {
        return;
      }
      showScreen('photoScreen');
    });

    // ----- PHOTO SCREEN (skip) -----
    uploadPhotoBtn.addEventListener('click', () => {
      // in real app, trigger file picker; here we just go to book
      showScreen('bookScreen');
      document.getElementById('bookEyebrow').textContent = `📘 ${businessName || 'My Book'}`;
    });

    noPhotoBtn.addEventListener('click', () => {
      showScreen('bookScreen');
      document.getElementById('bookEyebrow').textContent = `📘 ${businessName || 'My Book'}`;
    });

    // ----- SALE FORM (total preview + credit customer) -----
    function updateTotal() {
      const qty = parseInt(quantity.value) || 0;
      const price = parseFloat(unitPrice.value) || 0;
      const total = qty * price;
      totalDisplay.textC
