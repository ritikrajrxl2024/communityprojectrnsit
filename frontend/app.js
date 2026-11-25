/**
 * StockLedger - Clinical Records & Biosecurity Withdrawal Registry
 * Pure Vanilla JavaScript (Zero external libraries, fully persistent via localStorage)
 */

(function () {
  'use strict';

  // --- BASELINE CLINICAL & LIVESTOCK AUDIT DATASET ---
  // Agriculturally verified drugs, lot numbers, and real-world withdrawal intervals
  const DEFAULT_LIVESTOCK = [
    {
      id: "TAG-402",
      rfid: "840 003 219 044 102",
      species: "Bovine",
      subClass: "Angus Heifer",
      location: "Pasture 3 (North Ridge)",
      quarantine: false,
      lastIntervention: {
        date: "2026-11-14",
        drug: "Noromycin 300 LA (Oxytetracycline)",
        type: "Antibiotic",
        lot: "LOT-992K81",
        dose: "20.0 mL",
        route: "Sub-Q (Neck)",
        meatWithholdDays: 28,
        milkWithholdDays: 4,
        tech: "Dr. C. Vance, DVM",
        notes: "Treated for early bovine respiratory disease (BRD). Temp 103.8 F. Responsive."
      }
    },
    {
      id: "TAG-408",
      rfid: "840 003 219 044 108",
      species: "Bovine",
      subClass: "Hereford Steer",
      location: "Feedlot Pen 2",
      quarantine: false,
      lastIntervention: {
        date: "2026-10-02",
        drug: "Bovi-Shield Gold FP5 L5",
        type: "Vaccination",
        lot: "LOT-84B901",
        dose: "2.0 mL",
        route: "Sub-Q (Neck)",
        meatWithholdDays: 21,
        milkWithholdDays: 0,
        tech: "M. Gallagher (Herdsman)",
        notes: "Annual modified-live booster for BVD 1 & 2, IBR, BRSV, PI3."
      }
    },
    {
      id: "TAG-119",
      rfid: "840 003 881 200 455",
      species: "Ovine",
      subClass: "Katahdin Ewe",
      location: "Barn 2 Nursery",
      quarantine: false,
      lastIntervention: {
        date: "2026-11-20",
        drug: "Bar-Vac CD/T Toxoid",
        type: "Vaccination",
        lot: "LOT-CDT774",
        dose: "2.0 mL",
        route: "Sub-Q (Axillary)",
        meatWithholdDays: 21,
        milkWithholdDays: 0,
        tech: "M. Gallagher (Herdsman)",
        notes: "Pre-lambing booster 4 weeks prior to expected lambing date."
      }
    },
    {
      id: "TAG-081",
      rfid: "840 003 671 902 311",
      species: "Caprine",
      subClass: "Boer Doe",
      location: "Isolation Pen 1",
      quarantine: true,
      lastIntervention: {
        date: "2026-11-18",
        drug: "Draxxin (Tulathromycin)",
        type: "Antibiotic",
        lot: "LOT-TRX402",
        dose: "2.5 mL",
        route: "Sub-Q (Neck)",
        meatWithholdDays: 18,
        milkWithholdDays: 0,
        tech: "Dr. C. Vance, DVM",
        notes: "Acute bacterial pneumonia. Strict physical quarantine."
      }
    },
    {
      id: "TAG-512",
      rfid: "840 003 119 554 892",
      species: "Bovine",
      subClass: "Charolais Bull",
      location: "Breeding Pasture B",
      quarantine: false,
      lastIntervention: {
        date: "2026-08-10",
        drug: "Ivomec Plus (Ivermectin + Clorsulon)",
        type: "Anthelmintic",
        lot: "LOT-IVM102",
        dose: "15.0 mL",
        route: "Sub-Q (Neck)",
        meatWithholdDays: 21,
        milkWithholdDays: 0,
        tech: "T. Henderson (Tech)",
        notes: "Pre-turnout deworming and liver fluke protocol."
      }
    },
    {
      id: "TAG-204",
      rfid: "840 003 540 882 109",
      species: "Porcine",
      subClass: "Duroc Gilt",
      location: "Grower Barn A",
      quarantine: false,
      lastIntervention: {
        date: "2026-11-22",
        drug: "Tylan 200 (Tylosin)",
        type: "Antibiotic",
        lot: "LOT-TYL881",
        dose: "4.0 mL",
        route: "Intramuscular",
        meatWithholdDays: 14,
        milkWithholdDays: 0,
        tech: "M. Gallagher (Herdsman)",
        notes: "Administered for swine dysentery control."
      }
    },
    {
      id: "TAG-733",
      rfid: "840 003 992 411 771",
      species: "Equine",
      subClass: "Quarter Horse Gelding",
      location: "Paddock South",
      quarantine: false,
      lastIntervention: {
        date: "2026-05-12",
        drug: "Prestige 5 + WNV",
        type: "Vaccination",
        lot: "LOT-EQ910A",
        dose: "1.0 mL",
        route: "Intramuscular",
        meatWithholdDays: 0,
        milkWithholdDays: 0,
        tech: "Dr. C. Vance, DVM",
        notes: "Annual spring 5-way equine encephalitis and West Nile vaccine."
      }
    }
  ];

  // Treatment audit events repository
  const DEFAULT_TREATMENT_HISTORY = [
    {
      id: "TXN-8801",
      animalTag: "TAG-204",
      species: "Porcine",
      date: "2026-11-22",
      drug: "Tylan 200 (Tylosin)",
      type: "Antibiotic",
      lot: "LOT-TYL881",
      route: "Intramuscular",
      dose: "4.0 mL",
      meatWithholdDays: 14,
      milkWithholdDays: 0,
      tech: "M. Gallagher (Herdsman)",
      notes: "Swine dysentery protocol."
    },
    {
      id: "TXN-8802",
      animalTag: "TAG-119",
      species: "Ovine",
      date: "2026-11-20",
      drug: "Bar-Vac CD/T Toxoid",
      type: "Vaccination",
      lot: "LOT-CDT774",
      route: "Sub-Q (Axillary)",
      dose: "2.0 mL",
      meatWithholdDays: 21,
      milkWithholdDays: 0,
      tech: "M. Gallagher (Herdsman)",
      notes: "Pre-lambing booster."
    },
    {
      id: "TXN-8803",
      animalTag: "TAG-081",
      species: "Caprine",
      date: "2026-11-18",
      drug: "Draxxin (Tulathromycin)",
      type: "Antibiotic",
      lot: "LOT-TRX402",
      route: "Sub-Q (Neck)",
      dose: "2.5 mL",
      meatWithholdDays: 18,
      milkWithholdDays: 0,
      tech: "Dr. C. Vance, DVM",
      notes: "Acute bacterial pneumonia. Transferred to Isolation Pen 1."
    },
    {
      id: "TXN-8804",
      animalTag: "TAG-402",
      species: "Bovine",
      date: "2026-11-14",
      drug: "Noromycin 300 LA (Oxytetracycline)",
      type: "Antibiotic",
      lot: "LOT-992K81",
      route: "Sub-Q (Neck)",
      dose: "20.0 mL",
      meatWithholdDays: 28,
      milkWithholdDays: 4,
      tech: "Dr. C. Vance, DVM",
      notes: "Cervical injection triangle, Sub-Q. Temp 103.8 F."
    },
    {
      id: "TXN-8805",
      animalTag: "TAG-408",
      species: "Bovine",
      date: "2026-10-02",
      drug: "Bovi-Shield Gold FP5 L5",
      type: "Vaccination",
      lot: "LOT-84B901",
      route: "Sub-Q (Neck)",
      dose: "2.0 mL",
      meatWithholdDays: 21,
      milkWithholdDays: 0,
      tech: "M. Gallagher (Herdsman)",
      notes: "Feedlot arrival protocol."
    },
    {
      id: "TXN-8806",
      animalTag: "TAG-512",
      species: "Bovine",
      date: "2026-08-10",
      drug: "Ivomec Plus",
      type: "Anthelmintic",
      lot: "LOT-IVM102",
      route: "Sub-Q (Neck)",
      dose: "15.0 mL",
      meatWithholdDays: 21,
      milkWithholdDays: 0,
      tech: "T. Henderson (Tech)",
      notes: "Pre-turnout herd deworming."
    },
    {
      id: "TXN-8807",
      animalTag: "TAG-733",
      species: "Equine",
      date: "2026-05-12",
      drug: "Prestige 5 + WNV",
      type: "Vaccination",
      lot: "LOT-EQ910A",
      route: "Intramuscular",
      dose: "1.0 mL",
      meatWithholdDays: 0,
      milkWithholdDays: 0,
      tech: "Dr. C. Vance, DVM",
      notes: "Annual immunization series."
    }
  ];

  // Storage Keys
  const STORAGE_KEY_HERD = "stockledger_herd_data_v1";
  const STORAGE_KEY_TREATMENTS = "stockledger_treatments_v1";

  // State
  let herdList = [];
  let treatmentsList = [];
  let activeFilterTerm = "";
  let activeSpeciesFilter = "ALL";
  let activeStatusFilter = "ALL";

  // Reference Date for calculation consistency
  const TODAY = new Date("2026-11-24T00:00:00");

  // DOM Elements
  const currentDateDisplay = document.getElementById("currentDateDisplay");
  const totalHeadCountEl = document.getElementById("totalHeadCount");
  const statutoryWithholdCountEl = document.getElementById("statutoryWithholdCount");
  const withholdCountBannerEl = document.getElementById("withholdCount");
  const quarantineCountEl = document.getElementById("quarantineCount");
  const overdueBoosterCountEl = document.getElementById("overdueBoosterCount");
  const activeLotCountEl = document.getElementById("activeLotCount");
  const herdTabCountEl = document.getElementById("herdTabCount");
  const treatmentTabCountEl = document.getElementById("treatmentTabCount");

  const herdTableBody = document.getElementById("herdTableBody");
  const treatmentsTableBody = document.getElementById("treatmentsTableBody");
  const herdEmptyState = document.getElementById("herdEmptyState");
  const treatmentEmptyState = document.getElementById("treatmentEmptyState");

  const globalSearchInput = document.getElementById("globalSearchInput");
  const speciesFilterSelect = document.getElementById("speciesFilterSelect");
  const statusFilterSelect = document.getElementById("statusFilterSelect");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  const filterWithholdOnlyBtn = document.getElementById("filterWithholdOnlyBtn");

  // Tab Elements
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // Modal Elements
  const recordModal = document.getElementById("recordModal");
  const openLogModalBtn = document.getElementById("openLogModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const recordTreatmentForm = document.getElementById("recordTreatmentForm");
  const formAdminDate = document.getElementById("formAdminDate");

  // Dossier Modal
  const dossierModal = document.getElementById("dossierModal");
  const closeDossierBtn = document.getElementById("closeDossierBtn");
  const dossierCloseFooterBtn = document.getElementById("dossierCloseFooterBtn");
  const dossierNewTreatmentBtn = document.getElementById("dossierNewTreatmentBtn");
  let currentDossierAnimal = null;

  // Actions
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const loadSampleDataBtn = document.getElementById("loadSampleDataBtn");
  const clearStorageBtn = document.getElementById("clearStorageBtn");
  const printLedgerBtn = document.getElementById("printLedgerBtn");

  // --- INITIALIZATION ---
  function init() {
    loadData();
    formatCurrentDate();
    initEventListeners();
    renderAll();
  }

  function formatCurrentDate() {
    const options = { year: "numeric", month: "short", day: "2-digit" };
    currentDateDisplay.textContent = TODAY.toLocaleDateString("en-US", options);
    formAdminDate.value = "2026-11-24";
  }

  function loadData() {
    try {
      const storedHerd = localStorage.getItem(STORAGE_KEY_HERD);
      const storedTx = localStorage.getItem(STORAGE_KEY_TREATMENTS);

      herdList = storedHerd ? JSON.parse(storedHerd) : JSON.parse(JSON.stringify(DEFAULT_LIVESTOCK));
      treatmentsList = storedTx ? JSON.parse(storedTx) : JSON.parse(JSON.stringify(DEFAULT_TREATMENT_HISTORY));
    } catch (e) {
      console.warn("Storage access restricted. Utilizing memory state.", e);
      herdList = JSON.parse(JSON.stringify(DEFAULT_LIVESTOCK));
      treatmentsList = JSON.parse(JSON.stringify(DEFAULT_TREATMENT_HISTORY));
    }
  }

  function persistData() {
    try {
      localStorage.setItem(STORAGE_KEY_HERD, JSON.stringify(herdList));
      localStorage.setItem(STORAGE_KEY_TREATMENTS, JSON.stringify(treatmentsList));
    } catch (e) {
      console.error("Unable to persist to localStorage", e);
    }
  }

  // --- STATUTORY WITHDRAWAL CALCULATIONS ---
  function calculateWithholdStatus(lastIntervention) {
    if (!lastIntervention || !lastIntervention.date) {
      return { active: false, daysRemaining: 0, clearanceDate: null };
    }

    const adminDate = new Date(lastIntervention.date + "T00:00:00");
    const withholdDays = parseInt(lastIntervention.meatWithholdDays, 10) || 0;

    if (withholdDays === 0) {
      return { active: false, daysRemaining: 0, clearanceDate: null };
    }

    const clearanceDate = new Date(adminDate);
    clearanceDate.setDate(clearanceDate.getDate() + withholdDays);

    const diffTime = clearanceDate.getTime() - TODAY.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        active: true,
        daysRemaining: diffDays,
        clearanceDate: clearanceDate.toISOString().split("T")[0]
      };
    }

    return {
      active: false,
      daysRemaining: 0,
      clearanceDate: clearanceDate.toISOString().split("T")[0]
    };
  }

  function getAnimalHealthState(animal) {
    if (animal.quarantine) {
      return { code: "QUARANTINE", label: "Quarantine", cssClass: "quarantine" };
    }

    const withhold = calculateWithholdStatus(animal.lastIntervention);
    if (withhold.active) {
      return {
        code: "WITHHOLD",
        label: `Withhold (${withhold.daysRemaining}d rem)`,
        cssClass: "withhold",
        daysRemaining: withhold.daysRemaining
      };
    }

    // Check if intervention was > 180 days ago (suggesting booster due)
    if (animal.lastIntervention && animal.lastIntervention.type === "Vaccination") {
      const adminDate = new Date(animal.lastIntervention.date + "T00:00:00");
      const elapsedDays = Math.floor((TODAY.getTime() - adminDate.getTime()) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 180) {
        return { code: "BOOSTER_DUE", label: "Booster Due", cssClass: "booster" };
      }
    }

    return { code: "CLEARED", label: "Healthy / Cleared", cssClass: "ok" };
  }

  // --- RENDERING PIPELINE ---
  function renderAll() {
    renderCensus();
    renderHerdTable();
    renderTreatmentsTable();
  }

  function renderCensus() {
    let withHoldCount = 0;
    let quarantineCount = 0;
    let overdueCount = 0;
    const lotSet = new Set();

    herdList.forEach(animal => {
      const withhold = calculateWithholdStatus(animal.lastIntervention);
      if (withhold.active) withHoldCount++;
      if (animal.quarantine) quarantineCount++;

      const state = getAnimalHealthState(animal);
      if (state.code === "BOOSTER_DUE") overdueCount++;
    });

    treatmentsList.forEach(tx => {
      if (tx.lot) lotSet.add(tx.lot);
    });

    totalHeadCountEl.textContent = herdList.length;
    statutoryWithholdCountEl.textContent = withHoldCount;
    withholdCountBannerEl.textContent = withHoldCount;
    quarantineCountEl.textContent = quarantineCount;
    overdueBoosterCountEl.textContent = overdueCount;
    activeLotCountEl.textContent = lotSet.size;

    herdTabCountEl.textContent = herdList.length;
    treatmentTabCountEl.textContent = treatmentsList.length;
  }

  function filterHerd(items) {
    return items.filter(animal => {
      if (activeSpeciesFilter !== "ALL" && animal.species !== activeSpeciesFilter) {
        return false;
      }

      const state = getAnimalHealthState(animal);
      if (activeStatusFilter !== "ALL" && state.code !== activeStatusFilter) {
        return false;
      }

      if (activeFilterTerm) {
        const term = activeFilterTerm.toLowerCase();
        const tagMatch = animal.id.toLowerCase().includes(term);
        const rfidMatch = animal.rfid && animal.rfid.toLowerCase().includes(term);
        const penMatch = animal.location && animal.location.toLowerCase().includes(term);
        const drugMatch = animal.lastIntervention && animal.lastIntervention.drug.toLowerCase().includes(term);
        const lotMatch = animal.lastIntervention && animal.lastIntervention.lot.toLowerCase().includes(term);

        if (!tagMatch && !rfidMatch && !penMatch && !drugMatch && !lotMatch) {
          return false;
        }
      }

      return true;
    });
  }

  function renderHerdTable() {
    const filtered = filterHerd(herdList);
    herdTableBody.innerHTML = "";

    if (filtered.length === 0) {
      herdEmptyState.style.display = "block";
      return;
    }
    herdEmptyState.style.display = "none";

    filtered.forEach(animal => {
      const state = getAnimalHealthState(animal);
      const withhold = calculateWithholdStatus(animal.lastIntervention);

      const tr = document.createElement("tr");

      let withholdHtml = `<span class="withhold-cell cleared">0 Days / Cleared</span>`;
      if (withhold.active) {
        withholdHtml = `
          <div class="withhold-cell active-withhold">
            <span>RESTRICTED</span>
            <span class="withhold-days-tag">${withhold.daysRemaining} days remaining (to ${withhold.clearanceDate})</span>
          </div>
        `;
      } else if (animal.lastIntervention && animal.lastIntervention.meatWithholdDays > 0) {
        withholdHtml = `
          <div class="withhold-cell cleared">
            <span>Cleared for harvest</span>
            <span class="withhold-days-tag">Elapsed ${animal.lastIntervention.date}</span>
          </div>
        `;
      }

      let interventionHtml = `<span style="color: var(--text-faint);">No recorded treatment</span>`;
      if (animal.lastIntervention) {
        interventionHtml = `
          <div>
            <strong>${escapeHtml(animal.lastIntervention.drug)}</strong>
            <span class="sub-rfid">${escapeHtml(animal.lastIntervention.type)} • ${animal.lastIntervention.date} • Lot: ${escapeHtml(animal.lastIntervention.lot)}</span>
          </div>
        `;
      }

      tr.innerHTML = `
        <td>
          <span class="tag-badge">${escapeHtml(animal.id)}</span>
          <span class="sub-rfid">${escapeHtml(animal.rfid || "No EID Assigned")}</span>
        </td>
        <td>
          <span class="species-cell">${escapeHtml(animal.species)}</span>
          <span class="species-sub">${escapeHtml(animal.subClass || "")}</span>
        </td>
        <td>
          <span>${escapeHtml(animal.location)}</span>
        </td>
        <td>
          <span class="status-badge ${state.cssClass}">${escapeHtml(state.label)}</span>
        </td>
        <td>
          ${interventionHtml}
        </td>
        <td>
          ${withholdHtml}
        </td>
        <td class="col-actions">
          <button type="button" class="btn btn-secondary btn-sm inspect-btn" data-tag="${escapeHtml(animal.id)}">Inspect</button>
        </td>
      `;

      herdTableBody.appendChild(tr);
    });

    herdTableBody.querySelectorAll(".inspect-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-tag");
        openDossierModal(tag);
      });
    });
  }

  function renderTreatmentsTable() {
    treatmentsTableBody.innerHTML = "";

    let filtered = treatmentsList;
    if (activeFilterTerm) {
      const term = activeFilterTerm.toLowerCase();
      filtered = filtered.filter(tx => {
        return (
          tx.animalTag.toLowerCase().includes(term) ||
          tx.drug.toLowerCase().includes(term) ||
          tx.lot.toLowerCase().includes(term) ||
          tx.tech.toLowerCase().includes(term)
        );
      });
    }

    if (filtered.length === 0) {
      treatmentEmptyState.style.display = "block";
      return;
    }
    treatmentEmptyState.style.display = "none";

    filtered.forEach(tx => {
      const tr = document.createElement("tr");

      let withholdBadge = `${tx.meatWithholdDays}d meat`;
      if (parseInt(tx.milkWithholdDays, 10) > 0) {
        withholdBadge += ` / ${tx.milkWithholdDays}d milk`;
      }
      if (parseInt(tx.meatWithholdDays, 10) === 0 && (!tx.milkWithholdDays || parseInt(tx.milkWithholdDays, 10) === 0)) {
        withholdBadge = "Zero-Day Withhold";
      }

      tr.innerHTML = `
        <td class="mono">${escapeHtml(tx.date)}</td>
        <td>
          <button type="button" class="link-btn mono inspect-from-tx" data-tag="${escapeHtml(tx.animalTag)}">${escapeHtml(tx.animalTag)}</button>
        </td>
        <td>
          <strong>${escapeHtml(tx.drug)}</strong>
          <span class="sub-rfid">${escapeHtml(tx.type)}</span>
        </td>
        <td class="mono">${escapeHtml(tx.lot)}</td>
        <td>${escapeHtml(tx.route)}</td>
        <td class="mono">${escapeHtml(tx.dose)}</td>
        <td><span class="mono" style="font-size:0.75rem;">${escapeHtml(withholdBadge)}</span></td>
        <td>${escapeHtml(tx.tech)}</td>
      `;

      treatmentsTableBody.appendChild(tr);
    });

    treatmentsTableBody.querySelectorAll(".inspect-from-tx").forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-tag");
        openDossierModal(tag);
      });
    });
  }

  // --- DOSSIER VIEW ---
  function openDossierModal(tagId) {
    const animal = herdList.find(a => a.id === tagId);
    if (!animal) return;

    currentDossierAnimal = animal;
    const state = getAnimalHealthState(animal);
    const withhold = calculateWithholdStatus(animal.lastIntervention);

    document.getElementById("dossierTagId").textContent = animal.id;
    const badgeEl = document.getElementById("dossierStatusBadge");
    badgeEl.textContent = state.label;
    badgeEl.className = `status-badge ${state.cssClass}`;

    document.getElementById("dossierSpecies").textContent = `${animal.species} (${animal.subClass || "Standard"})`;
    document.getElementById("dossierLocation").textContent = animal.location;
    document.getElementById("dossierRfid").textContent = animal.rfid || "Not Enrolled";

    const withholdValEl = document.getElementById("dossierWithholdStatus");
    if (withhold.active) {
      withholdValEl.textContent = `Active Withhold (${withhold.daysRemaining} days remaining)`;
      withholdValEl.style.color = "var(--status-withhold-text)";
    } else {
      withholdValEl.textContent = "Statutory Clearance Met";
      withholdValEl.style.color = "var(--status-ok-text)";
    }

    const timelineContainer = document.getElementById("dossierTimeline");
    timelineContainer.innerHTML = "";

    const animalTxHistory = treatmentsList.filter(t => t.animalTag === animal.id);

    if (animalTxHistory.length === 0) {
      timelineContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">No recorded treatment interventions for this identifier.</p>`;
    } else {
      animalTxHistory.forEach(tx => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
          <div class="timeline-meta mono">${escapeHtml(tx.date)} • Administered by ${escapeHtml(tx.tech)}</div>
          <div class="timeline-title">${escapeHtml(tx.drug)} (${escapeHtml(tx.type)})</div>
          <div class="timeline-details">
            Route: ${escapeHtml(tx.route)} | Dosage: ${escapeHtml(tx.dose)} | Batch: <span class="mono">${escapeHtml(tx.lot)}</span><br>
            Withhold: Meat ${tx.meatWithholdDays}d / Milk ${tx.milkWithholdDays || 0}d.<br>
            ${tx.notes ? `<em>Clinical Note: ${escapeHtml(tx.notes)}</em>` : ""}
          </div>
        `;
        timelineContainer.appendChild(item);
      });
    }

    dossierModal.classList.add("open");
    dossierModal.setAttribute("aria-hidden", "false");
  }

  function closeDossier() {
    dossierModal.classList.remove("open");
    dossierModal.setAttribute("aria-hidden", "true");
    currentDossierAnimal = null;
  }

  // --- RECORD SUBMISSION ---
  function openRecordModal(prefillTag) {
    recordTreatmentForm.reset();
    formAdminDate.value = "2026-11-24";
    document.getElementById("formMeatWithholdDays").value = 21;
    document.getElementById("formMilkWithholdDays").value = 0;
    document.getElementById("formAdministeredBy").value = "M. Gallagher (Herdsman)";

    if (prefillTag && typeof prefillTag === "string") {
      document.getElementById("formAnimalTag").value = prefillTag;
      const match = herdList.find(a => a.id === prefillTag);
      if (match) {
        document.getElementById("formSpecies").value = match.species;
        document.getElementById("formPen").value = match.location;
        if (match.rfid) document.getElementById("formRfidTag").value = match.rfid;
      }
    }

    recordModal.classList.add("open");
    recordModal.setAttribute("aria-hidden", "false");
    document.getElementById("formAnimalTag").focus();
  }

  function closeRecordModal() {
    recordModal.classList.remove("open");
    recordModal.setAttribute("aria-hidden", "true");
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const tagId = document.getElementById("formAnimalTag").value.trim().toUpperCase();
    const rfid = document.getElementById("formRfidTag").value.trim();
    const species = document.getElementById("formSpecies").value;
    const pen = document.getElementById("formPen").value.trim();
    const drugName = document.getElementById("formDrugName").value.trim();
    const classification = document.getElementById("formInterventionType").value;
    const lotNumber = document.getElementById("formLotNumber").value.trim().toUpperCase();
    const route = document.getElementById("formRoute").value;
    const dose = document.getElementById("formDose").value.trim();
    const adminDate = document.getElementById("formAdminDate").value;
    const meatWithhold = parseInt(document.getElementById("formMeatWithholdDays").value, 10) || 0;
    const milkWithhold = parseInt(document.getElementById("formMilkWithholdDays").value, 10) || 0;
    const tech = document.getElementById("formAdministeredBy").value.trim();
    const isQuarantine = document.getElementById("formQuarantineRequired").value === "YES";
    const notes = document.getElementById("formClinicalNotes").value.trim();

    if (!tagId || !drugName || !lotNumber) {
      alert("Please ensure Animal ID, Drug Name, and Manufacturer Lot # are provided.");
      return;
    }

    const newTreatment = {
      id: "TXN-" + Math.floor(1000 + Math.random() * 9000),
      animalTag: tagId,
      species: species,
      date: adminDate,
      drug: drugName,
      type: classification,
      lot: lotNumber,
      route: route,
      dose: dose,
      meatWithholdDays: meatWithhold,
      milkWithholdDays: milkWithhold,
      tech: tech,
      notes: notes
    };

    treatmentsList.unshift(newTreatment);

    let existingIndex = herdList.findIndex(a => a.id.toUpperCase() === tagId);

    const interventionSummary = {
      date: adminDate,
      drug: drugName,
      type: classification,
      lot: lotNumber,
      dose: dose,
      route: route,
      meatWithholdDays: meatWithhold,
      milkWithholdDays: milkWithhold,
      tech: tech,
      notes: notes
    };

    if (existingIndex >= 0) {
      herdList[existingIndex].species = species;
      herdList[existingIndex].location = pen;
      if (rfid) herdList[existingIndex].rfid = rfid;
      herdList[existingIndex].quarantine = isQuarantine;
      herdList[existingIndex].lastIntervention = interventionSummary;
    } else {
      herdList.unshift({
        id: tagId,
        rfid: rfid || "",
        species: species,
        subClass: "Commercial Stock",
        location: pen,
        quarantine: isQuarantine,
        lastIntervention: interventionSummary
      });
    }

    persistData();
    closeRecordModal();
    renderAll();

    if (dossierModal.classList.contains("open") && currentDossierAnimal && currentDossierAnimal.id === tagId) {
      openDossierModal(tagId);
    }
  }

  // --- CSV AUDIT EXPORT ---
  function exportAuditCsv() {
    if (treatmentsList.length === 0) {
      alert("No clinical treatment records to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Date",
      "Tag ID",
      "Species",
      "Medication / Biologic",
      "Classification",
      "Manufacturer Lot #",
      "Route",
      "Dosage",
      "Meat Withhold (Days)",
      "Milk Withhold (Days)",
      "Administering Technician / Vet",
      "Clinical Notes"
    ];

    const rows = treatmentsList.map(tx => [
      tx.id,
      tx.date,
      tx.animalTag,
      tx.species || "Bovine",
      `"${(tx.drug || "").replace(/"/g, '""')}"`,
      tx.type,
      tx.lot,
      tx.route,
      `"${tx.dose}"`,
      tx.meatWithholdDays,
      tx.milkWithholdDays || 0,
      `"${(tx.tech || "").replace(/"/g, '""')}"`,
      `"${(tx.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `StockLedger_Audit_Report_${TODAY.toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- EVENT LISTENERS ---
  function initEventListeners() {
    // Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        tabPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const targetTab = btn.getAttribute("data-tab");
        const targetPanel = document.getElementById(`tab-${targetTab}`);
        if (targetPanel) targetPanel.classList.add("active");
      });
    });

    // Filtering & Searching
    globalSearchInput.addEventListener("input", (e) => {
      activeFilterTerm = e.target.value.trim();
      renderHerdTable();
      renderTreatmentsTable();
    });

    speciesFilterSelect.addEventListener("change", (e) => {
      activeSpeciesFilter = e.target.value;
      renderHerdTable();
    });

    statusFilterSelect.addEventListener("change", (e) => {
      activeStatusFilter = e.target.value;
      renderHerdTable();
    });

    resetFiltersBtn.addEventListener("click", () => {
      globalSearchInput.value = "";
      speciesFilterSelect.value = "ALL";
      statusFilterSelect.value = "ALL";
      activeFilterTerm = "";
      activeSpeciesFilter = "ALL";
      activeStatusFilter = "ALL";
      renderHerdTable();
      renderTreatmentsTable();
    });

    // Alert Banner Action
    filterWithholdOnlyBtn.addEventListener("click", () => {
      document.querySelector('[data-tab="herd"]').click();
      statusFilterSelect.value = "WITHHOLD";
      activeStatusFilter = "WITHHOLD";
      renderHerdTable();
    });

    // Modal Triggers
    openLogModalBtn.addEventListener("click", () => openRecordModal());
    closeModalBtn.addEventListener("click", closeRecordModal);
    cancelModalBtn.addEventListener("click", closeRecordModal);
    recordTreatmentForm.addEventListener("submit", handleFormSubmit);

    // Dossier Modal
    closeDossierBtn.addEventListener("click", closeDossier);
    dossierCloseFooterBtn.addEventListener("click", closeDossier);
    dossierNewTreatmentBtn.addEventListener("click", () => {
      if (currentDossierAnimal) {
        const tag = currentDossierAnimal.id;
        closeDossier();
        openRecordModal(tag);
      }
    });

    // Close on backdrop click
    [recordModal, dossierModal].forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    });

    // Escape Key Handler
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeRecordModal();
        closeDossier();
      }
    });

    // CSV & Print
    exportCsvBtn.addEventListener("click", exportAuditCsv);
    printLedgerBtn.addEventListener("click", () => window.print());

    // Storage Maintenance
    loadSampleDataBtn.addEventListener("click", () => {
      if (confirm("Reset current registry to default baseline records? Custom entries will be re-seeded.")) {
        localStorage.removeItem(STORAGE_KEY_HERD);
        localStorage.removeItem(STORAGE_KEY_TREATMENTS);
        loadData();
        renderAll();
      }
    });

    clearStorageBtn.addEventListener("click", () => {
      if (confirm("Warning: Purge all local cache entries? This clears active records from this browser.")) {
        herdList = [];
        treatmentsList = [];
        persistData();
        renderAll();
      }
    });
  }

  // --- UTILITY ---
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Bootstrap
  document.addEventListener("DOMContentLoaded", init);
})();