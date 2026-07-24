// CareClarify - Core Application Logic

// 1. Data Models & Databases

// Sample Bills Database
const sampleBills = {
  csection: {
    title: "Maternity C-Section (Corporate Hospital)",
    patient: "Priya Sharma",
    date: "July 12, 2026",
    billNo: "HOSP-2026-8871",
    hospitalName: "Apollo Heights Super Specialty, Mumbai",
    totalOriginal: 215000,
    totalFair: 148000,
    overcharge: 67000,
    items: [
      { name: "Deluxe Room Rent (4 Days)", original: 60000, fair: 32000, category: "Room Rent", status: "Overcharged", reason: "Standard private room capped at ₹8,000/day by insurance agreement; hospital billed ₹15,000/day Deluxe without consent during emergency." },
      { name: "Operation Theatre Charges", original: 35000, fair: 35000, category: "OT Fees", status: "Reasonable", reason: "Within regional standard caps." },
      { name: "Obstetrician Surgeon Fees", original: 50000, fair: 50000, category: "Doctor Fees", status: "Reasonable", reason: "Standard specialized consultant rate." },
      { name: "OT Consumables Kit", original: 28000, fair: 10000, category: "Consumables", status: "Duplicate Billed", reason: "Kit items (syringes, gloves, sutures) were billed separately on invoice lines #12-25, causing duplicate billing." },
      { name: "Assistant Surgeon Charges", original: 15000, fair: 5000, category: "Doctor Fees", status: "Overcharged", reason: "Standard rate is 10-15% of lead surgeon fee (₹5,000). Billed inflated flat rate." },
      { name: "Neonatal Care Unit charges (24 hrs)", original: 12000, fair: 12000, category: "Special Services", status: "Reasonable", reason: "Standard ICU monitoring rates." },
      { name: "Misc. Pharmacy (Clexane, etc.)", original: 15000, fair: 4000, category: "Pharmacy", status: "Overcharged", reason: "Billed under brand name at full MRP. Generic LMWH alternatives available at 70% lower price." }
    ],
    warnings: [
      { id: "warn-1", type: "danger", title: "Room Rent Allocation Issue", text: "Room rent was charged at ₹15,000/day (Deluxe) instead of the standard private category (₹8,000/day). You are entitled to challenge this if no explicit room upgrade consent form was signed.", action: "Request Room Consent Form" },
      { id: "warn-2", type: "danger", title: "Duplicate Consumables Billing", text: "The flat ₹28,000 'OT Consumables Kit' duplicates individual items (syringes, surgical gown, sutures) listed separately. Citing the Consumer Protection Act, request an itemized audit of the OT kit.", action: "Request OT Consumables Audit" },
      { id: "warn-3", type: "warning", title: "Uncapped Assistant Surgeon Fee", text: "Assistant surgeon fees exceed the recommended insurance tariff limits for Tier-1 hospitals.", action: "Dispute Staff Surcharges" }
    ],
    chartData: { room: 32000, ot: 35000, doctor: 55000, consumables: 10000, other: 16000 }
  },
  cardiac: {
    title: "Cardiac Angioplasty (Super Specialty)",
    patient: "Rajesh Verma",
    date: "June 28, 2026",
    billNo: "HOSP-2026-5542",
    hospitalName: "Fortis Care Heart Institute, Delhi NCR",
    totalOriginal: 410000,
    totalFair: 298000,
    overcharge: 112000,
    items: [
      { name: "Drug Eluting Stent (DES) - Cobalt", original: 120000, fair: 38250, category: "Implants", status: "Capping Violation", reason: "National Pharmaceutical Pricing Authority (NPPA) caps DES stents at ₹38,250. Charged ₹1.2L is an illegal markup." },
      { name: "ICU Charges (3 Days)", original: 75000, fair: 75000, category: "Room Rent", status: "Reasonable", reason: "Standard ICU intensive care rate." },
      { name: "ICU Room Rent (Day 4 - Post Discharge)", original: 25000, fair: 0, category: "Room Rent", status: "Overcharged", reason: "Billed room rent for a 4th day despite patient being discharged at 10:00 AM on Day 3." },
      { name: "Cardiologist Consultation (6 visits)", original: 30000, fair: 18000, category: "Doctor Fees", status: "Overcharged", reason: "Consultation charges capped at ₹3,000/visit for senior panel doctors. Billed ₹5,000/visit." },
      { name: "Cath Lab Procedure Fee", original: 90000, fair: 90000, category: "OT Fees", status: "Reasonable", reason: "Standard cath lab usage charges." },
      { name: "Cardiac Monitor & ECG lines", original: 20000, fair: 20000, category: "Special Services", status: "Reasonable", reason: "Standard monitoring diagnostic billing." },
      { name: "Pharmacy & Disposables", original: 50000, fair: 56750, category: "Pharmacy", status: "Verify Charge", reason: "Audit required. Highly inflated disposable pricing, though stent refund offset is primary target." }
    ],
    warnings: [
      { id: "warn-1", type: "danger", title: "NPPA Stent Price Cap Violation", text: "Under drug price control orders, Drug Eluting Stents (DES) must not exceed the ₹38,250 limit. The hospital billed ₹1,20,000. This is a severe compliance violation.", action: "Flag NPPA Compliance Violation" },
      { id: "warn-2", type: "danger", title: "Post-Discharge Room Rent Billing", text: "You were billed for 4 days of ICU care, but patient logs indicate discharge occurred on Day 3. Citing billing guidelines, request a correction of ₹25,000.", action: "Dispute Discharge Day Overlap" },
      { id: "warn-3", type: "warning", title: "Excessive Consultations", text: "Check patient logs to verify if the senior cardiologist visited 6 times. Hospitals frequently auto-bill consultations twice daily without actual ward rounds.", action: "Request Doctor Visit Sheet" }
    ],
    chartData: { room: 75000, ot: 90000, doctor: 18000, consumables: 38250, other: 76750 }
  },
  fever: {
    title: "General Ward (Severe Dengue Hospitalization)",
    patient: "Aarav Mehta",
    date: "July 05, 2026",
    billNo: "HOSP-2026-6631",
    hospitalName: "Max Life General Hospital, Bengaluru",
    totalOriginal: 98000,
    totalFair: 64000,
    overcharge: 34000,
    items: [
      { name: "General Ward Rent (5 Days)", original: 25000, fair: 25000, category: "Room Rent", status: "Reasonable", reason: "Standard general ward rate at ₹5,000/day." },
      { name: "Complete Blood Count (CBC) - 10 times", original: 15000, fair: 6000, category: "Diagnostics", status: "Overcharged", reason: "Billed for 10 CBC tests. Case history indicates only 4 tests were ordered and conducted." },
      { name: "IV Infusion Pump Charge (12 cycles)", original: 24000, fair: 8000, category: "Special Services", status: "Overcharged", reason: "Standard protocol is flat daily rent for pump (₹1,600/day). Charged ₹2,000 per IV fluid change." },
      { name: "Physiotherapy charges", original: 10000, fair: 0, category: "Doctor Fees", status: "Not Administered", reason: "Physiotherapist never visited the patient. Billed by system code error." },
      { name: "Nursing Charges (Flat rate)", original: 12000, fair: 12000, category: "Special Services", status: "Reasonable", reason: "Standard nursing care charges." },
      { name: "Medicines & IV Fluids", original: 12000, fair: 13000, category: "Pharmacy", status: "Reasonable", reason: "Standard saline and Paracetamol formulations." }
    ],
    warnings: [
      { id: "warn-1", type: "danger", title: "Diagnostic Test Duplication", text: "10 CBC tests were billed. Standard dengue critical monitoring requires max 1-2 daily tests. Case records verify only 4 tests occurred.", action: "Request Diagnostic Log Sheet" },
      { id: "warn-2", type: "danger", title: "Unadministered Physiotherapy charges", text: "Physiotherapy of ₹10,000 was billed. The patient was admitted for infectious dengue fever and received no physical therapy.", action: "Dispute Unrendered Services" },
      { id: "warn-3", type: "warning", title: "Infusion Pump Rental Multiplier", text: "Charging per IV bottle instead of a flat daily pump rental rate violates typical IRDAI guidelines.", action: "Challenge Rental Multipliers" }
    ],
    chartData: { room: 25000, ot: 0, doctor: 0, consumables: 13000, other: 26000 }
  }
};

