const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Mock Seed Data
const initialData = {
  organization: {
    id: "org-001",
    name: "Bachelor Home Hostels BD",
    code: "BHH-DHAKA",
    phone: "01711000000",
    address: "House #12, Road #4, Mirpur-10, Dhaka-1216",
    currency: "BDT"
  },
  users: [
    { id: "usr-001", name: "Super Administrator", phone: "01700000001", role: "SUPER_ADMIN", password: "admin123", lang: "bn" },
    { id: "usr-002", name: "Md. Rafiqul Islam (ম্যানেজার)", phone: "01700000002", role: "MANAGER", password: "admin123", lang: "bn" },
    { id: "usr-003", name: "Kamrul Hasan (অ্যাকাউন্ট্যান্ট)", phone: "01700000003", role: "ACCOUNTANT", password: "admin123", lang: "bn" },
    { id: "usr-004", name: "Abdul Kashem (বাবুর্চি)", phone: "01700000004", role: "STAFF", password: "admin123", lang: "bn" }
  ],
  buildings: [
    {
      id: "bld-001",
      name: "Green View Building (গ্রিন ভিউ ভবন)",
      code: "BLD-1",
      address: "House #12, Road #4, Mirpur-10, Dhaka",
      caretakerName: "Abdul Karim",
      caretakerPhone: "01811000000",
      totalFloors: 4
    }
  ],
  flats: [
    { id: "flt-001", buildingId: "bld-001", flatNumber: "Flat 3-A (৩য় তলা)", floor: 3, hasKitchen: true },
    { id: "flt-002", buildingId: "bld-001", flatNumber: "Flat 3-B (৩য় তলা)", floor: 3, hasKitchen: true },
    { id: "flt-003", buildingId: "bld-001", flatNumber: "Flat 4-A (৪র্থ তলা)", floor: 4, hasKitchen: true }
  ],
  rooms: [
    { id: "rm-301", flatId: "flt-001", roomNumber: "Room 301", category: "DOUBLE", capacity: 2, hasAc: false, hasBath: true },
    { id: "rm-302", flatId: "flt-001", roomNumber: "Room 302", category: "TRIPLE", capacity: 3, hasAc: false, hasBath: false },
    { id: "rm-303", flatId: "flt-002", roomNumber: "Room 303", category: "SINGLE", capacity: 1, hasAc: true, hasBath: true },
    { id: "rm-304", flatId: "flt-002", roomNumber: "Room 304", category: "DOUBLE", capacity: 2, hasAc: false, hasBath: true },
    { id: "rm-401", flatId: "flt-003", roomNumber: "Room 401", category: "DOUBLE", capacity: 2, hasAc: true, hasBath: true }
  ],
  seats: [
    { id: "st-301-1", roomId: "rm-301", seatCode: "B1-F3A-R301-S1", label: "জানালা সিট (Window Bed)", baseRent: 3500, status: "OCCUPIED" },
    { id: "st-301-2", roomId: "rm-301", seatCode: "B1-F3A-R301-S2", label: "দরজা সিট (Door Bed)", baseRent: 3200, status: "OCCUPIED" },
    { id: "st-302-1", roomId: "rm-302", seatCode: "B1-F3A-R302-S1", label: "কর্নার বেড ১", baseRent: 3000, status: "OCCUPIED" },
    { id: "st-302-2", roomId: "rm-302", seatCode: "B1-F3A-R302-S2", label: "মিডল বেড", baseRent: 2800, status: "BOOKED" },
    { id: "st-302-3", roomId: "rm-302", seatCode: "B1-F3A-R302-S3", label: "কর্নার বেড ২", baseRent: 3000, status: "MAINTENANCE" },
    { id: "st-303-1", roomId: "rm-303", seatCode: "B1-F3B-R303-S1", label: "ভিআইপি এসি বেড", baseRent: 6500, status: "OCCUPIED" },
    { id: "st-304-1", roomId: "rm-304", seatCode: "B1-F3B-R304-S1", label: "উইন্ডো সাইড", baseRent: 3400, status: "AVAILABLE" },
    { id: "st-304-2", roomId: "rm-304", seatCode: "B1-F3B-R304-S2", label: "ডোর সাইড", baseRent: 3200, status: "AVAILABLE" },
    { id: "st-401-1", roomId: "rm-401", seatCode: "B1-F4A-R401-S1", label: "এসি মাস্টার বেড ১", baseRent: 4500, status: "OCCUPIED" },
    { id: "st-401-2", roomId: "rm-401", seatCode: "B1-F4A-R401-S2", label: "এসি মাস্টার বেড ২", baseRent: 4500, status: "AVAILABLE" }
  ],
  borders: [
    {
      id: "brd-001",
      userId: "usr-101",
      name: "তানভীর হাসান (Tanvir Hasan)",
      phone: "01722334455",
      email: "tanvir@example.com",
      nidNumber: "19952691234567890",
      institution: "BRAC Bank Ltd (অফিসার)",
      permanentAddress: "গ্রাম: রামপুর, কসবা, ব্রাহ্মণবাড়িয়া",
      emergencyContactName: "মোঃ আবুল কাশেম (বাবা)",
      emergencyContactPhone: "01811223344",
      seatId: "st-301-1",
      status: "ACTIVE"
    },
    {
      id: "brd-002",
      userId: "usr-102",
      name: "জাহিদুল ইসলাম (Jahidul Islam)",
      phone: "01811223344",
      email: "jahid@example.com",
      nidNumber: "19965219876543210",
      institution: "ঢাকা বিশ্ববিদ্যালয় (মাস্টার্স)",
      permanentAddress: "সদর, পাবনা",
      emergencyContactName: "আব্দুল মজিদ (চাচা)",
      emergencyContactPhone: "01711224466",
      seatId: "st-301-2",
      status: "ACTIVE"
    },
    {
      id: "brd-003",
      userId: "usr-103",
      name: "শাকিল আহমেদ (Shakil Ahmed)",
      phone: "01911998877",
      email: "shakil@example.com",
      nidNumber: "19978123456789123",
      institution: "দারাজ বাংলাদেশ (এক্সিকিউটিভ)",
      permanentAddress: "মধুপুর, টাঙ্গাইল",
      emergencyContactName: "রফিকুল ইসলাম (ভাই)",
      emergencyContactPhone: "01511889900",
      seatId: "st-302-1",
      status: "ACTIVE"
    },
    {
      id: "brd-004",
      userId: "usr-104",
      name: "মাহমুদুর রহমান (Mahmudur Rahman)",
      phone: "01611334455",
      email: "mahmud@example.com",
      nidNumber: "19941298765432100",
      institution: "সফটওয়্যার ডেভেলপার (টেক ভিউ)",
      permanentAddress: "মিরসরাই, চট্টগ্রাম",
      emergencyContactName: "আনোয়ারা বেগম (মা)",
      emergencyContactPhone: "01711992233",
      seatId: "st-303-1",
      status: "ACTIVE"
    },
    {
      id: "brd-005",
      userId: "usr-105",
      name: "রিয়াজ মোরশেদ (Riaz Morshed)",
      phone: "01511223344",
      email: "riaz@example.com",
      nidNumber: "19983344556677889",
      institution: "তিতুমীর কলেজ (অনার্স ৩য় বর্ষ)",
      permanentAddress: "শিবগঞ্জ, বগুড়া",
      emergencyContactName: "মোরশেদ আলম (বাবা)",
      emergencyContactPhone: "01722883311",
      seatId: "st-401-1",
      status: "ACTIVE"
    }
  ],
  allocations: [
    { id: "alc-001", borderId: "brd-001", seatId: "st-301-1", checkInDate: "2026-08-01", agreedRent: 3500, securityDeposit: 3500, isActive: true },
    { id: "alc-002", borderId: "brd-002", seatId: "st-301-2", checkInDate: "2026-08-15", agreedRent: 3200, securityDeposit: 3200, isActive: true },
    { id: "alc-003", borderId: "brd-003", seatId: "st-302-1", checkInDate: "2026-09-01", agreedRent: 3000, securityDeposit: 3000, isActive: true },
    { id: "alc-004", borderId: "brd-004", seatId: "st-303-1", checkInDate: "2026-07-01", agreedRent: 6500, securityDeposit: 6500, isActive: true },
    { id: "alc-005", borderId: "brd-005", seatId: "st-401-1", checkInDate: "2026-09-15", agreedRent: 4500, securityDeposit: 4500, isActive: true }
  ],
  // Daily meals for today (2026-10-07) and tomorrow (2026-10-08)
  meals: [
    { id: "m-001", borderId: "brd-001", date: "2026-10-07", breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: true },
    { id: "m-002", borderId: "brd-002", date: "2026-10-07", breakfast: 1, lunch: 1, dinner: 1, guest: 1, isLocked: true },
    { id: "m-003", borderId: "brd-003", date: "2026-10-07", breakfast: 0, lunch: 1, dinner: 1, guest: 0, isLocked: true },
    { id: "m-004", borderId: "brd-004", date: "2026-10-07", breakfast: 1, lunch: 0, dinner: 1, guest: 0, isLocked: true },
    { id: "m-005", borderId: "brd-005", date: "2026-10-07", breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: true },
    // Tomorrow's meals (pending 10 PM lock)
    { id: "m-006", borderId: "brd-001", date: "2026-10-08", breakfast: 1, lunch: 1, dinner: 0, guest: 0, isLocked: false },
    { id: "m-007", borderId: "brd-002", date: "2026-10-08", breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: false },
    { id: "m-008", borderId: "brd-003", date: "2026-10-08", breakfast: 1, lunch: 1, dinner: 1, guest: 1, isLocked: false },
    { id: "m-009", borderId: "brd-004", date: "2026-10-08", breakfast: 0, lunch: 0, dinner: 1, guest: 0, isLocked: false },
    { id: "m-010", borderId: "brd-005", date: "2026-10-08", breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: false }
  ],
  bazaarExpenses: [
    { id: "bz-001", date: "2026-10-07", category: "মাছ ও মাংস", description: "রুই মাছ ৩ কেজি, সোনালি মুরগি ৪ কেজি", amount: 2450, payer: "ম্যানেজার" },
    { id: "bz-002", date: "2026-10-07", category: "শাকসবজি ও আলু", description: "আলু ৫ কেজি, পটল, ঢেঁড়শ, কাঁচামরিচ ও ধনেপাতা", amount: 620, payer: "ম্যানেজার" },
    { id: "bz-003", date: "2026-10-06", category: "চাল ও ডাল", description: "মিনিকেট চাল ২৫ কেজি, মসুর ডাল ৩ কেজি", amount: 2150, payer: "ক্যাশ বক্স" },
    { id: "bz-004", date: "2026-10-05", category: "তেল ও মসলা", description: "সয়াবিন তেল ৫ লিটার, পেঁয়াজ, রসুন ও আদা", amount: 1540, payer: "ক্যাশ বক্স" },
    { id: "bz-005", date: "2026-10-04", category: "মাছ ও মাংস", description: "পাঙ্গাশ মাছ ৪ কেজি, ডিম ৬০ পিস", amount: 1680, payer: "ম্যানেজার" }
  ],
  accounts: [
    { id: "acc-001", name: "Hostel Cash Box (ক্যাশ বক্স)", type: "CASH", balance: 18500 },
    { id: "acc-002", name: "bKash Merchant (01711-223344)", type: "BKASH", balance: 52400 },
    { id: "acc-003", name: "Islami Bank Current A/C", type: "BANK", balance: 120000 }
  ],
  invoices: [
    {
      id: "inv-202610-001",
      borderId: "brd-001",
      month: "2026-10",
      invoiceNo: "INV-202610-001",
      seatRent: 3500,
      estimatedMeals: 2600,
      utilities: 1100, // Electricity, WiFi, Gas, Maid
      previousDue: 0,
      totalAmount: 7200,
      paidAmount: 7200,
      dueAmount: 0,
      status: "PAID",
      dueDate: "2026-10-10"
    },
    {
      id: "inv-202610-002",
      borderId: "brd-002",
      month: "2026-10",
      invoiceNo: "INV-202610-002",
      seatRent: 3200,
      estimatedMeals: 2400,
      utilities: 1100,
      previousDue: 500,
      totalAmount: 7200,
      paidAmount: 5000,
      dueAmount: 2200,
      status: "PARTIAL",
      dueDate: "2026-10-10"
    },
    {
      id: "inv-202610-003",
      borderId: "brd-003",
      month: "2026-10",
      invoiceNo: "INV-202610-003",
      seatRent: 3000,
      estimatedMeals: 2200,
      utilities: 1100,
      previousDue: 0,
      totalAmount: 6300,
      paidAmount: 0,
      dueAmount: 6300,
      status: "UNPAID",
      dueDate: "2026-10-10"
    },
    {
      id: "inv-202610-004",
      borderId: "brd-004",
      month: "2026-10",
      invoiceNo: "INV-202610-004",
      seatRent: 6500,
      estimatedMeals: 2500,
      utilities: 1500,
      previousDue: 0,
      totalAmount: 10500,
      paidAmount: 10500,
      dueAmount: 0,
      status: "PAID",
      dueDate: "2026-10-10"
    },
    {
      id: "inv-202610-005",
      borderId: "brd-005",
      month: "2026-10",
      invoiceNo: "INV-202610-005",
      seatRent: 4500,
      estimatedMeals: 2500,
      utilities: 1200,
      previousDue: 1200,
      totalAmount: 9400,
      paidAmount: 0,
      dueAmount: 9400,
      status: "UNPAID",
      dueDate: "2026-10-10"
    }
  ],
  receipts: [
    {
      id: "rcp-001",
      receiptNo: "MR-202610-0041",
      invoiceId: "inv-202610-001",
      borderId: "brd-001",
      borderName: "তানভীর হাসান",
      amount: 7200,
      method: "BKASH",
      trxId: "BKH98214712",
      accountId: "acc-002",
      collectedBy: "Md. Rafiqul Islam",
      date: "2026-10-05"
    },
    {
      id: "rcp-002",
      receiptNo: "MR-202610-0042",
      invoiceId: "inv-202610-002",
      borderId: "brd-002",
      borderName: "জাহিদুল ইসলাম",
      amount: 5000,
      method: "CASH",
      trxId: "CASH-REC",
      accountId: "acc-001",
      collectedBy: "Md. Rafiqul Islam",
      date: "2026-10-06"
    },
    {
      id: "rcp-003",
      receiptNo: "MR-202610-0043",
      invoiceId: "inv-202610-004",
      borderId: "brd-004",
      borderName: "মাহমুদুর রহমান",
      amount: 10500,
      method: "BANK",
      trxId: "IBBL-9182371",
      accountId: "acc-003",
      collectedBy: "Kamrul Hasan",
      date: "2026-10-06"
    }
  ],
  auditLogs: [
    { id: "aud-001", timestamp: "2026-10-07 10:15:00", user: "Md. Rafiqul Islam", action: "BAZAAR_EXPENSE_ENTERED", details: "মাছ ও মাংস ৳ ২৪৫০ টাকা এন্ট্রি করা হয়েছে" },
    { id: "aud-002", timestamp: "2026-10-06 18:30:00", user: "Md. Rafiqul Islam", action: "PAYMENT_COLLECTED", details: "জাহিদুল ইসলাম এর নিকট থেকে ৳ ৫,০০০ আদায় (MR-202610-0042)" },
    { id: "aud-003", timestamp: "2026-10-05 22:05:00", user: "System Cron", action: "CUTOFF_AUTO_LOCKED", details: "৬ অক্টোবর তারিখের মিল স্বয়ংক্রিয়ভাবে রাত ১০টায় লক করা হয়েছে" }
  ]
};

