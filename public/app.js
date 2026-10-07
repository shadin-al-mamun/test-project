/* ==========================================================================
   Bachelor Home Hostel ERP - Client Application Logic (app.js)
   Fully Integrated with REST API, Cutoff Engine, and Bilingual Translation
   ========================================================================== */

// App State
const state = {
  currentTab: 'dashboard-view',
  lang: 'bn', // 'bn' | 'en'
  simulatedAfter10: false,
  token: null,
  user: null,
  seatsData: null,
  mealsData: null,
  bazaarData: null,
  invoicesData: null,
  accountsData: null,
  auditLogs: []
};

// Bilingual Dictionary
const i18n = {
  bn: {
    menu_dashboard: "ড্যাশবোর্ড (Overview)",
    menu_seats: "সিট ম্যাট্রিক্স (Seats)",
    menu_meals: "মিল খাতা (Meals)",
    menu_bazaar: "বাজার খরচ (Bazaar)",
    menu_billing: "ভাড়া ও বিলিং (Finance)",
    menu_reports: "রিপোর্ট ও গুগল শিট",
    menu_portal: "বর্ডার মোবাইল ভিউ",
    cutoff_label: "রাত ১০টা কাট-অফ বাকি",
    sim_before: "সময় সিমুলেটর: রাত ৯:১৫ (কাট-অফের পূর্বে)",
    sim_after: "সময় সিমুলেটর: রাত ১০:১৫ (লক্ড - কাট-অফ অতিক্রান্ত)",
    kpi_total_seats: "মোট সিট সংখ্যা",
    kpi_available_seats: "ফাঁকা (খালি) সিট",
    kpi_today_meals: "আজকের সর্বমোট মিল",
    kpi_total_dues: "চলতি বকেয়া টাকা",
    banner_title: "দ্রুত মেস অপারেশন ও কার্যসম্পাদন",
    banner_desc: "নতুন বর্ডার ভর্তি, দৈনিক বাজার হিসাব, বা বকেয়া ভাড়া আদায়ের রসিদ তাৎক্ষণিক তৈরি করুন।",
    btn_add_border: "নতুন বর্ডার ভর্তি",
    btn_add_bazaar: "বাজার খরচ এন্ট্রি",
    btn_collect_rent: "ভাড়া আদায় ও মানি রসিদ"
  },
  en: {
    menu_dashboard: "Dashboard (Overview)",
    menu_seats: "Seat Matrix (Seats)",
    menu_meals: "Daily Meals (Meals)",
    menu_bazaar: "Bazaar Expenses",
    menu_billing: "Billing & Finance",
    menu_reports: "Reports & Google Sheets",
    menu_portal: "Border Mobile View",
    cutoff_label: "10 PM Cutoff Remaining",
    sim_before: "Time Sim: 9:15 PM (Before Cutoff)",
    sim_after: "Time Sim: 10:15 PM (LOCKED - After Cutoff)",
    kpi_total_seats: "Total Bed Capacity",
    kpi_available_seats: "Available Vacant Seats",
    kpi_today_meals: "Total Today's Meals",
    kpi_total_dues: "Total Pending Dues",
    banner_title: "Fast Mess Operations & Actions",
    banner_desc: "Onboard new borders, record daily bazaar grocery, or collect dues instantly.",
    btn_add_border: "Onboard Border",
    btn_add_bazaar: "Add Bazaar Expense",
    btn_collect_rent: "Collect Rent & Receipt"
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSimulationToggle();
  setupLanguageToggle();
  setupModals();
  setupFormSubmissions();
  startCutoffTimer();
  initAuth();
});