// Prescription Decoder Database
const prescriptionDB = [
  {
    brand: "Lipitor (10mg)",
    generic: "Atorvastatin",
    brandPrice: 320.00,
    genericPrice: 35.50,
    category: "Cholesterol / Cardiovascular",
    indication: "Used to lower LDL cholesterol and triglycerides in the blood, reducing cardiovascular risks like heart attacks.",
    warnings: "Avoid consuming grapefruit juice (increases drug side-effects). Report any unexplained muscle pain, tenderness, or weakness to your doctor immediately.",
    usage: "Take once daily, preferably in the evening, with or without food."
  },
  {
    brand: "Jalra-M (50mg/500mg)",
    generic: "Vildagliptin + Metformin",
    brandPrice: 280.00,
    genericPrice: 48.00,
    category: "Anti-Diabetic",
    indication: "Combination oral medication used to manage blood glucose levels in patients with Type-2 Diabetes Mellitus.",
    warnings: "Do not skip meals while taking this to prevent sudden low blood sugar (hypoglycemia). Avoid heavy alcohol intake as it raises lactic acidosis risk.",
    usage: "Take twice daily, with or immediately after meals to minimize gastrointestinal discomfort."
  },
  {
    brand: "Pantocid (40mg)",
    generic: "Pantoprazole",
    brandPrice: 160.00,
    genericPrice: 22.00,
    category: "Gastrointestinal / Antacid",
    indication: "Proton Pump Inhibitor (PPI) that reduces excess stomach acid. Treats GERD, acid reflux, and stomach ulcers.",
    warnings: "Long-term usage can decrease calcium absorption. If taking for more than 3 months, consult your doctor regarding bone density and magnesium levels.",
    usage: "Take once daily, strictly 30 to 45 minutes before your first meal (breakfast)."
  },
  {
    brand: "Clopilet (75mg)",
    generic: "Clopidogrel",
    brandPrice: 195.00,
    genericPrice: 38.00,
    category: "Blood Thinner / Antiplatelet",
    indication: "Prevents platelets in the blood from sticking together, reducing dangerous blood clots after stent surgery or stroke.",
    warnings: "Significantly increases bleeding risk. Inform surgeons/dentists about this drug before any procedure. Watch out for black tarry stools or blood in urine.",
    usage: "Take once daily at the same time each day, with or without food."
  },
  {
    brand: "Augmentin (625 Duo)",
    generic: "Amoxicillin + Clavulanic Acid",
    brandPrice: 223.50,
    genericPrice: 58.00,
    category: "Antibacterial / Antibiotic",
    indication: "Broad-spectrum penicillin antibiotic combined with a beta-lactamase inhibitor to treat middle ear, sinus, skin, and urinary infections.",
    warnings: "Finish the entire prescribed course even if symptoms disappear. Stopping early promotes antibiotic resistance. May cause mild diarrhea.",
    usage: "Take twice daily (every 12 hours) at the start of a meal to enhance absorption and reduce stomach upset."
  },
  {
    brand: "Glycomet GP2",
    generic: "Glimepiride + Metformin",
    brandPrice: 145.00,
    genericPrice: 28.00,
    category: "Anti-Diabetic",
    indication: "Dual combination blood sugar lowering agent for Type-2 Diabetes.",
    warnings: "Monitor blood glucose levels regularly. Be aware of signs of low blood sugar (cold sweats, dizziness, shaking).",
    usage: "Take once or twice daily with breakfast or dinner."
  }
];