// Load or initialize DB
function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Extract authenticated staff/admin from Authorization header
function getUserFromHeader(req, db) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer auth_token_')) {
    const parts = authHeader.replace('Bearer auth_token_', '').split('_');
    const userId = parts[0];
    const found = db.users.find(u => u.id === userId);
    if (found) return found;
  }
  return db.users[1]; // default fallback (Manager)
}

// REST API ROUTES

// 1. Health & Current User Info
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: "Bachelor Home Hostel ERP API is online", timestamp: new Date().toISOString() });
});

// Admin & Staff Login
app.post('/api/v1/auth/login', (req, res) => {
  const db = getDB();
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "আইডি / মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন" });
  }

  const user = db.users.find(u => 
    u.phone === identifier.trim() || 
    u.id === identifier.trim() ||
    (u.email && u.email === identifier.trim())
  );

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: "এই আইডি বা মোবাইল নম্বরে কোনো ইউজার অ্যাকাউন্ট পাওয়া যায়নি।" 
    });
  }

  const validPassword = user.password || "admin123";
  if (password.trim() !== validPassword) {
    return res.status(401).json({ 
      success: false, 
      message: "ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।" 
    });
  }

  const token = "auth_token_" + user.id + "_" + Date.now();

  res.json({
    success: true,
    message: "সফলভাবে লগইন হয়েছে",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        lang: user.lang || "bn"
      },
      organization: db.organization
    }
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const db = getDB();
  const user = getUserFromHeader(req, db);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        lang: user.lang || "bn"
      },
      organization: db.organization
    }
  });
});