// Setup Navigation Tabs
function setupNavigation() {
  const sidebarButtons = document.querySelectorAll('#sidebar-menu .menu-item');
  const mobileButtons = document.querySelectorAll('#mobile-bottom-nav .mobile-nav-item');

  function switchTab(targetId) {
    state.currentTab = targetId;

    // Toggle Tab Views
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    const activeView = document.getElementById(targetId);
    if (activeView) activeView.classList.add('active');

    // Update Sidebar Active state
    sidebarButtons.forEach(li => {
      li.classList.toggle('active', li.getAttribute('data-tab') === targetId);
    });

    // Update Mobile Nav Active state
    mobileButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetId);
    });

    // Update Header title
    const titles = {
      'dashboard-view': state.lang === 'bn' ? 'ড্যাশবোর্ড ও হোস্টেল ওভারভিউ' : 'Hostel Overview Dashboard',
      'seat-matrix-view': state.lang === 'bn' ? 'ভিজ্যুয়াল সিট বিন্যাস ও অকুপেন্সি' : 'Visual Seat Layout & Occupancy',
      'meals-view': state.lang === 'bn' ? 'দৈনিক মেস মিল খাতা ও রস্টার' : 'Daily Meal Roster & 10 PM Cutoff',
      'bazaar-view': state.lang === 'bn' ? 'মেসের বাজার খরচ ও ভাউচার' : 'Daily Bazaar Grocery Expenses',
      'billing-view': state.lang === 'bn' ? 'মাসিক ভাড়া ও পেমেন্ট রসিদ' : 'Monthly Rent & Payment Receipts',
      'reports-view': state.lang === 'bn' ? 'রিপোর্ট ও গুগল শিট ক্লাউড সিঙ্ক' : 'Reports & Google Sheets Cloud Sync',
      'border-portal-view': state.lang === 'bn' ? 'বর্ডার সেলফ-সার্ভিস মোবাইল পোর্টাল' : 'Border Self-Service Mobile Portal'
    };
    document.getElementById('current-page-title').textContent = titles[targetId] || 'Bachelor Home ERP';
  }

  sidebarButtons.forEach(li => {
    li.addEventListener('click', () => switchTab(li.getAttribute('data-tab')));
  });

  mobileButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Dashboard Quick Action Buttons
  document.getElementById('btn-quick-add-border')?.addEventListener('click', () => openModal('modal-add-border'));
  document.getElementById('btn-open-add-border-modal')?.addEventListener('click', () => openModal('modal-add-border'));
  document.getElementById('btn-quick-add-bazaar')?.addEventListener('click', () => openModal('modal-add-bazaar'));
  document.getElementById('btn-open-add-bazaar-modal')?.addEventListener('click', () => openModal('modal-add-bazaar'));
  document.getElementById('btn-quick-collect-rent')?.addEventListener('click', () => openModal('modal-collect-payment'));
  document.getElementById('btn-open-payment-modal')?.addEventListener('click', () => openModal('modal-collect-payment'));
  document.getElementById('btn-open-override-modal')?.addEventListener('click', () => openModal('modal-override-meal'));
}

// 10 PM Cutoff Timer Engine
function startCutoffTimer() {
  const timerEl = document.getElementById('cutoff-countdown-timer');
  const mobileTimerEl = document.getElementById('mobile-cutoff-timer');

  function update() {
    if (state.simulatedAfter10) {
      if (timerEl) timerEl.textContent = "00:00:00 (লক্ড)";
      if (mobileTimerEl) mobileTimerEl.textContent = "00:00:00 (লক্ড)";
      return;
    }

    const now = new Date();
    const target = new Date();
    target.setHours(22, 0, 0, 0); // 10:00:00 PM

    let diff = target - now;
    if (diff <= 0) {
      // Past 10 PM in real time
      if (timerEl) timerEl.textContent = "00:00:00 (লক্ড)";
      if (mobileTimerEl) mobileTimerEl.textContent = "00:00:00 (লক্ড)";
    } else {
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      const str = `${hours}:${mins}:${secs}`;
      if (timerEl) timerEl.textContent = str;
      if (mobileTimerEl) mobileTimerEl.textContent = str;
    }
  }

  update();
  setInterval(update, 1000);
}