// Cost Estimator Database
const procedureCosts = {
  angioplasty: {
    name: "Cardiac Angioplasty (Single Stent)",
    gov: { min: 45000, max: 70000 },
    pvtGen: { min: 140000, max: 210000 },
    pvtCorp: { min: 280000, max: 450000 }
  },
  csection: {
    name: "Maternity C-Section Delivery",
    gov: { min: 15000, max: 30000 },
    pvtGen: { min: 65000, max: 95000 },
    pvtCorp: { min: 150000, max: 240000 }
  },
  appendectomy: {
    name: "Laparoscopic Appendectomy",
    gov: { min: 20000, max: 35000 },
    pvtGen: { min: 55000, max: 80000 },
    pvtCorp: { min: 110000, max: 180000 }
  },
  kneereplace: {
    name: "Total Knee Replacement (Single Knee)",
    gov: { min: 75000, max: 110000 },
    pvtGen: { min: 160000, max: 240000 },
    pvtCorp: { min: 290000, max: 480000 }
  },
  normaldelivery: {
    name: "Normal / Vaginal Delivery",
    gov: { min: 8000, max: 15000 },
    pvtGen: { min: 35000, max: 55000 },
    pvtCorp: { min: 90000, max: 140000 }
  },
  gallbladder: {
    name: "Cholecystectomy (Gallbladder Removal)",
    gov: { min: 18000, max: 30000 },
    pvtGen: { min: 50000, max: 75000 },
    pvtCorp: { min: 100000, max: 165000 }
  }
};