// 2. Property & Visual Seat Matrix
app.get('/api/v1/seats/occupancy-matrix', (req, res) => {
  const db = getDB();
  const totalSeats = db.seats.length;
  const occupied = db.seats.filter(s => s.status === 'OCCUPIED').length;
  const available = db.seats.filter(s => s.status === 'AVAILABLE').length;
  const booked = db.seats.filter(s => s.status === 'BOOKED').length;
  const maintenance = db.seats.filter(s => s.status === 'MAINTENANCE').length;

  const matrix = db.buildings.map(bld => {
    const flats = db.flats.filter(f => f.buildingId === bld.id).map(flt => {
      const rooms = db.rooms.filter(r => r.flatId === flt.id).map(rm => {
        const seats = db.seats.filter(s => s.roomId === rm.id).map(st => {
          const allocation = db.allocations.find(a => a.seatId === st.id && a.isActive);
          const border = allocation ? db.borders.find(b => b.id === allocation.borderId) : null;
          return {
            ...st,
            border: border ? { name: border.name, phone: border.phone, institution: border.institution } : null
          };
        });
        return { ...rm, seats };
      });
      return { ...flt, rooms };
    });
    return { ...bld, flats };
  });

  res.json({
    success: true,
    data: {
      summary: {
        totalSeats,
        occupied,
        available,
        booked,
        maintenance,
        occupancyRate: Math.round((occupied / totalSeats) * 100)
      },
      matrix
    }
  });
});