// Simulation Mode: Before 10 PM vs After 10 PM
function setupSimulationToggle() {
  const simPill = document.getElementById('btn-toggle-simulation');
  const simText = document.getElementById('sim-text');
  const simIcon = document.getElementById('sim-icon');

  simPill.addEventListener('click', () => {
    state.simulatedAfter10 = !state.simulatedAfter10;
    
    if (state.simulatedAfter10) {
      simText.textContent = state.lang === 'bn' ? i18n.bn.sim_after : i18n.en.sim_after;
      simIcon.textContent = "🔒";
      simPill.style.background = "rgba(239, 68, 68, 0.2)";
      simPill.style.borderColor = "rgba(239, 68, 68, 0.5)";
      simPill.style.color = "#fca5a5";
      
      document.getElementById('dash-lock-badge').textContent = "🔒 রাত ১০টা লক সক্রিয়";
      document.getElementById('dash-lock-badge').className = "badge badge-occupied";
      document.getElementById('meal-cutoff-status-tag').textContent = "🔒 রাত ১০:০০ অতিক্রান্ত - পরিবর্তন বন্ধ";
      document.getElementById('meal-cutoff-status-tag').className = "badge badge-occupied";
    } else {
      simText.textContent = state.lang === 'bn' ? i18n.bn.sim_before : i18n.en.sim_before;
      simIcon.textContent = "⏳";
      simPill.style.background = "rgba(139, 92, 246, 0.12)";
      simPill.style.borderColor = "rgba(139, 92, 246, 0.3)";
      simPill.style.color = "#c4b5fd";
      
      document.getElementById('dash-lock-badge').textContent = "কাট-অফ চলছে";
      document.getElementById('dash-lock-badge').className = "badge badge-booked";
      document.getElementById('meal-cutoff-status-tag').textContent = "কাট-অফ সময়: রাত ১০:০০ পর্যন্ত উন্মুক্ত";
      document.getElementById('meal-cutoff-status-tag').className = "badge badge-booked";
    }

    renderMealsRoster();
  });
}

// Bilingual Toggle
function setupLanguageToggle() {
  const btn = document.getElementById('btn-language-toggle');
  const flag = document.getElementById('lang-flag');
  const label = document.getElementById('lang-label');

  btn.addEventListener('click', () => {
    state.lang = state.lang === 'bn' ? 'en' : 'bn';
    flag.textContent = state.lang === 'bn' ? '🇧🇩' : '🇬🇧';
    label.textContent = state.lang === 'bn' ? 'English' : 'বাংলা';

    // Update static translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[state.lang][key]) {
        el.textContent = i18n[state.lang][key];
      }
    });

    // Update simulation badge text
    const simText = document.getElementById('sim-text');
    simText.textContent = state.simulatedAfter10 ? i18n[state.lang].sim_after : i18n[state.lang].sim_before;

    updateUserDisplay();
  });
}

// Modal Handlers
function setupModals() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Click outside to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// Authentication & Session Management
function initAuth() {
  window.quickAdminFill = function(phone, pass) {
    const idEl = document.getElementById('erp-login-id');
    const passEl = document.getElementById('erp-login-pass');
    const errEl = document.getElementById('erp-login-error');
    if (idEl) idEl.value = phone;
    if (passEl) passEl.value = pass;
    if (errEl) errEl.style.display = 'none';
    const submitBtn = document.getElementById('btn-erp-login-submit');
    if (submitBtn) {
      submitBtn.style.transform = 'scale(1.02)';
      setTimeout(() => { if (submitBtn) submitBtn.style.transform = ''; }, 200);
    }
  };

  const loginScreen = document.getElementById('erp-admin-login-screen');
  const loginForm = document.getElementById('form-erp-login');
  const errEl = document.getElementById('erp-login-error');
  const submitBtn = document.getElementById('btn-erp-login-submit');

  // Check saved session
  const savedSessionRaw = localStorage.getItem('bachelor_erp_session');
  if (savedSessionRaw) {
    try {
      const session = JSON.parse(savedSessionRaw);
      if (session && session.token && session.user) {
        state.token = session.token;
        state.user = session.user;
        updateUserDisplay();
        if (loginScreen) loginScreen.style.display = 'none';
        fetchAllData();
        setupAuthEventListeners();
        return;
      }
    } catch (e) {
      console.warn("Invalid session token in storage", e);
    }
  }

  // Not logged in -> Show login screen
  if (loginScreen) loginScreen.style.display = 'flex';
  setupAuthEventListeners();

  function setupAuthEventListeners() {
    // Handle Login form submit
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idVal = document.getElementById('erp-login-id').value.trim();
      const passVal = document.getElementById('erp-login-pass').value.trim();

      if (!idVal || !passVal) {
        if (errEl) {
          errEl.textContent = 'অনুগ্রহ করে ইউজার আইডি ও পাসওয়ার্ড পূরণ করুন।';
          errEl.style.display = 'block';
        }
        return;
      }

      if (errEl) errEl.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>লগইন যাচাই হচ্ছে... ⏳</span>';
      }

      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: idVal, password: passVal })
        }).then(r => r.json());

        if (res.success && res.data) {
          state.token = res.data.token;
          state.user = res.data.user;
          localStorage.setItem('bachelor_erp_session', JSON.stringify(res.data));
          updateUserDisplay();
          if (loginScreen) loginScreen.style.display = 'none';
          fetchAllData();
        } else {
          if (errEl) {
            errEl.textContent = res.message || 'ভুল ইউজার আইডি বা পাসওয়ার্ড!';
            errEl.style.display = 'block';
          }
        }
      } catch (err) {
        console.error(err);
        if (errEl) {
          errEl.textContent = 'সার্ভারে সংযোগ করা সম্ভব হয়নি। আবার চেষ্টা করুন।';
          errEl.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>🔐 সিস্টেমে প্রবেশ করুন</span>';
        }
      }
    });

    // Logout handler
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      const confirmMsg = state.lang === 'bn' 
        ? 'আপনি কি নিশ্চিত যে হোস্টেল ইআরপি সিস্টেম থেকে লগআউট করতে চান?' 
        : 'Are you sure you want to log out from Bachelor Home ERP?';
      if (confirm(confirmMsg)) {
        localStorage.removeItem('bachelor_erp_session');
        state.token = null;
        state.user = null;
        if (loginForm) loginForm.reset();
        if (errEl) errEl.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        // Reset user display
        const nameEl = document.getElementById('user-name-display');
        const roleEl = document.getElementById('user-role-display');
        const avatarEl = document.getElementById('user-avatar-initial');
        if (nameEl) nameEl.textContent = 'লগইন করুন';
        if (roleEl) roleEl.textContent = 'অননুমোদিত';
        if (avatarEl) avatarEl.textContent = '?';
      }
    });
  }
}