// Regional cost adjustment multipliers
const cityMultipliers = {
  mumbai: 1.15,
  delhi: 1.10,
  bengaluru: 1.05,
  hyderabad: 1.00,
  chennai: 0.95,
  tier2: 0.80
};

// 2. Application Logic and Navigation

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupBillAnalyzer();
  setupPrescriptionDecoder();
  setupCostEstimator();
  setupRightsHub();
});

// Setup tab routing
function setupNavigation() {
  const navButtons = document.querySelectorAll("nav button, .hero-actions button, .feature-card .btn-link, .hero-text button");
  const sections = document.querySelectorAll(".app-section");

  navButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target") || btn.id.replace("btn-", "");
      
      // Update Active Navigation Item
      document.querySelectorAll("nav button").forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-target") === targetId) {
          b.classList.add("active");
        }
      });

      // Switch Visible Section
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === targetId) {
          sec.classList.add("active");
          // Smooth scroll to top of section content
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  });
}

// 3. Bill Analyzer Controller
let activeDisputeBillData = null; // Store currently simulated bill to pass to Dispute form

function setupBillAnalyzer() {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("file-input");
  const sampleBtns = document.querySelectorAll(".sample-btn");
  const resultsContainer = document.getElementById("analysis-results");
  const initialContainer = document.getElementById("initial-analyzer-view");
  const resetBtn = document.getElementById("reset-analyzer-btn");
  
  // Drag and drop event handlers
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });
  
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });
  
  uploadZone.addEventListener("click", () => {
    fileInput.click();
  });
  
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleUploadedFile(fileInput.files[0]);
    }
  });

  // Sample buttons click
  sampleBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const type = btn.getAttribute("data-bill");
      if (sampleBills[type]) {
        simulateScanning(sampleBills[type]);
      }
    });
  });

  // Reset bill analyzer
  resetBtn.addEventListener("click", () => {
    resultsContainer.style.display = "none";
    initialContainer.style.display = "grid";
    activeDisputeBillData = null;
  });
}

async function handleUploadedFile(file) {

    const uploadZone = document.getElementById("upload-zone");
    const originalText = uploadZone.innerHTML;

    uploadZone.style.pointerEvents = "none";

    uploadZone.innerHTML = `
        <div style="padding:1rem 0;">
            <span class="upload-icon">🤖</span>
            <p class="upload-text" style="color: var(--accent-teal);">
                AI is analyzing your hospital bill...
            </p>
            <p class="upload-subtext">
                Extracting text • Detecting charges • Comparing prices
            </p>
        </div>
    `;

    try {

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        uploadZone.innerHTML = originalText;
        uploadZone.style.pointerEvents = "auto";

        if (!response.ok) {
            alert(data.detail || data.error || "Analysis failed.");
            return;
        }

        simulateScanning(data);

    } catch (err) {

        console.error(err);

        uploadZone.innerHTML = originalText;
        uploadZone.style.pointerEvents = "auto";

        alert("Couldn't connect to the backend.");

    }

}

// Simulated scan overlay & delay
function simulateScanning(billData) {
  const uploadZone = document.getElementById("upload-zone");
  const originalText = uploadZone.innerHTML;
  
  uploadZone.style.pointerEvents = "none";
  uploadZone.innerHTML = `
    <div style="padding: 1rem 0;">
      <span class="upload-icon">🔍</span>
      <p class="upload-text" style="color: var(--accent-teal);">Digitizing Invoice & Extracting Charges...</p>
      <p class="upload-subtext">Comparing with Cap Tariffs & Price Capping Guidelines...</p>
      <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 999px; margin-top: 1rem; overflow: hidden; position: relative;">
        <div style="position: absolute; height: 100%; width: 50%; background: linear-gradient(90deg, var(--accent-teal), var(--accent-indigo)); border-radius: 999px; animation: loadingBar 1.2s infinite ease-in-out;"></div>
      </div>
    </div>
    <style>
      @keyframes loadingBar {
        0% { left: -50%; }
        100% { left: 100%; }
      }
    </style>
  `;

  setTimeout(() => {
    uploadZone.style.pointerEvents = "auto";
    uploadZone.innerHTML = originalText;
    renderAnalysis(billData);
  }, 1200);
}