// 3. Borders Management
app.get('/api/v1/borders', (req, res) => {
  const db = getDB();
  const bordersWithSeats = db.borders.map(b => {
    const seat = db.seats.find(s => s.id === b.seatId);
    return { ...b, seatCode: seat ? seat.seatCode : 'N/A' };
  });
  res.json({ success: true, data: bordersWithSeats });
});

app.post('/api/v1/borders', (req, res) => {
  const db = getDB();
  const newBorder = {
    id: "brd-" + Date.now(),
    userId: "usr-" + Date.now(),
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || "",
    nidNumber: req.body.nidNumber,
    institution: req.body.institution || "",
    permanentAddress: req.body.permanentAddress,
    emergencyContactName: req.body.emergencyContactName,
    emergencyContactPhone: req.body.emergencyContactPhone,
    seatId: req.body.seatId || null,
    status: "ACTIVE"
  };

  db.borders.push(newBorder);

  // If seat selected, mark seat as OCCUPIED and create allocation
  if (req.body.seatId) {
    const seat = db.seats.find(s => s.id === req.body.seatId);
    if (seat) {
      seat.status = 'OCCUPIED';
      db.allocations.push({
        id: "alc-" + Date.now(),
        borderId: newBorder.id,
        seatId: seat.id,
        checkInDate: new Date().toISOString().split('T')[0],
        agreedRent: parseFloat(req.body.agreedRent || seat.baseRent),
        securityDeposit: parseFloat(req.body.securityDeposit || seat.baseRent),
        isActive: true
      });
    }
  }

  const currentUser = getUserFromHeader(req, db);
  db.auditLogs.unshift({
    id: "aud-" + Date.now(),
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    user: currentUser.name,
    action: "BORDER_ONBOARDED",
    details: `নতুন বর্ডার ভর্তি: ${newBorder.name} (${newBorder.phone})`
  });

  saveDB(db);
  res.status(201).json({ success: true, message: "বর্ডার সফলভাবে যুক্ত হয়েছে", data: newBorder });
});

