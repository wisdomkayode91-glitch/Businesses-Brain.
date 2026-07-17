<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Briefing · Sales insights</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: #f4f7fc;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
    }

    .card {
      max-width: 640px;
      width: 100%;
      background: white;
      border-radius: 2.5rem;
      padding: 2rem 2rem 2.5rem;
      box-shadow: 0 20px 40px -12px rgba(0, 20, 40, 0.25);
      transition: box-shadow 0.2s;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.6rem;
      font-weight: 600;
      letter-spacing: -0.3px;
      color: #0b1a33;
      margin-bottom: 1.5rem;
    }

    .badge {
      background: #dbeafe;
      color: #1a4c8a;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.8rem;
      border-radius: 40px;
      margin-left: 0.5rem;
    }

    .insight-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .insight {
      background: #f8faff;
      border-radius: 1.8rem;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      border: 1px solid #e9eef6;
      box-shadow: 0 4px 8px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }

    .insight.positive {
      background: #f2f9f5;
      border-color: #c6e0d4;
    }

    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: #2f8f6d;
      border-radius: 20px;
      margin-top: 5px;
      flex-shrink: 0;
      box-shadow: 0 0 0 3px #d6f0e4;
    }

    .insight p {
      font-size: 1rem;
      line-height: 1.5;
      color: #1a2b44;
      margin: 0;
    }

    .insight strong {
      color: #0b2b4a;
      font-weight: 700;
    }

    .insight .dot.orange {
      background: #d97c2b;
      box-shadow: 0 0 0 3px #f9e3cd;
    }

    .action-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.5rem;
      border-top: 1px solid #e6edf6;
      padding-top: 1.8rem;
    }

    .btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn {
      background: white;
      border: 1px solid #d4dfeb;
      padding: 0.7rem 1.6rem;
      border-radius: 60px;
      font-weight: 500;
      font-size: 0.95rem;
      color: #1f3b5c;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .btn-primary {
      background: #1f3b5c;
      border: 1px solid #1f3b5c;
      color: white;
      box-shadow: 0 6px 12px -6px rgba(20, 50, 90, 0.25);
    }

    .btn-primary:hover {
      background: #143049;
      border-color: #143049;
      transform: scale(0.97);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #d4dfeb;
    }

    .btn-outline:hover {
      background: #edf3fa;
      border-color: #b6c9dd;
    }

    .btn .icon {
      font-size: 1.1rem;
      line-height: 1;
    }

    #extraInsight {
      animation: fadeSlide 0.25s ease-out;
    }

    @keyframes fadeSlide {
      0% { opacity: 0; transform: translateY(-6px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .footer-note {
      font-size: 0.8rem;
      color: #5f7394;
      margin-top: 0.2rem;
      letter-spacing: 0.2px;
    }

    /* mobile fine-tune */
    @media (max-width: 480px) {
      .card { padding: 1.5rem; }
      .action-bar { flex-direction: column; align-items: stretch; }
      .btn-group { width: 100%; justify-content: stretch; }
      .btn-group .btn { flex: 1; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>
      ⚡ Daily briefing
      <span class="badge">3 insights</span>
    </h2>

    <div class="insight-list" id="insights">
      <!-- default insights (static) -->
      <div class="insight">
        <span class="dot"></span>
        <p><strong>+18%</strong> revenue vs last week — top performer: <strong>Pro plan</strong></p>
      </div>
      <div class="insight">
        <span class="dot orange"></span>
        <p><strong>3 support tickets</strong> about payment errors — check Stripe logs.</p>
      </div>
    </div>

    <!-- action bar -->
    <div class="action-bar">
      <div class="btn-group">
        <button class="btn btn-outline" id="toggleBtn">View full briefing</button>
        <button class="btn btn-primary" id="recordSaleBtn">
          <span class="icon">＋</span> Record Sale
        </button>
      </div>
      <div class="footer-note">• last updated 2 min ago</div>
    </div>
  </div>

  <script>
    (function() {
      // ----- references -----
      const toggleBtn = document.getElementById('toggleBtn');
      const insights = document.getElementById('insights');
      const recordSaleBtn = document.getElementById('recordSaleBtn');

      // ----- state -----
      let expanded = false;
      const EXTRA_ID = 'extraInsight';

      // ----- toggle logic -----
      function toggleBriefing() {
        expanded = !expanded;
        toggleBtn.textContent = expanded ? 'Show less' : 'View full briefing';

        const existingExtra = document.getElementById(EXTRA_ID);

        if (expanded) {
          // only add if not already present (prevent duplicates)
          if (!existingExtra) {
            const extra = document.createElement('div');
            extra.className = 'insight positive';
            extra.style.animationDelay = '0s';
            extra.id = EXTRA_ID;
            extra.innerHTML = `
              <span class="dot"></span>
              <p>You have <strong>2 customers</strong> who usually buy weekly but haven't returned in 10 days — worth a quick check-in.</p>
            `;
            insights.appendChild(extra);
          }
        } else {
          if (existingExtra) {
            existingExtra.remove();
          }
        }
      }

      // ----- record sale (with reset) -----
      function recordSale() {
        // disable double-click spam
        if (recordSaleBtn.disabled) return;
        recordSaleBtn.disabled = true;

        // change button appearance
        recordSaleBtn.textContent = 'Sale recorded ✓';
        recordSaleBtn.style.opacity = '0.8';

        // reset after 1.2s
        setTimeout(() => {
          recordSaleBtn.innerHTML = '<span class="icon">＋</span> Record Sale';
          recordSaleBtn.style.opacity = '1';
          recordSaleBtn.disabled = false;
        }, 1200);
      }

      // ----- attach events -----
      toggleBtn.addEventListener('click', toggleBriefing);
      recordSaleBtn.addEventListener('click', recordSale);

      // (optional) if you want to ensure the extra insight is never duplicated
      // on page load we're fine – but if the user clicks quickly, guard works
      // also handle if toggleBtn is clicked twice rapidly: no duplicate because we check by id
    })();
  </script>
</body>
</html>