function renderAnalysis(bill) {
  const resultsContainer = document.getElementById("analysis-results");
  const initialContainer = document.getElementById("initial-analyzer-view");
  
  initialContainer.style.display = "none";
  resultsContainer.style.display = "flex";
  
  activeDisputeBillData = bill; // Save globally for the dispute form

  const currencySymbol = bill.currencySymbol || '₹';

  // Set top totals
  document.getElementById("ana-total-original").textContent = `${currencySymbol}${bill.totalOriginal.toLocaleString('en-IN')}`;
  document.getElementById("ana-total-fair").textContent = `${currencySymbol}${bill.totalFair.toLocaleString('en-IN')}`;
  document.getElementById("ana-total-savings").textContent = `${currencySymbol}${bill.overcharge.toLocaleString('en-IN')}`;
  
  // Render tables
  const originalTableBody = document.getElementById("original-table-body");
  const auditedTableBody = document.getElementById("audited-table-body");
  
  originalTableBody.innerHTML = "";
  auditedTableBody.innerHTML = "";
  
  bill.items.forEach(item => {
    // Original Table Row
    const isFlagged = item.status === "Overcharged"||item.status === "Needs Review";
    const origRow = document.createElement("tr");
    if (isFlagged) origRow.classList.add("flagged");
    
    origRow.innerHTML = `
      <td>
        ${item.name} 
        ${isFlagged ? `<span class="badge" style="font-size: 0.7rem; background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.5rem; display: inline-block;">${item.status}</span>` : ""}
      </td>
      <td class="amount">${currencySymbol}${item.original.toLocaleString('en-IN')}</td>
    `;
    originalTableBody.appendChild(origRow);
    
    // Audited Table Row
    const auditRow = document.createElement("tr");
    auditRow.innerHTML = `
      <td>${item.name}</td>
      <td class="amount" style="color: ${item.fair < item.original ? 'var(--accent-green)' : 'var(--text-primary)'}">
        ${currencySymbol}${item.fair.toLocaleString('en-IN')}
      </td>
    `;
    auditedTableBody.appendChild(auditRow);
  });
  
  // Render findings pane
  const warningsList = document.getElementById("warnings-list");
  warningsList.innerHTML = "";
  
  bill.warnings.forEach(warn => {
    const card = document.createElement("div");
    card.className = `finding-card ${warn.type}`;
    card.innerHTML = `
      <div class="finding-icon">${warn.type === 'danger' ? '🚨' : '⚠️'}</div>
      <div class="finding-content">
        <h4>${warn.title}</h4>
        <p>${warn.text}</p>
        <span class="finding-action" onclick="activateDisputeFlow('${warn.title.replace(/'/g, "\\'")}')">
          📝 Pre-fill in Dispute Letter &rarr;
        </span>
      </div>
    `;
    warningsList.appendChild(card);
  });

  // Render SVG Donut Chart
  renderChart(bill.chartData, currencySymbol);
}

function renderChart(data, currencySymbol = '₹') {
  const values = Object.values(data);
  const total = values.reduce((a, b) => a + b, 0);
  const segments = document.querySelectorAll(".donut-segment");
  const chartValues = document.querySelectorAll(".legend-item .val");
  
  let accumulatedPercent = 0;
  
  segments.forEach((seg, idx) => {
    const val = values[idx] || 0;
    const percent = total > 0 ? (val / total) * 100 : 0;
    const strokeDash = `${percent} ${100 - percent}`;
    const strokeOffset = -accumulatedPercent;
    
    seg.style.strokeDasharray = strokeDash;
    seg.style.strokeDashoffset = strokeOffset;
    
    accumulatedPercent += percent;
  });

  // Update text values in Legend
  chartValues[0].textContent = `${currencySymbol}${(data.room || 0).toLocaleString('en-IN')}`;
  chartValues[1].textContent = `${currencySymbol}${(data.ot || 0).toLocaleString('en-IN')}`;
  chartValues[2].textContent = `${currencySymbol}${(data.doctor || 0).toLocaleString('en-IN')}`;
  chartValues[3].textContent = `${currencySymbol}${(data.consumables || 0).toLocaleString('en-IN')}`;
  chartValues[4].textContent = `${currencySymbol}${(data.other || 0).toLocaleString('en-IN')}`;
}