// 4. Meal Management & 10 PM Cutoff
app.get('/api/v1/meals/daily-sheet', (req, res) => {
  const db = getDB();
  const targetDate = req.query.date || "2026-10-08";

  const rows = db.borders.map(b => {
    let meal = db.meals.find(m => m.borderId === b.id && m.date === targetDate);
    if (!meal) {
      meal = { borderId: b.id, date: targetDate, breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: false };
    }
    const seat = db.seats.find(s => s.id === b.seatId);
    return {
      borderId: b.id,
      borderName: b.name,
      seatCode: seat ? seat.seatCode : 'N/A',
      ...meal
    };
  });

  const totals = rows.reduce((acc, cur) => {
    acc.breakfast += cur.breakfast;
    acc.lunch += cur.lunch;
    acc.dinner += cur.dinner;
    acc.guest += cur.guest;
    return acc;
  }, { breakfast: 0, lunch: 0, dinner: 0, guest: 0 });

  res.json({
    success: true,
    data: {
      date: targetDate,
      isCutoffPassed: req.query.simulatedAfter10 === 'true',
      totals: {
        ...totals,
        grandTotal: totals.breakfast + totals.lunch + totals.dinner + totals.guest
      },
      rows
    }
  });
});

// Border Toggle Meal (Checks 10 PM cutoff)
app.post('/api/v1/meals/toggle', (req, res) => {
  const db = getDB();
  const { borderId, date, mealType, value, simulatedAfter10 } = req.body;

  // If cutoff passed and not a manager override
  if (simulatedAfter10 && !req.body.isManagerOverride) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CUTOFF_WINDOW_EXCEEDED",
        message: "রাত ১০:০০ টার পর পরদিনের মিল পরিবর্তন স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে। ম্যানেজারের সাথে যোগাযোগ করুন।"
      }
    });
  }

  let meal = db.meals.find(m => m.borderId === borderId && m.date === date);
  if (!meal) {
    meal = { id: "m-" + Date.now(), borderId, date, breakfast: 1, lunch: 1, dinner: 1, guest: 0, isLocked: false };
    db.meals.push(meal);
  }

  meal[mealType] = parseFloat(value);

  if (req.body.isManagerOverride) {
    const currentUser = getUserFromHeader(req, db);
    meal.isOverridden = true;
    meal.overrideReason = req.body.reason || "ম্যানেজার কর্তৃক অনুমোদিত";
    db.auditLogs.unshift({
      id: "aud-" + Date.now(),
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      user: currentUser.name + (currentUser.role ? ` (${currentUser.role})` : ""),
      action: "POST_10PM_MEAL_OVERRIDE",
      details: `${date} তারিখের মিল ওভাররাইড (${mealType}=${value}): ${meal.overrideReason}`
    });
  }

  saveDB(db);
  res.json({ success: true, message: "মিল সফলভাবে আপডেট হয়েছে", data: meal });
});