function updateUserDisplay() {
  if (!state.user) return;
  const nameEl = document.getElementById('user-name-display');
  const roleEl = document.getElementById('user-role-display');
  const avatarEl = document.getElementById('user-avatar-initial');

  if (nameEl) nameEl.textContent = state.user.name;

  const roleLabels = {
    SUPER_ADMIN: { bn: '👑 সুপার অ্যাডমিন', en: '👑 Super Admin' },
    MANAGER: { bn: '📋 মেস ম্যানেজার', en: '📋 Manager' },
    ACCOUNTANT: { bn: '💰 অ্যাকাউন্ট্যান্ট', en: '💰 Accountant' },
    STAFF: { bn: '🍳 মেস বাবুর্চি / স্টাফ', en: '🍳 Mess Staff' }
  };

  const rConf = roleLabels[state.user.role] || { bn: state.user.role, en: state.user.role };
  if (roleEl) roleEl.textContent = state.lang === 'bn' ? rConf.bn : rConf.en;

  if (avatarEl) {
    const firstChar = state.user.name ? state.user.name.trim().charAt(0) : 'U';
    avatarEl.textContent = firstChar;
  }
}

function authFetch(url, options = {}) {
  const headers = options.headers || {};
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  return fetch(url, { ...options, headers });
}

// Fetch All API Data
async function fetchAllData() {
  try {
    const [seatsRes, mealsRes, bazaarRes, invoicesRes, accountsRes, auditRes] = await Promise.all([
      authFetch('/api/v1/seats/occupancy-matrix').then(r => r.json()),
      authFetch('/api/v1/meals/daily-sheet?date=2026-10-08').then(r => r.json()),
      authFetch('/api/v1/bazaar-expenses').then(r => r.json()),
      authFetch('/api/v1/invoices').then(r => r.json()),
      authFetch('/api/v1/accounts').then(r => r.json()),
      authFetch('/api/v1/audit-logs').then(r => r.json())
    ]);

    if (seatsRes.success) {
      state.seatsData = seatsRes.data;
      renderSeatsMatrix();
      updateDashboardKPIs();
    }

    if (mealsRes.success) {
      state.mealsData = mealsRes.data;
      renderMealsRoster();
      populateOverrideDropdown();
    }

    if (bazaarRes.success) {
      state.bazaarData = bazaarRes.data;
      renderBazaarTable();
    }

    if (invoicesRes.success) {
      state.invoicesData = invoicesRes.data;
      renderInvoicesTable();
      populatePaymentDropdown();
    }

    if (accountsRes.success) {
      state.accountsData = accountsRes.data;
      renderAccounts();
    }

    if (auditRes.success) {
      state.auditLogs = auditRes.data;
      renderAuditLogs();
    }
  } catch (err) {
    console.error("API Fetch Error:", err);
  }
}