// Global action to route to dispute tab
window.activateDisputeFlow = function(grievanceTitle) {
  // Navigate to Rights Tab
  document.getElementById("btn-rights").click();
  
  // If active bill exists, pre-fill form
  if (activeDisputeBillData) {
    document.getElementById("patient-name").value = activeDisputeBillData.patient;
    document.getElementById("hospital-name").value = activeDisputeBillData.hospitalName;
    document.getElementById("bill-no").value = activeDisputeBillData.billNo;
    document.getElementById("admission-date").value = activeDisputeBillData.date;
    
    // Compile details
    let details = `Audit Discrepancies discovered:\n`;
    activeDisputeBillData.items.forEach(item => {
      if (item.status !== "Reasonable") {
        details += `- ${item.name}: Charged ₹${item.original} vs Fair Tariff ₹${item.fair} (${item.status} - ${item.reason})\n`;
      }
    });
    details += `\nPrimary Concern: ${grievanceTitle}\nTotal disputed overcharge: ₹${activeDisputeBillData.overcharge}`;
    document.getElementById("dispute-details").value = details;
    
    updateLetterPreview();
  }
};


// 4. Prescription Decoder Controller
async function searchMedicine(medicineName) {

    const response = await fetch(
        `https://careclarifyy-production.up.railway.app/compare?medicine_name=${encodeURIComponent(medicineName)}`
    );

    if (!response.ok) {
        throw new Error("Medicine not found");
    }

    return await response.json();
}
function setupPrescriptionDecoder() {
  const searchInput = document.getElementById("drug-search");
  const suggestionsList = document.getElementById("autocomplete-suggestions");
  const popularTags = document.querySelectorAll(".drug-tag");
  const comparisonContainer = document.getElementById("decoder-result-panel");
  const searchNotice = document.getElementById("decoder-notice");

  // Show suggestions as typing
 searchInput.addEventListener("change", async () => {

    const medicine = searchInput.value.trim();

    if (!medicine) return;

    try {

        const data = await searchMedicine(medicine);

        renderDrugComparison(data);

    } catch (err) {

        alert("Medicine not found");

    }

});

  // Hide suggestions list when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== searchInput) {
      suggestionsList.style.display = "none";
    }
  });

  // Handle popular drug tags clicks
 popularTags.forEach(tag => {
    tag.addEventListener("click", async () => {

        const medicine = tag.getAttribute("data-drug");

        searchInput.value = medicine;

        try {

            const data = await searchMedicine(medicine);

            renderDrugComparison(data);

        } catch (err) {

            alert("Medicine not found");

        }

    });
});
}

function renderDrugComparison(drug) {

    const comparisonContainer = document.getElementById("decoder-result-panel");
    const searchNotice = document.getElementById("decoder-notice");

    searchNotice.style.display = "none";
    comparisonContainer.style.display = "flex";

    const brandPrice = drug.selected_medicine.price || 0;
    const genericPrice = drug.cheapest.price || 0;

    const savingsPercent = Math.round(
        ((brandPrice - genericPrice) / brandPrice) * 100
    );

    document.getElementById("brand-title").textContent =
        drug.selected_medicine.brand_name;

    document.getElementById("brand-price-val").textContent =
        `₹${brandPrice.toFixed(2)}`;

    document.getElementById("generic-title").textContent =
        drug.cheapest.brand_name;

    document.getElementById("generic-price-val").textContent =
        `₹${genericPrice.toFixed(2)}`;

    document.getElementById("drug-savings-percent").textContent =
        `${savingsPercent}% SAVED`;

    document.getElementById("drug-savings-amount").textContent =
        `Save ₹${drug.potential_savings.toFixed(2)}`;

    document.getElementById("drug-therapeutic-class").textContent =
        drug.selected_medicine.category;

    document.getElementById("drug-indication").textContent =
drug.selected_medicine.description.substring(0,200) + "...";

    document.getElementById("drug-usage").textContent =
        drug.selected_medicine.manufacturer;

    document.getElementById("drug-warnings").textContent =
        drug.selected_medicine.side_effects;
}