// 5. Bazaar Expenses
app.get('/api/v1/bazaar-expenses', (req, res) => {
  const db = getDB();
  const totalAmount = db.bazaarExpenses.reduce((sum, item) => sum + item.amount, 0);
  res.json({ success: true, data: { expenses: db.bazaarExpenses, totalAmount } });
});

app.post('/api/v1/bazaar-expenses', (req, res) => {
  const db = getDB();
  const newExp = {
    id: "bz-" + Date.now(),
    date: req.body.date || new Date().toISOString().split('T')[0],
    category: req.body.category,
    description: req.body.description,
    amount: parseFloat(req.body.amount),
    payer: req.body.payer || "ক্যাশ বক্স"
  };

  db.bazaarExpenses.unshift(newExp);

  // If payer is cash box, deduct from cash account
  const cashAcc = db.accounts.find(a => a.type === 'CASH');
  if (cashAcc) {
    cashAcc.balance -= newExp.amount;
  }

  const currentUser = getUserFromHeader(req, db);
  db.auditLogs.unshift({
    id: "aud-" + Date.now(),
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    user: currentUser.name,
    action: "BAZAAR_EXPENSE_ENTERED",
    details: `${newExp.category} বাবদ ৳ ${newExp.amount} এন্ট্রি করা হয়েছে`
  });

  saveDB(db);
  res.status(201).json({ success: true, message: "বাজার খরচ সংরক্ষিত হয়েছে", data: newExp });
});

// 6. Invoices & Billing
app.get('/api/v1/invoices', (req, res) => {
  const db = getDB();
  const invoicesWithBorders = db.invoices.map(inv => {
    const border = db.borders.find(b => b.id === inv.borderId);
    const seat = border ? db.seats.find(s => s.id === border.seatId) : null;
    return {
      ...inv,
      borderName: border ? border.name : 'N/A',
      borderPhone: border ? border.phone : 'N/A',
      seatCode: seat ? seat.seatCode : 'N/A'
    };
  });

  const totalBilled = db.invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = db.invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalDue = db.invoices.reduce((s, i) => s + i.dueAmount, 0);

  res.json({
    success: true,
    data: {
      invoices: invoicesWithBorders,
      summary: { totalBilled, totalCollected, totalDue }
    }
  });
});