// 1. Render Dashboard KPIs
function updateDashboardKPIs() {
  if (!state.seatsData || !state.invoicesData || !state.mealsData) return;

  const summary = state.seatsData.summary;
  document.getElementById('kpi-total-seats').textContent = summary.totalSeats;
  document.getElementById('kpi-occupancy-rate').textContent = summary.occupancyRate + '%';
  document.getElementById('kpi-available-seats').textContent = summary.available;
  document.getElementById('kpi-booked-seats').textContent = summary.booked + ' টি';

  // Invoices summary
  const invSummary = state.invoicesData.summary;
  document.getElementById('kpi-total-dues').textContent = '৳ ' + invSummary.totalDue.toLocaleString();

  // Meals summary
  const grandMeals = state.mealsData.totals.grandTotal;
  document.getElementById('kpi-today-meals').textContent = grandMeals;

  // Kitchen Requisition
  const estRice = (grandMeals * 0.15).toFixed(2);
  const estMeat = (grandMeals * 0.12).toFixed(2);
  document.getElementById('req-rice-kg').textContent = estRice + ' কেজি';
  document.getElementById('req-meat-kg').textContent = estMeat + ' কেজি';
}

// 2. Render Seat Matrix View
function renderSeatsMatrix() {
  const container = document.getElementById('seat-matrix-container');
  if (!container || !state.seatsData) return;

  container.innerHTML = '';

  state.seatsData.matrix.forEach(bld => {
    bld.flats.forEach(flt => {
      const flatSection = document.createElement('div');
      flatSection.className = 'flat-section';

      const flatTitle = document.createElement('div');
      flatTitle.className = 'flat-title';
      flatTitle.innerHTML = `<span>🏢 ${bld.name} &bull; ${flt.flatNumber}</span>`;
      flatSection.appendChild(flatTitle);

      const roomGrid = document.createElement('div');
      roomGrid.className = 'room-grid';

      flt.rooms.forEach(rm => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';

        const roomHeader = document.createElement('div');
        roomHeader.className = 'room-card-header';
        roomHeader.innerHTML = `
          <span class="room-name">${rm.roomNumber} (${rm.capacity} সিট)</span>
          <span class="room-badge-ac">${rm.hasAc ? '❄️ এসি' : 'নন-এসি'} &bull; ${rm.hasBath ? 'এটাচড বাথ' : 'কমন বাথ'}</span>
        `;
        roomCard.appendChild(roomHeader);

        const seatList = document.createElement('div');
        seatList.className = 'seat-list';

        rm.seats.forEach(st => {
          const seatCard = document.createElement('div');
          seatCard.className = `seat-card status-${st.status}`;

          let badgeHtml = '';
          if (st.status === 'AVAILABLE') badgeHtml = `<span class="badge badge-available">খালি</span>`;
          else if (st.status === 'OCCUPIED') badgeHtml = `<span class="badge badge-occupied">বরাদ্দকৃত</span>`;
          else if (st.status === 'BOOKED') badgeHtml = `<span class="badge badge-booked">বুকড</span>`;
          else badgeHtml = `<span class="badge badge-maintenance">মেরামত</span>`;

          seatCard.innerHTML = `
            <div>
              <div class="seat-info-title">${st.seatCode} (${st.label})</div>
              <div class="seat-border-name">${st.border ? '👤 ' + st.border.name + ' (' + st.border.phone + ')' : 'কোনো বর্ডার বরাদ্দ নেই'}</div>
            </div>
            <div style="text-align: right;">
              <div class="seat-price">৳ ${st.baseRent.toLocaleString()}</div>
              <div>${badgeHtml}</div>
            </div>
          `;
          seatList.appendChild(seatCard);
        });

        roomCard.appendChild(seatList);
        roomGrid.appendChild(roomCard);
      });

      flatSection.appendChild(roomGrid);
      container.appendChild(flatSection);
    });
  });
}