// 5. Cost Estimator Controller
function setupCostEstimator() {
  const selectProcedure = document.getElementById("select-procedure");
  const selectCity = document.getElementById("select-city");
  const selectHospital = document.getElementById("select-hospital-type");
  const inputQuoted = document.getElementById("quoted-cost");
  
  const formElements = [selectProcedure, selectCity, selectHospital, inputQuoted];
  
  formElements.forEach(elem => {
    elem.addEventListener("change", calculateEstimates);
    if (elem === inputQuoted) {
      elem.addEventListener("input", calculateEstimates);
    }
  });

  calculateEstimates(); // Initial call
}

function calculateEstimates() {
  const procKey = document.getElementById("select-procedure").value;
  const cityKey = document.getElementById("select-city").value;
  const hospitalKey = document.getElementById("select-hospital-type").value;
  const quotedVal = parseFloat(document.getElementById("quoted-cost").value) || 0;
  
  const mult = cityMultipliers[cityKey] || 1.0;
  const baseRange = procedureCosts[procKey];
  
  if (!baseRange) return;

  // Calculate adjusted ranges for all 3 categories
  const govMin = Math.round(baseRange.gov.min * mult);
  const govMax = Math.round(baseRange.gov.max * mult);
  
  const pvtGenMin = Math.round(baseRange.pvtGen.min * mult);
  const pvtGenMax = Math.round(baseRange.pvtGen.max * mult);
  
  const pvtCorpMin = Math.round(baseRange.pvtCorp.min * mult);
  const pvtCorpMax = Math.round(baseRange.pvtCorp.max * mult);

  // Update Range Bar UI
  document.getElementById("est-gov-range").textContent = `₹${govMin.toLocaleString('en-IN')} - ₹${govMax.toLocaleString('en-IN')}`;
  document.getElementById("est-pvt-gen-range").textContent = `₹${pvtGenMin.toLocaleString('en-IN')} - ₹${pvtGenMax.toLocaleString('en-IN')}`;
  document.getElementById("est-pvt-corp-range").textContent = `₹${pvtCorpMin.toLocaleString('en-IN')} - ₹${pvtCorpMax.toLocaleString('en-IN')}`;

  // Get active selected tier range to evaluate the quoted value
  let activeMin = 0;
  let activeMax = 0;
  
  if (hospitalKey === "gov") {
    activeMin = govMin;
    activeMax = govMax;
  } else if (hospitalKey === "pvt-gen") {
    activeMin = pvtGenMin;
    activeMax = pvtGenMax;
  } else {
    activeMin = pvtCorpMin;
    activeMax = pvtCorpMax;
  }

  // Position the needle and update indicator status
  const needle = document.getElementById("fairness-needle");
  const statusLabel = document.getElementById("fairness-status-label");
  const gaugeExplanation = document.getElementById("fairness-explanation");
  
  if (quotedVal === 0) {
    needle.style.left = "50%";
    statusLabel.textContent = "Enter quoted cost to evaluate";
    statusLabel.style.color = "var(--text-secondary)";
    gaugeExplanation.textContent = "Compare your hospital's estimate against average local data.";
    return;
  }

  // Calculate position: mapping quotedVal relative to [activeMin, activeMax]
  let percentage = 0;
  if (quotedVal <= activeMin) {
    percentage = 15; // Low/Very Fair
    statusLabel.textContent = "Highly Reasonable Cost";
    statusLabel.style.color = "var(--accent-green)";
    gaugeExplanation.textContent = "The quote is at or below the regional average baseline. Billed charges appear highly fair.";
  } else if (quotedVal > activeMin && quotedVal <= activeMax) {
    // Scale between 20% and 60%
    const ratio = (quotedVal - activeMin) / (activeMax - activeMin);
    percentage = 20 + Math.round(ratio * 40);
    statusLabel.textContent = "Reasonable Range";
    statusLabel.style.color = "var(--accent-teal)";
    gaugeExplanation.textContent = "The quote is within the standard pricing corridor for this city and hospital tier.";
  } else if (quotedVal > activeMax && quotedVal <= activeMax * 1.3) {
    // Scale between 65% and 80%
    const ratio = (quotedVal - activeMax) / (activeMax * 0.3);
    percentage = 65 + Math.round(ratio * 15);
    statusLabel.textContent = "Slightly Elevated";
    statusLabel.style.color = "var(--accent-orange)";
    gaugeExplanation.textContent = "This estimate is roughly 10-30% higher than local averages. Double check itemized entries.";
  } else {
    percentage = 90; // Overpriced
    statusLabel.textContent = "Significantly Overpriced";
    statusLabel.style.color = "var(--accent-red)";
    gaugeExplanation.textContent = "This quote is substantially higher than peer benchmarks. Request an itemized split immediately.";
  }

  needle.style.left = `${percentage}%`;
}