// Collect Payment & Generate Money Receipt
app.post('/api/v1/payments/collect', (req, res) => {
  const db = getDB();
  const { invoiceId, amount, method, accountId, trxId } = req.body;
  const payAmt = parseFloat(amount);

  const invoice = db.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ success: false, message: "ইনভয়েস পাওয়া যায়নি" });
  }

  invoice.paidAmount += payAmt;
  invoice.dueAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  if (invoice.dueAmount === 0) {
    invoice.status = 'PAID';
  } else {
    invoice.status = 'PARTIAL';
  }

  const border = db.borders.find(b => b.id === invoice.borderId);
  const account = db.accounts.find(a => a.id === accountId) || db.accounts[0];
  account.balance += payAmt;

  const currentUser = getUserFromHeader(req, db);
  const receiptNo = "MR-202610-00" + (db.receipts.length + 1);
  const newReceipt = {
    id: "rcp-" + Date.now(),
    receiptNo,
    invoiceId: invoice.id,
    borderId: invoice.borderId,
    borderName: border ? border.name : 'N/A',
    amount: payAmt,
    method: method || 'CASH',
    trxId: trxId || (method === 'CASH' ? 'CASH-VOUCHER' : 'TRX-' + Math.floor(100000 + Math.random() * 900000)),
    accountId: account.id,
    collectedBy: currentUser.name,
    date: new Date().toISOString().split('T')[0]
  };

  db.receipts.unshift(newReceipt);

  db.auditLogs.unshift({
    id: "aud-" + Date.now(),
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    user: currentUser.name,
    action: "PAYMENT_COLLECTED",
    details: `${border ? border.name : ''} এর নিকট থেকে ৳ ${payAmt} আদায় (রসিদ নং: ${receiptNo})`
  });

  saveDB(db);
  res.status(201).json({
    success: true,
    message: "পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে এবং মানি রসিদ তৈরি হয়েছে",
    data: { receipt: newReceipt, invoice }
  });
});

// 7. Accounts Overview
app.get('/api/v1/accounts', (req, res) => {
  const db = getDB();
  const totalBalance = db.accounts.reduce((s, a) => s + a.balance, 0);
  res.json({ success: true, data: { accounts: db.accounts, totalBalance } });
});

// 8. Audit Logs
app.get('/api/v1/audit-logs', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.auditLogs.slice(0, 20) });
});

// 9. Google Sheets Simulated Live Sync
app.post('/api/v1/reports/export/google-sheets', (req, res) => {
  const db = getDB();
  res.json({
    success: true,
    message: "গুগল শিট সফলভাবে আপডেট ও ব্যাকআপ হয়েছে!",
    data: {
      sheetUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XR_Bachelor_Home_ERP_Demo/edit",
      syncedRows: db.meals.length + db.bazaarExpenses.length + db.invoices.length,
      syncedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })
    }
  });
});

// 10. BORDER MOBILE APP (PORTAL) REST APIS
// Border Portal Login
app.post('/api/v1/portal/login', (req, res) => {
  const db = getDB();
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন" });
  }

  const border = db.borders.find(b => 
    b.phone === identifier.trim() || 
    b.id === identifier.trim() ||
    b.nidNumber === identifier.trim()
  );

  if (!border) {
    return res.status(401).json({ 
      success: false, 
      message: "এই আইডি বা মোবাইল নম্বরে কোনো বর্ডার অ্যাকাউন্ট পাওয়া যায়নি।" 
    });
  }

  const validPassword = border.password || "123456";
  if (password.trim() !== validPassword) {
    return res.status(401).json({ 
      success: false, 
      message: "ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।" 
    });
  }

  const seat = db.seats.find(s => s.id === border.seatId);
  const token = "brd_session_" + border.id + "_" + Date.now();

  res.json({
    success: true,
    message: "সফলভাবে লগইন হয়েছে",
    data: {
      token,
      border: {
        id: border.id,
        name: border.name,
        phone: border.phone,
        seatCode: seat ? seat.seatCode : "N/A"
      }
    }
  });
});

// Border Portal Change Password
app.post('/api/v1/portal/change-password', (req, res) => {
  const db = getDB();
  const { borderId, oldPassword, newPassword } = req.body;

  const border = db.borders.find(b => b.id === borderId);
  if (!border) {
    return res.status(404).json({ success: false, message: "বর্ডার পাওয়া যায়নি" });
  }

  const currentPass = border.password || "123456";
  if (oldPassword !== currentPass) {
    return res.status(400).json({ success: false, message: "পুরাতন পাসওয়ার্ডটি সঠিক নয়" });
  }

  border.password = newPassword;
  saveDB(db);

  res.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
});