// 3. Render Meals Roster Table
function renderMealsRoster() {
  const tbody = document.getElementById('meals-roster-tbody');
  if (!tbody || !state.mealsData) return;

  tbody.innerHTML = '';

  state.mealsData.rows.forEach(r => {
    const tr = document.createElement('tr');

    const totalPts = r.breakfast + r.lunch + r.dinner + r.guest;
    const isLocked = state.simulatedAfter10;

    tr.innerHTML = `
      <td>
        <strong>${r.borderName}</strong>
      </td>
      <td><code>${r.seatCode}</code></td>
      <td style="text-align: center;">
        <button class="meal-toggle-btn ${r.breakfast > 0 ? 'active-on' : 'active-off'}" 
          ${isLocked ? 'disabled title="রাত ১০টা অতিক্রান্ত - লক্ড"' : ''}
          onclick="handleMealToggle('${r.borderId}', 'breakfast', ${r.breakfast > 0 ? 0 : 1})">
          ${r.breakfast > 0 ? '১' : '০'}
        </button>
      </td>
      <td style="text-align: center;">
        <button class="meal-toggle-btn ${r.lunch > 0 ? 'active-on' : 'active-off'}" 
          ${isLocked ? 'disabled title="রাত ১০টা অতিক্রান্ত - লক্ড"' : ''}
          onclick="handleMealToggle('${r.borderId}', 'lunch', ${r.lunch > 0 ? 0 : 1})">
          ${r.lunch > 0 ? '১' : '০'}
        </button>
      </td>
      <td style="text-align: center;">
        <button class="meal-toggle-btn ${r.dinner > 0 ? 'active-on' : 'active-off'}" 
          ${isLocked ? 'disabled title="রাত ১০টা অতিক্রান্ত - লক্ড"' : ''}
          onclick="handleMealToggle('${r.borderId}', 'dinner', ${r.dinner > 0 ? 0 : 1})">
          ${r.dinner > 0 ? '১' : '০'}
        </button>
      </td>
      <td style="text-align: center;">
        <span style="font-weight: 700; color: #fbbf24;">${r.guest}</span>
      </td>
      <td style="text-align: center; font-weight: 800; font-size: 15px; color: #60a5fa;">
        ${totalPts}
      </td>
      <td style="text-align: center;">
        ${isLocked ? 
          `<button class="btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="openOverrideForBorder('${r.borderId}')">ওভাররাইড</button>` : 
          `<span style="color: #34d399; font-size: 12px;">উন্মুক্ত</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Handle Meal Toggle Click
window.handleMealToggle = async function(borderId, mealType, value) {
  if (state.simulatedAfter10) {
    alert("⚠️ রাত ১০:০০ টার পর পরদিনের মিল পরিবর্তন স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে। প্রয়োজনে ম্যানেজারের ওভাররাইড অপশন ব্যবহার করুন।");
    return;
  }

  try {
    const res = await fetch('/api/v1/meals/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        borderId,
        date: "2026-10-08",
        mealType,
        value,
        simulatedAfter10: false
      })
    }).then(r => r.json());

    if (res.success) {
      // Refresh meals
      const fresh = await fetch('/api/v1/meals/daily-sheet?date=2026-10-08').then(r => r.json());
      if (fresh.success) {
        state.mealsData = fresh.data;
        renderMealsRoster();
        updateDashboardKPIs();
      }
    } else {
      alert(res.error?.message || "এরর ঘটেছে");
    }
  } catch (err) {
    console.error("Meal Toggle Failed:", err);
  }
};

window.openOverrideForBorder = function(borderId) {
  document.getElementById('override-border-id').value = borderId;
  openModal('modal-override-meal');
};

function populateOverrideDropdown() {
  const sel = document.getElementById('override-border-id');
  if (!sel || !state.mealsData) return;
  sel.innerHTML = '';
  state.mealsData.rows.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.borderId;
    opt.textContent = `${r.borderName} (${r.seatCode})`;
    sel.appendChild(opt);
  });
}

// 4. Render Bazaar Expenses Table
function renderBazaarTable() {
  const tbody = document.getElementById('bazaar-tbody');
  if (!tbody || !state.bazaarData) return;

  tbody.innerHTML = '';
  document.getElementById('total-bazaar-display').textContent = '৳ ' + state.bazaarData.totalAmount.toLocaleString();

  state.bazaarData.expenses.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.date}</td>
      <td><span class="badge badge-booked">${b.category}</span></td>
      <td>${b.description}</td>
      <td><strong style="color: #60a5fa;">৳ ${b.amount.toLocaleString()}</strong></td>
      <td>${b.payer}</td>
      <td><span class="badge badge-paid">অনুমোদিত</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 5. Render Invoices Table
function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody || !state.invoicesData) return;

  tbody.innerHTML = '';

  state.invoicesData.invoices.forEach(inv => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-unpaid';
    let statusText = 'বকেয়া';
    if (inv.status === 'PAID') { badgeClass = 'badge-paid'; statusText = 'পরিশোধিত'; }
    else if (inv.status === 'PARTIAL') { badgeClass = 'badge-partial'; statusText = 'আংশিক'; }

    tr.innerHTML = `
      <td><code>${inv.invoiceNo}</code></td>
      <td><strong>${inv.borderName}</strong></td>
      <td>${inv.seatCode}</td>
      <td>৳ ${inv.seatRent.toLocaleString()}</td>
      <td>৳ ${inv.estimatedMeals.toLocaleString()}</td>
      <td>৳ ${inv.utilities.toLocaleString()}</td>
      <td><strong>৳ ${inv.totalAmount.toLocaleString()}</strong></td>
      <td style="color: #34d399;">৳ ${inv.paidAmount.toLocaleString()}</td>
      <td style="color: #f87171; font-weight: 700;">৳ ${inv.dueAmount.toLocaleString()}</td>
      <td><span class="badge ${badgeClass}">${statusText}</span></td>
      <td>
        ${inv.dueAmount > 0 ? 
          `<button class="btn-success" style="padding: 4px 10px; font-size: 11px;" onclick="openPaymentForInvoice('${inv.id}', ${inv.dueAmount})">আদায়</button>` :
          `<span style="color: #34d399; font-size: 12px;">ক্লিয়ার</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.openPaymentForInvoice = function(invId, dueAmt) {
  const sel = document.getElementById('payment-invoice-select');
  sel.value = invId;
  document.getElementById('payment-amount').value = dueAmt;
  openModal('modal-collect-payment');
};

function populatePaymentDropdown() {
  const sel = document.getElementById('payment-invoice-select');
  if (!sel || !state.invoicesData) return;
  sel.innerHTML = '';
  state.invoicesData.invoices.forEach(i => {
    const opt = document.createElement('option');
    opt.value = i.id;
    opt.textContent = `${i.invoiceNo} - ${i.borderName} (বকেয়া: ৳ ${i.dueAmount})`;
    sel.appendChild(opt);
  });
}

// 6. Render Accounts in Reports
function renderAccounts() {
  const grid = document.getElementById('accounts-grid');
  if (!grid || !state.accountsData) return;

  grid.innerHTML = '';

  state.accountsData.accounts.forEach(acc => {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.style.setProperty('--card-accent', acc.type === 'BKASH' ? '#ec4899' : '#10b981');
    card.innerHTML = `
      <div class="kpi-header">
        <span class="kpi-title">${acc.name}</span>
        <span class="kpi-icon-wrap">${acc.type === 'BKASH' ? '📱' : acc.type === 'CASH' ? '💵' : '🏦'}</span>
      </div>
      <div class="kpi-value" style="color: #34d399;">৳ ${acc.balance.toLocaleString()}</div>
      <div class="kpi-meta">লাইভ ফান্ড ব্যালেন্স</div>
    `;
    grid.appendChild(card);
  });
}

// 7. Render Audit Logs
function renderAuditLogs() {
  const container = document.getElementById('audit-log-feed');
  if (!container) return;

  container.innerHTML = '';
  state.auditLogs.slice(0, 5).forEach(log => {
    const item = document.createElement('div');
    item.style.padding = '10px 12px';
    item.style.background = 'rgba(255, 255, 255, 0.02)';
    item.style.border = '1px solid var(--border-glass)';
    item.style.borderRadius = 'var(--radius-sm)';
    item.style.fontSize = '12.5px';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <strong style="color: #93c5fd;">${log.user}</strong>
        <span style="color: var(--text-dim); font-size: 11px;">${log.timestamp}</span>
      </div>
      <div style="color: var(--text-main);">${log.details}</div>
    `;
    container.appendChild(item);
  });
}

// Setup All Form Submissions
function setupFormSubmissions() {
  // 1. Add Border Form
  document.getElementById('form-add-border')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('border-name').value,
      phone: document.getElementById('border-phone').value,
      nidNumber: document.getElementById('border-nid').value,
      seatId: document.getElementById('border-seat-select').value,
      institution: document.getElementById('border-institution').value,
      emergencyContactName: document.getElementById('border-guardian-name').value,
      emergencyContactPhone: document.getElementById('border-guardian-phone').value,
      permanentAddress: "বাংলাদেশ"
    };

    try {
      const res = await authFetch('/api/v1/borders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        alert("✅ নতুন বর্ডার সফলভাবে ভর্তি ও সিট বরাদ্দ করা হয়েছে!");
        closeModal('modal-add-border');
        document.getElementById('form-add-border').reset();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 2. Add Bazaar Form
  document.getElementById('form-add-bazaar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      category: document.getElementById('bazaar-category').value,
      description: document.getElementById('bazaar-description').value,
      amount: document.getElementById('bazaar-amount').value,
      payer: document.getElementById('bazaar-payer').value
    };

    try {
      const res = await authFetch('/api/v1/bazaar-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        alert("✅ বাজার খরচ সফলভাবে ক্যাশ বুকে এন্ট্রি করা হয়েছে!");
        closeModal('modal-add-bazaar');
        document.getElementById('form-add-bazaar').reset();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 3. Manager Post-10 PM Override Form
  document.getElementById('form-override-meal')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      borderId: document.getElementById('override-border-id').value,
      date: "2026-10-08",
      mealType: document.getElementById('override-meal-type').value,
      value: document.getElementById('override-meal-value').value,
      isManagerOverride: true,
      reason: document.getElementById('override-audit-reason').value
    };

    try {
      const res = await authFetch('/api/v1/meals/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        alert("✅ রাত ১০টার পর ম্যানেজারের অডিট নোট সহ মিল ওভাররাইড সফল হয়েছে!");
        closeModal('modal-override-meal');
        document.getElementById('form-override-meal').reset();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 4. Payment Collection Form
  document.getElementById('form-collect-payment')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      invoiceId: document.getElementById('payment-invoice-select').value,
      amount: document.getElementById('payment-amount').value,
      method: document.getElementById('payment-method').value,
      accountId: document.getElementById('payment-account').value,
      trxId: document.getElementById('payment-trx-id').value
    };

    try {
      const res = await authFetch('/api/v1/payments/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        closeModal('modal-collect-payment');
        document.getElementById('form-collect-payment').reset();

        // Populate and open printable receipt preview
        const rcp = res.data.receipt;
        document.getElementById('receipt-no-val').textContent = rcp.receiptNo;
        document.getElementById('receipt-date-val').textContent = rcp.date;
        document.getElementById('receipt-border-val').textContent = rcp.borderName;
        document.getElementById('receipt-method-val').textContent = rcp.method;
        document.getElementById('receipt-trx-val').textContent = rcp.trxId;
        document.getElementById('receipt-amount-val').textContent = '৳ ' + rcp.amount.toLocaleString() + '.০০';

        openModal('modal-receipt-view');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 5. Google Sheets Live Sync Button
  document.getElementById('btn-sync-google-sheets')?.addEventListener('click', async () => {
    const btnText = document.getElementById('sync-btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = "সিঙ্ক হচ্ছে...";

    try {
      const res = await authFetch('/api/v1/reports/export/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json());

      if (res.success) {
        btnText.textContent = originalText;
        const alertEl = document.getElementById('sync-success-alert');
        alertEl.style.display = 'block';
        document.getElementById('sync-success-details').textContent = 
          `সর্বমোট ${res.data.syncedRows} টি রো (মিল, বাজার ও ইনভয়েস) সফলভাবে গুগল শিটে সিঙ্ক হয়েছে। সিঙ্ক সময়: ${res.data.syncedAt}`;
      }
    } catch (err) {
      btnText.textContent = originalText;
      console.error(err);
    }
  });

  // Audit refresh button
  document.getElementById('btn-refresh-audit')?.addEventListener('click', () => {
    fetchAllData();
  });
}