// 6. Rights Hub & Grievance Letter Controller
function setupRightsHub() {
  // Setup accordion toggling
  const accordions = document.querySelectorAll(".accordion-trigger");
  
  accordions.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      const isOpen = parent.classList.contains("open");
      
      // Close other accordions
      document.querySelectorAll(".accordion-item").forEach(item => {
        item.classList.remove("open");
      });
      
      if (!isOpen) {
        parent.classList.add("open");
      }
    });
  });

  // Setup form fields auto-compiling to letter preview
  const inputs = [
    "patient-name", "hospital-name", "bill-no", 
    "admission-date", "dispute-details"
  ];
  
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", updateLetterPreview);
    }
  });

  const actionRequestElement = document.getElementById("action-request");
  if (actionRequestElement) {
    actionRequestElement.addEventListener("change", updateLetterPreview);
  }
  
  // Set initial preview text
  updateLetterPreview();

  // Print button
  document.getElementById("print-letter-btn").addEventListener("click", () => {
    window.print();
  });

  // Download raw text button
  document.getElementById("download-letter-btn").addEventListener("click", () => {
    const text = document.getElementById("letter-preview").textContent;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Medical_Bill_Dispute_Letter_${document.getElementById("patient-name").value || 'Patient'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function updateLetterPreview() {
  const patient = document.getElementById("patient-name").value || "[Patient Name]";
  const hospital = document.getElementById("hospital-name").value || "[Hospital Name & Branch]";
  const billNo = document.getElementById("bill-no").value || "[Bill Number / ID]";
  const date = document.getElementById("admission-date").value || "[Admission Date]";
  const disputes = document.getElementById("dispute-details").value || "- Billed Room Rent exceeds recommended tier caps\n- Unspecified medical consumables charges";
  const action = document.getElementById("action-request").value;
  
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  let actionClause = "";
  if (action === "audit") {
    actionClause = "I request a comprehensive itemized audit of the clinical chart files and physical inventory ledger within 48 hours. Please hold the final discharge execution pending this audit correction.";
  } else if (action === "refund") {
    actionClause = "I request an immediate refund of the identified overcharges (₹30,000+ as summarized) credited back to my source payment account.";
  } else {
    actionClause = "I request a revised billing summary with standardized tariffs pre-matched with the primary insurance provider's agreed capped limits.";
  }

  const template = `Date: ${today}

To,
The Medical Superintendent / Grievance Officer,
${hospital}

Subject: Formal Dispute of Hospital Invoice No: ${billNo}

Dear Sir/Madam,

I am writing to formally dispute several charges on the final medical invoice issued for the treatment of patient ${patient}, admitted on ${date}. 

As a consumer and patient under the Clinical Establishments Act and the National Charter of Patients' Rights, I have reviewed the itemized details and found significant pricing anomalies:

${disputes}

Under Indian health consumer safety regulations and pricing guidelines (including NPPA caps for medical implants and IRDAI rules on room rent proportions):
- Patients have a legal right to receive fully itemized bills rather than bundled generic codes.
- Room rent limits dictate proportional discounts on related medical services.
- Consumables cannot be double-billed if they are already accounted for in procedure package tariffs.

Therefore, ${actionClause}

Please note that we wish to resolve this amicably. However, should these incorrect charges not be addressed, I reserve the right to escalate this complaint to the District Consumer Disputes Redressal Forum, the state Clinical Establishment Registry board, and the Insurance Ombudsman.

I look forward to your prompt response.

Sincerely,

______________________________
Signature of Patient / Guardian
Contact Name: ${patient}
`;

  document.getElementById("letter-preview").textContent = template;
}