app.get('/api/v1/portal/me', (req, res) => {
  const db = getDB();
  const phone = req.query.phone;
  const borderId = req.query.borderId;

  let border = null;
  if (borderId) {
    border = db.borders.find(b => b.id === borderId);
  } else if (phone) {
    border = db.borders.find(b => b.phone === phone);
  } else {
    border = db.borders[0]; // fallback
  }
  
  if (!border) {
    return res.status(401).json({ success: false, message: "বর্ডার প্রোফাইল পাওয়া যায়নি বা লগইন করেননি।" });
  }

  const seat = db.seats.find(s => s.id === border.seatId);
  const room = seat ? db.rooms.find(r => r.id === seat.roomId) : null;
  const flat = room ? db.flats.find(f => f.id === room.flatId) : null;
  const building = flat ? db.buildings.find(b => b.id === flat.buildingId) : null;
  const allocation = db.allocations.find(a => a.borderId === border.id && a.isActive);

  // Today & Tomorrow Meals
  const today = "2026-10-07";
  const tomorrow = "2026-10-08";
  let todayMeal = db.meals.find(m => m.borderId === border.id && m.date === today) || {
    breakfast: 1, lunch: 1, dinner: 1, guest: 0
  };
  let tomorrowMeal = db.meals.find(m => m.borderId === border.id && m.date === tomorrow) || {
    breakfast: 1, lunch: 1, dinner: 1, guest: 0
  };

  // Border Invoices & Receipts
  const invoice = db.invoices.find(i => i.borderId === border.id) || {
    totalAmount: 7200, paidAmount: 7200, dueAmount: 0, status: 'PAID'
  };
  const receipts = db.receipts.filter(r => r.borderId === border.id);

  // Hostel Menu for Today
  const todayMenu = {
    breakfast: "ডিম ভুনা, পরোটা (৩টি), স্পেশাল চা",
    lunch: "রুই মাছ ভুনা, আলু-পটলের তরকারি, মসুর ডাল, গরম ভাত",
    dinner: "সোনালি মুরগির মাংস, করলা ভাজি, ঘন ডাল, ভাত"
  };

  // Mess Notices
  const notices = [
    { id: 1, date: "০৭ অক্টোবর", title: "আগামীকাল গ্যাস সিলিন্ডার পরিবর্তন", desc: "দুপুর ২টা থেকে ৩টা পর্যন্ত রান্নাঘরের গ্যাস সাময়িক বন্ধ থাকবে।" },
    { id: 2, date: "০৫ অক্টোবর", title: "মাসের ১০ তারিখের মধ্যে ভাড়া পরিশোধ", desc: "সকল বর্ডারকে চলতি মাসের ১০ তারিখের মধ্যে সিট ও মিল বিল পরিশোধের অনুরোধ করা হলো।" }
  ];

  res.json({
    success: true,
    data: {
      border: {
        id: border.id,
        name: border.name,
        phone: border.phone,
        email: border.email,
        nidNumber: border.nidNumber,
        institution: border.institution,
        permanentAddress: border.permanentAddress,
        emergencyContactName: border.emergencyContactName,
        emergencyContactPhone: border.emergencyContactPhone
      },
      stay: {
        buildingName: building ? building.name : "Green View Building",
        flatNumber: flat ? flat.flatNumber : "Flat 3-A",
        roomNumber: room ? room.roomNumber : "Room 301",
        seatCode: seat ? seat.seatCode : "B1-F3A-R301-S1",
        seatLabel: seat ? seat.label : "জানালা সিট",
        hasAc: room ? room.hasAc : false,
        agreedRent: allocation ? allocation.agreedRent : (seat ? seat.baseRent : 3500),
        securityDeposit: allocation ? allocation.securityDeposit : 3500,
        checkInDate: allocation ? allocation.checkInDate : "2026-08-01"
      },
      meals: {
        today: todayMeal,
        tomorrow: tomorrowMeal,
        totalMealsThisMonth: 42.5,
        estimatedMealRate: 62.24
      },
      finance: {
        invoice,
        receipts
      },
      todayMenu,
      notices
    }
  });
});

// Portal Submit Complaint API
app.post('/api/v1/portal/submit-complaint', (req, res) => {
  const db = getDB();
  const { borderId, category, description } = req.body;
  
  if (!db.complaints) db.complaints = [];

  const newComplaint = {
    id: "cmp-" + Date.now(),
    borderId,
    category: category || "মেরামত",
    description,
    status: "PENDING",
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.complaints.unshift(newComplaint);

  db.auditLogs.unshift({
    id: "aud-" + Date.now(),
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    user: "Border Mobile App",
    action: "COMPLAINT_FILED",
    details: `নতুন অভিযোগ এন্ট্রি: ${category} - ${description}`
  });

  saveDB(db);
  res.status(201).json({ success: true, message: "আপনার অভিযোগটি মেস ম্যানেজারের নিকট জমা হয়েছে।", data: newComplaint });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Bachelor Home Hostel ERP Server Started!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Mode: Production Web-Based Architecture`);
  console.log(`====================================================`);
});
