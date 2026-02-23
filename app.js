// app.js (drop-in fix: checklist + person search + supervisor intent + concrete hints + applyChecklistLabels safety)
(() => {
  "use strict";
  const $ = (sel) => document.querySelector(sel);

  // -------- Config / Build --------
  const CFG = window.CONFIG || {};
  const BUILD = window.BUILD || { version: "dev", name: "VEVA Trainer", date: "" };

  const ASSET_BASE = CFG.assetBase || "assets/photos";
  const HEADSHOT_PREFIX = CFG.headshotPrefix || "headshot_";
  const HEADSHOT_COUNT = Number(CFG.headshotCount || 10);

  const _voiceCfg = (CFG.voiceAutosend !== undefined) ? CFG.voiceAutosend
                  : (CFG.voiceAutoSend !== undefined) ? CFG.voiceAutoSend
                  : undefined;
  const VOICE_AUTOSEND = (_voiceCfg === undefined) ? true : !!_voiceCfg;

  const MAX_VISIBLE_BUBBLES = 4;
  const TRANSPARENT_PX = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  // -------- UI --------
  const versionPill = $("#versionPill");
  const studentPill = $("#studentPill");
  const voiceStatus = $("#voiceStatus");
  const debugPill = $("#debugPill");

  const loginModal = $("#loginModal");
  const studentSurnameInput = $("#studentSurname");
  const studentGroupSel = $("#studentGroup");
  const studentDifficultySel = $("#studentDifficulty");
  const btnStartTraining = $("#btnStartTraining");
  const loginError = $("#loginError");

  const btnReset = $("#btnReset");
  const btnReturn = $("#btnReturn");
  const btnPersonSearch = $("#btnPersonSearch");
  const btnSignIn = $("#btnSignIn");
  const btnDeny = $("#btnDeny");
  const btnNewScenario = $("#btnNewScenario");

  const holdToTalk = $("#holdToTalk");
  const textInput = $("#textInput");
  const btnSend = $("#btnSend");

  // ID UI
  const idCardWrap = $("#idCardWrap");
  const btnReturnId = $("#btnReturnId");
  const idPhoto = $("#idPhoto");
  const portraitPhoto = $("#portraitPhoto");
  const portraitMood = $("#portraitMood");

  const idName = $("#idName");
  const idSurname = $("#idSurname");
  const idDob = $("#idDob");
  const idNat = $("#idNat");
  const idNo = $("#idNo");
  const idBarcode2 = $("#idBarcode2");
  const idLevel = $("#idLevel");

  const hintBand = $("#hintBand");
  const hintBandText = $("#hintBandText");

  // Supervisor modal
  const supervisorModal = $("#supervisorModal");
  const btnCloseSupervisor = $("#btnCloseSupervisor");
  const btnSupervisorCheck = $("#btnSupervisorCheck");
  const btnReturnToVisitor = $("#btnReturnToVisitor");
  const svWhy = $("#svWhy");
  const svAppt = $("#svAppt");
  const svWho = $("#svWho");
  const svAbout = $("#svAbout");
  const svTime = $("#svTime");
  const svNote = $("#svNote");

  // Person Search overlay
  const psOverlay = $("#personSearchOverlay");
  const psClose = $("#psClose");
  const psTransition = $("#psTransition");
  const psBody = $("#psBody");
  const psQuery = $("#psQuery");
  const psDoSearch = $("#psDoSearch");
  const psBack = $("#psBack");
  const psResults = $("#psResults");

  // Chat slots
  const slotEls = [
    { row: $("#slot0"), av: $("#slot0Avatar"), txt: $("#slot0Text"), meta: $("#slot0Meta") },
    { row: $("#slot1"), av: $("#slot1Avatar"), txt: $("#slot1Text"), meta: $("#slot1Meta") },
    { row: $("#slot2"), av: $("#slot2Avatar"), txt: $("#slot2Text"), meta: $("#slot2Meta") },
    { row: $("#slot3"), av: $("#slot3Avatar"), txt: $("#slot3Text"), meta: $("#slot3Meta") },
    { row: $("#slot4"), av: $("#slot4Avatar"), txt: $("#slot4Text"), meta: $("#slot4Meta") },
    { row: $("#slot5"), av: $("#slot5Avatar"), txt: $("#slot5Text"), meta: $("#slot5Meta") },
  ];
  const MAX_SLOTS = slotEls.length;

  // Version banner
  const __assetVer = String(window.__ASSET_VER__ || "");
  const __assetShort = __assetVer ? __assetVer.slice(-6) : "";
  if (versionPill) versionPill.textContent = `v${BUILD.version}${__assetShort ? " · " + __assetShort : ""}`;
  document.title = `${BUILD.name} v${BUILD.version}${__assetShort ? " (" + __assetShort + ")" : ""}`;

  // -------- Helpers --------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pad2 = (n) => String(n).padStart(2, "0");
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  function pick(arr){
    if (!Array.isArray(arr) || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function normalize(s){
    return String(s || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}: ]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Safety for older patches
  window.applyChecklistLabels = window.applyChecklistLabels || function(){ return null; };

  function shouldShowHints(){
    return (session?.difficulty || "standard") !== "advanced";
  }
  function setHintText(t){
    if (!hintBandText) return;
    hintBandText.textContent = t || "";
  }

  // -------- Assets / Avatars --------
  const soldierAvatar = new Image();
  soldierAvatar.src = `${ASSET_BASE}/soldier.png`;
  soldierAvatar.onerror = () => { soldierAvatar.src = TRANSPARENT_PX; };
  const visitorAvatar = portraitPhoto || { src: "" };

  // -------- Student session --------
  const STUDENT_KEY = "veva.student.v2";
  let session = { surname:"", group:"", difficulty:"standard" };
  function loadStudentPrefill(){ try{ return JSON.parse(localStorage.getItem(STUDENT_KEY) || "null"); } catch { return null; } }
  function saveStudentPrefill(v){ try{ localStorage.setItem(STUDENT_KEY, JSON.stringify(v)); } catch {} }
  function updateStudentPill(){
    if (!studentPill) return;
    if (!session.surname || !session.group){ studentPill.textContent = "Student: —"; return; }
    const cap = (s) => (s||"").charAt(0).toUpperCase() + (s||"").slice(1);
    studentPill.textContent = `Student: ${session.surname} | Group: ${session.group} | ${cap(session.difficulty)}`;
  }

  // -------- ID + Visitor (male only) --------
  function headshotPath(index){ return `${ASSET_BASE}/${HEADSHOT_PREFIX}${pad2(index)}.png`; }
  function makeRandomId(){
    const idx = randInt(1, HEADSHOT_COUNT);
    const FIRST = ["Liam","Noah","James","Oliver","Lucas","Milan","Daan","Sem","Jayden","Finn","Benjamin","Ethan","Jack","Thomas"];
    const LAST  = ["Miller","Bakker","de Vries","Jansen","Visser","Smit","Bos","van Dijk","de Jong","Meijer"];
    const NATS  = ["Dutch","German","Belgian","French","British"];
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const first = pick(FIRST);
    const last  = pick(LAST);
    const year  = randInt(1976, 2002);
    const month = MONTHS[randInt(0, MONTHS.length - 1)];
    const day   = pad2(randInt(1, 28));
    const nat   = pick(NATS);
    const idNo  = (nat === "Dutch" ? "NL-" : nat === "German" ? "DE-" : nat === "Belgian" ? "BE-" : nat === "French" ? "FR-" : "UK-")
                  + randInt(100000, 999999);
    return { first, last, name: `${first} ${last}`, dob: `${day} ${month} ${year}`, nat, idNo, headshotIndex: idx, photoSrc: headshotPath(idx) };
  }

  function makeContact(){
    const RANKS = ["Sergeant","Corporal","Lieutenant","Captain"];
    const LASTS = ["Burke","Berk","Berg","de Vries","Jansen","Smit","Miller","Visser","Bos","van Dijk"];
    const rank = pick(RANKS);
    const baseLast = pick(LASTS);
    return { rank, last: baseLast, lastAlt: baseLast, full: `${rank} ${baseLast}` };
  }

  let ID_DATA = makeRandomId();
  function syncVisitorAvatars(){
    if (portraitPhoto) portraitPhoto.src = ID_DATA.photoSrc || TRANSPARENT_PX;
    visitorAvatar.src = ID_DATA.photoSrc || TRANSPARENT_PX;
    if (idPhoto) idPhoto.src = ID_DATA.photoSrc || TRANSPARENT_PX;
  }

  // -------- Mood --------
  const MOODS = [
    { key:"relaxed",  line:"The visitor looks relaxed.",  liarBias:0.08 },
    { key:"neutral",  line:"The visitor looks neutral.",  liarBias:0.12 },
    { key:"mixed",    line:"The visitor looks a bit uneasy.", liarBias:0.22 },
    { key:"nervous",  line:"The visitor looks nervous.",  liarBias:0.35 },
    { key:"irritated",line:"The visitor looks irritated.",liarBias:0.28 }
  ];
  let currentMood = MOODS[1];
  function syncMoodUI(){
    if (portraitMood) portraitMood.textContent = currentMood?.line || "";
  }

  // -------- Intents --------
  function getIntentList(){ return Array.isArray(window.VEVA_INTENTS) ? window.VEVA_INTENTS : []; }
  function detectIntent(text){
    const raw = String(text || "");
    const n = normalize(raw);

    // disambiguation
    if (/\bwith\s+who(m)?\b/i.test(n) || /\bwho\s+are\s+you\s+(meeting|seeing)\b/i.test(n) || /\bappointment\s+with\b/i.test(n)) return "who_meeting";
    if (/\bwhat\s+time\b/i.test(n) || (/\bwhen\b/i.test(n) && /\b(appointment|meeting)\b/i.test(n))) return "time_meeting";
    if ((/\b(what\s+is|what's)\b/i.test(n) && /\b(appointment|meeting)\b/i.test(n) && /\babout\b/i.test(n))) return "about_meeting";

    for (const it of getIntentList()){
      try{ if (it && it.rx && it.rx.test(raw)) return it.key; }catch{}
    }
    return "unknown";
  }

  // -------- Scenario state --------
  let history = []; // newest first
  let state = null;

  // Visitor delayed replies with typing dots
  const VISITOR_REPLY_DELAY_MS = 900;
  const VISITOR_APPROACH_DELAY_MS = 1500;
  const _visitorQueue = [];
  let _approachTimer = null;
  let _visitorTimer = null;

  function hardHideRow(slot){
    if (!slot?.row) return;
    slot.row.hidden = true;
    slot.row.style.display = "none";
    if (slot.av){
      slot.av.hidden = true;
      slot.av.style.display = "none";
      slot.av.src = TRANSPARENT_PX;
      slot.av.alt = "";
    }
    if (slot.txt){
      slot.txt.classList.remove("typing");
      slot.txt.textContent = "";
    }
    if (slot.meta) slot.meta.textContent = "";
  }
  function showRow(slot){
    if (!slot?.row) return;
    slot.row.hidden = false;
    slot.row.style.display = "";
    if (slot.av){
      slot.av.hidden = false;
      slot.av.style.display = "";
    }
  }

  function renderHistory(){
    const base = history.slice(0, Math.min(MAX_VISIBLE_BUBBLES, MAX_SLOTS));
    const typingMsg =
      (state?.typing?.visitor) ? { side:"visitor", typing:true } :
      (state?.typing?.student) ? { side:"student", typing:true } :
      null;
    const view = typingMsg ? [typingMsg, ...base].slice(0, Math.min(MAX_VISIBLE_BUBBLES, MAX_SLOTS)) : base;

    for (let i = 0; i < MAX_SLOTS; i++){
      const msg = view[i];
      const slot = slotEls[i];
      if (!slot?.row) continue;

      if (!msg){ hardHideRow(slot); continue; }

      showRow(slot);
      slot.row.classList.toggle("left", msg.side === "visitor");
      slot.row.classList.toggle("right", msg.side === "student");

      if (slot.av){
        if (msg.side === "visitor"){
          slot.av.src = visitorAvatar.src || TRANSPARENT_PX;
          slot.av.alt = "Visitor";
        } else {
          slot.av.src = soldierAvatar.src || TRANSPARENT_PX;
          slot.av.alt = "Soldier";
        }
      }
      if (slot.meta) slot.meta.textContent = "";

      if (slot.txt){
        slot.txt.classList.toggle("typing", !!msg.typing);
        if (msg.typing){
          slot.txt.innerHTML = '<span class="typingDots" aria-label="Typing"><span></span><span></span><span></span></span>';
        } else {
          slot.txt.textContent = msg.text || "";
        }
      }
    }
  }

  function setDebugPill(text){
    if (!debugPill) return;
    const DEBUG_ENABLED = (CFG.debug !== undefined) ? !!CFG.debug : true;
    if (!DEBUG_ENABLED){ debugPill.hidden = true; return; }
    debugPill.hidden = false;
    debugPill.textContent = text || "Debug: —";
  }

  function updateChecklist(id, done=true){
    try{ window.VEVA_CHECKLIST?.setDone?.(id, done); }catch{}
  }

  function updateHintBand(force=false){
    if (!hintBand) return;
    if (!shouldShowHints()){ hintBand.hidden = true; hintBand.style.display="none"; return; }
    if (state?.idVisible){ hintBand.hidden = true; hintBand.style.display="none"; return; }

    const diff = (session?.difficulty || "standard");
    const canShow = force || diff === "basic" || (diff === "standard" && (state?.misses || 0) >= 2);
    if (!canShow){ hintBand.hidden = true; hintBand.style.display="none"; return; }

    hintBand.hidden = false;
    hintBand.style.display = "";
    setHintText(getNextHint());
  }

  function nudge(t){
    if (!state) return;
    state.misses = (state.misses || 0) + 1;
    if (!shouldShowHints() || state?.idVisible) return;
    setHintText(t || getNextHint());
    if (hintBand){ hintBand.hidden = false; hintBand.style.display=""; }
  }

  function getMeetingTimeHHMM(){
    state.facts = state.facts || {};
    if (state.facts.meetingTime && /^\d{2}:\d{2}$/.test(state.facts.meetingTime)) return state.facts.meetingTime;
    const now = new Date();
    const offsetMin = randInt(15, 25);
    const dt = new Date(now.getTime() + offsetMin * 60 * 1000);
    const hhmm = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    state.facts.meetingTime = hhmm;
    return hhmm;
  }

  // Concrete, phase-aware hinting
  function getNextHint(){
    const f = state?.facts || {};
    // Gate 5W/H
    if (!f.name) return 'Example: "Good morning. What is your full name?"';
    if (!f.purpose) return 'Example: "What is the purpose of your visit today?"';
    if (!f.appt) return 'Example: "Do you have an appointment?"';
    if (f.appt === "yes"){
      if (!f.who) return 'Example: "With whom do you have an appointment?"';
      if (!f.time) return 'Example: "What time is your appointment?"';
      if (!f.about) return 'Example: "What is the appointment about?"';
    }
    if (!state?.idChecked) return 'Example: "May I see your ID, please?"';
    if (!state?.rulesExplained) return 'Example: "On base, drugs, alcohol and weapons are not allowed. Everyone can be frisked."';
    return 'Example: "Please follow the signs to reception. Have a good day."';
  }

  // -------- Visitor replies (fallback) --------
  const VISITOR_FALLBACK = {
    greeting: ["Hello."],
    need_help: ["I need to get onto the base."],
    appointment_yes: ["Yes, I have an appointment."],
    who_meeting: ["I’m meeting Sergeant de Vries."],
    about_meeting: ["It’s about maintenance at the workshop."],
    deny_why: ["Why are you denying me?"],
    thanks: ["Thanks."]
  };

  function pickBank(key, fallbackArr){
    // If phrasebank exists, use it; otherwise fallback
    try{
      const qa = window.PS_PATCH?.QA?.[key];
      if (!qa) return pick(fallbackArr) || "Okay.";
      const bandFromMood = window.PS_PATCH?.bandFromMoodKey?.(currentMood?.key) || "cautious";
      const arr = qa[bandFromMood] || qa.cautious || qa.open || qa.evasive || [];
      return pick(arr) || pick(fallbackArr) || "Okay.";
    }catch{
      return pick(fallbackArr) || "Okay.";
    }
  }

  function enqueueVisitor(text){
    const t = String(text || "").trim();
    if (!t) return;
    _visitorQueue.push(t);
    drainVisitorQueue();
  }

  function drainVisitorQueue(){
    if (_visitorTimer) return;
    if (!_visitorQueue.length) return;

    if (state?.typing){
      state.typing.visitor = true;
      state.typing.student = false;
    }
    renderHistory();

    _visitorTimer = setTimeout(() => {
      _visitorTimer = null;
      if (state?.typing) state.typing.visitor = false;
      const next = _visitorQueue.shift();
      if (next) pushVisitor(next);
      if (_visitorQueue.length) drainVisitorQueue();
    }, VISITOR_REPLY_DELAY_MS);
  }

  function pushVisitor(text){
    const t = String(text || "").trim();
    if (!t) return;
    history.unshift({ side:"visitor", text:t });
    history = history.slice(0, MAX_VISIBLE_BUBBLES);
    if (state) state.misses = 0;
    renderHistory();
    setDebugPill(`Intent: — · Stage: ${state.stage}`);
    updateHintBand();
  }

  function pushStudent(text){
    const t = String(text || "").trim();
    if (!t) return;
    if (state?.typing) state.typing.student = false;
    history.unshift({ side:"student", text:t });
    history = history.slice(0, MAX_VISIBLE_BUBBLES);
    if (state) state.misses = 0;
    renderHistory();
    updateHintBand();
  }

  // -------- ID card show/hide --------
  function showId(){
    if (!idCardWrap || !state?.visitor) return;
    const v = state.visitor;
    if (idName) idName.textContent = v.name || "";
    if (idSurname) idSurname.textContent = v.last || "";
    if (idDob) idDob.textContent = v.dob || "";
    if (idNat) idNat.textContent = v.nat || "";
    if (idNo) idNo.textContent = v.idNo || "";
    if (idPhoto) idPhoto.src = v.photoSrc || TRANSPARENT_PX;
    if (idBarcode2) idBarcode2.textContent = `VEVA|${v.idNo}|${v.dob}|${v.nat}`;
    if (idLevel) idLevel.textContent = (session?.difficulty || "standard").toUpperCase();
    idCardWrap.hidden = false;
    idCardWrap.style.display = "";
    state.idVisible = true;
    if (hintBand){ hintBand.hidden = true; }
  }
  function hideId(){
    if (idCardWrap){ idCardWrap.hidden = true; idCardWrap.style.display = "none"; }
    if (state) state.idVisible = false;
    updateHintBand(true);
  }

  // -------- Person Search --------
  const PERSON_DB = [
    {name:"Sgt. Jansen", desc:"Platoon Sergeant, Training Company", location:"Building 12, Office 2.14"},
    {name:"Lt. de Vries", desc:"Duty Officer", location:"HQ, 1st Floor"},
    {name:"Ms. Van Dijk", desc:"Civilian contractor (IT)", location:"Building 4, Service Desk"},
    {name:"Cpl. Bakker", desc:"Armoury staff", location:"Armoury, Gate B"},
    {name:"Capt. Smit", desc:"Company Commander", location:"HQ, 2nd Floor"},
  ];

  async function openPersonSearch(){
    if (!psOverlay) return;
    psOverlay.hidden = false;
    psOverlay.style.display = "";
    if (psTransition) psTransition.hidden = false;
    if (psBody) psBody.hidden = true;
    updateChecklist("search", true);

    // Transition message requested
    enqueueVisitor("Okay. (Switching to Person Search…)");

    await sleep(900);
    if (psTransition) psTransition.hidden = true;
    if (psBody) psBody.hidden = false;
    psQuery?.focus();
    renderSearch("");
  }

  function closePersonSearch(){
    if (!psOverlay) return;
    psOverlay.hidden = true;
    psOverlay.style.display = "none";
  }

  function renderSearch(q){
    if (!psResults) return;
    const query = normalize(q);
    const res = PERSON_DB.filter(p => !query || normalize(p.name).includes(query) || normalize(p.desc).includes(query));
    psResults.innerHTML = "";
    if (!res.length){
      psResults.innerHTML = `<div class="psResult"><div class="nm">No results</div><div class="ds">Try another spelling.</div></div>`;
      return;
    }
    for (const p of res){
      const card = document.createElement("div");
      card.className = "psResult";
      card.innerHTML = `<div class="nm">${p.name}</div><div class="ds">${p.desc}</div><div class="lc">Location: ${p.location}</div>`;
      const b = document.createElement("button");
      b.className = "sideBtn primary";
      b.textContent = "Select";
      b.addEventListener("click", ()=>{
        state.facts.who = "known";
        // Concrete hint for directions
        nudge(`Example: "You need to go to ${p.location}. Please follow the signs and report at reception."`);
        enqueueVisitor("Thanks.");
        closePersonSearch();
      });
      card.appendChild(b);
      psResults.appendChild(card);
    }
  }

  // -------- Supervisor report --------
  function openSupervisor(){
    if (!supervisorModal) return;
    supervisorModal.hidden = false;
    supervisorModal.style.display = "";
  }
  function closeSupervisor(){
    if (!supervisorModal) return;
    supervisorModal.hidden = true;
    supervisorModal.style.display = "none";
  }
  function fillSupervisor(){
    const v = state?.visitor;
    const f = state?.facts || {};
    const t = f.meetingTime || getMeetingTimeHHMM();

    if (svWhy) svWhy.value = v?.name ? `Bezoeker: ${v.name}` : "Bezoeker: (onbekend)";
    if (svAppt) svAppt.value = (f.appt === "yes" ? "ja" : f.appt === "no" ? "nee" : "ja");
    if (svWho) svWho.value = v?.contact?.full ? v.contact.full : "Sergeant de Vries";
    if (svTime) svTime.value = t;
    if (svAbout) svAbout.value = (f.about ? "Afspraak over: " + f.about : "Afspraak over: onderhoud/meeting");

    if (svNote){
      svNote.textContent = `Voorbeeld NL zin: "Hij is hier voor ${svWho?.value || "Sergeant de Vries"} om ${svAbout?.value.replace(/^Afspraak over:\s*/,"")} te bespreken om ${t}."`;
    }
    updateChecklist("supervisor", true);
  }

  // Detect "contact supervisor" even if intents patch missing
  function isContactSupervisor(raw){
    const n = normalize(raw);
    return /\b(contact|call|check\s+with)\s+(my\s+)?supervisor\b/.test(n) || /\bi\s*(will|ll)\s*(just\s*)?(go\s*)?contact\s*(my\s*)?supervisor\b/.test(n);
  }

  // -------- Dialogue --------
  function resetScenario(){
    currentMood = MOODS[randInt(0, MOODS.length - 1)];
    syncMoodUI();

    ID_DATA = makeRandomId();
    syncVisitorAvatars();

    history.length = 0;

    state = {
      stage: "approach",
      typing: { visitor:false, student:false },
      idVisible: false,
      idChecked: false,
      rulesExplained: false,
      visitor: { ...ID_DATA, contact: makeContact() },
      facts: { name:"", purpose:"", appt:"", who:"", time:"", about:"", meetingTime:"" },
      misses: 0
    };

    hideId();
    closeSupervisor();
    closePersonSearch();
    try{ window.VEVA_CHECKLIST?.reset?.(); }catch{}

    updateHintBand(true);

    if (portraitMood){
      portraitMood.textContent = `A visitor walks up to the gate. ${currentMood?.line || ""}`;
    }

    // greet after delay
    if (_approachTimer) { try{ clearTimeout(_approachTimer); }catch{} _approachTimer = null; }
    _approachTimer = setTimeout(() => {
      _approachTimer = null;
      if (state) state.stage = "start";
      pushVisitor(pickBank("greeting", VISITOR_FALLBACK.greeting));
    }, VISITOR_APPROACH_DELAY_MS);
  }

  function handleStudent(raw){
    const clean = String(raw || "").trim();
    if (!clean || !state || state.stage === "ended") return;
    if (state.stage === "approach") return; // ignore during approach

    pushStudent(clean);

    // Contact supervisor: show 5W/H report panel (Dutch)
    const intent = detectIntent(clean);
    if (intent === "contact_supervisor" || isContactSupervisor(clean)){
      fillSupervisor();
      openSupervisor();
      enqueueVisitor("Okay, I'll wait here.");
      return;
    }

    // Go to person search: real UI + transition
    if (intent === "go_person_search"){
      openPersonSearch();
      return;
    }

    setDebugPill(`Intent: ${intent} · Stage: ${state.stage}`);

    // Progress tracking for hints + checklist
    if (intent === "ask_name"){
      state.facts.name = state.visitor.name;
      updateChecklist("5wh", true);
    }
    if (intent === "purpose"){
      state.facts.purpose = "known";
      updateChecklist("5wh", true);
    }
    if (intent === "has_appointment"){
      state.facts.appt = "yes";
      updateChecklist("5wh", true);
    }
    if (intent === "who_meeting"){
      state.facts.who = "known";
      updateChecklist("5wh", true);
    }
    if (intent === "time_meeting"){
      state.facts.time = "known";
      state.facts.meetingTime = getMeetingTimeHHMM();
      updateChecklist("5wh", true);
    }
    if (intent === "about_meeting"){
      state.facts.about = "known";
      updateChecklist("5wh", true);
    }
    if (intent === "ask_id"){
      state.idChecked = true;
      updateChecklist("id", true);
    }

    // Dialogue stages
    switch(state.stage){
      case "start":
        if (intent === "greet"){
          state.stage = "help";
          enqueueVisitor(pickBank("need_help", VISITOR_FALLBACK.need_help));
          return;
        }
        if (intent === "help_open"){
          state.stage = "purpose";
          enqueueVisitor("I need to enter the base.");
          return;
        }
        nudge('Example: "Good morning. How can I help you?"');
        return;

      case "help":
        if (intent === "help_open"){
          state.stage = "purpose";
          enqueueVisitor("I need to enter the base.");
          return;
        }
        if (intent === "greet"){
          enqueueVisitor(pickBank("greeting", VISITOR_FALLBACK.greeting));
          return;
        }
        nudge('Example: "How can I help you today?"');
        return;

      case "purpose":
        if (intent === "purpose"){
          enqueueVisitor("I have an appointment on base.");
          return;
        }
        if (intent === "has_appointment"){
          enqueueVisitor(pickBank("appointment_yes", VISITOR_FALLBACK.appointment_yes));
          state.facts.appt = "yes";
          return;
        }
        if (intent === "who_meeting"){
          enqueueVisitor(pickBank("who_meeting", VISITOR_FALLBACK.who_meeting));
          state.facts.who = "known";
          return;
        }
        if (intent === "time_meeting"){
          const t = getMeetingTimeHHMM();
          enqueueVisitor(`At ${t}.`);
          state.facts.time = "known";
          return;
        }
        if (intent === "about_meeting"){
          enqueueVisitor(pickBank("about_meeting", VISITOR_FALLBACK.about_meeting));
          state.facts.about = "known";
          return;
        }
        if (intent === "ask_id"){
          showId();
          state.stage = "control_q";
          enqueueVisitor("Sure. Here you go.");
          return;
        }
        nudge(getNextHint());
        return;

      case "control_q":
        if (intent === "dob_q"){
          enqueueVisitor(`My date of birth is ${state.visitor.dob}.`);
          return;
        }
        if (intent === "nat_q"){
          enqueueVisitor(`My nationality is ${state.visitor.nat}.`);
          return;
        }
        if (intent === "return_id"){
          hideId();
          enqueueVisitor("Thanks.");
          state.stage = "rules";
          return;
        }
        nudge('Example: "Can you confirm your date of birth?" or "Return ID".');
        return;

      case "rules":
        // Student explains rules -> mark checklist
        if (/\b(drugs?|alcohol|weapons?|not\s+allowed|frisk|searched|security\s+check)\b/i.test(clean)){
          state.rulesExplained = true;
          updateChecklist("rules", true);
          enqueueVisitor("Understood.");
          return;
        }
        nudge('Example: "On base, drugs, alcohol and weapons are not allowed. Everyone can be frisked."');
        return;

      default:
        enqueueVisitor("Okay.");
        return;
    }
  }

  // -------- Buttons --------
  btnDeny?.addEventListener("click", () => enqueueVisitor(pickBank("deny_why", VISITOR_FALLBACK.deny_why)));
  btnNewScenario?.addEventListener("click", () => {
    textInput && (textInput.disabled = false);
    btnSend && (btnSend.disabled = false);
    holdToTalk && (holdToTalk.disabled = false);
    resetScenario();
    textInput?.focus();
  });

  btnReset?.addEventListener("click", () => {
    loginModal.hidden = false;
    if (textInput) textInput.disabled = false;
    if (btnSend) btnSend.disabled = false;
    if (holdToTalk) holdToTalk.disabled = false;

    history.length = 0;
    renderHistory();
    hideId();
    updateStudentPill();
    updateHintBand(true);
    if (textInput) textInput.value = "";
  });

  btnReturn?.addEventListener("click", () => enqueueVisitor("Return acknowledged."));
  btnPersonSearch?.addEventListener("click", () => openPersonSearch());
  btnSignIn?.addEventListener("click", () => enqueueVisitor("Please report to the sign-in office."));

  btnReturnId?.addEventListener("click", () => {
    hideId();
    enqueueVisitor(pickBank("return_id", VISITOR_FALLBACK.thanks));
    state.stage = "rules";
  });

  // Person search events
  psClose?.addEventListener("click", closePersonSearch);
  psBack?.addEventListener("click", closePersonSearch);
  psDoSearch?.addEventListener("click", () => renderSearch(psQuery?.value || ""));
  psQuery?.addEventListener("keydown", (e)=>{ if (e.key==="Enter") renderSearch(psQuery.value); });
  psOverlay?.addEventListener("click", (e)=>{ if (e.target === psOverlay) closePersonSearch(); });

  // Supervisor modal events
  btnCloseSupervisor?.addEventListener("click", closeSupervisor);
  btnReturnToVisitor?.addEventListener("click", closeSupervisor);
  btnSupervisorCheck?.addEventListener("click", ()=>{
    updateChecklist("supervisor", true);
    closeSupervisor();
    enqueueVisitor("Okay.");
  });

  // -------- Input --------
  btnSend?.addEventListener("click", () => {
    if (!state || state.stage === "ended") return;
    const t = (textInput?.value || "").trim();
    if (textInput) textInput.value = "";
    handleStudent(t);
  });
  textInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") btnSend?.click(); });
  textInput?.addEventListener("input", () => {
    if (!state?.typing) return;
    state.typing.student = !!(textInput.value || "").trim();
    renderHistory();
  });

  // -------- Voice (optional, unchanged minimal) --------
  let recognition = null;
  let isRecognizing = false;

  function setVoiceStatusSafe(text){ if (voiceStatus) voiceStatus.textContent = text; }
  function voiceSupported(){ return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

  async function ensureMicPermission(){
    try{
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    }catch{ return false; }
  }

  function setupSpeech(){
    if (!voiceSupported()){
      setVoiceStatusSafe("Voice: not supported");
      if (holdToTalk){
        holdToTalk.disabled = true;
        holdToTalk.title = "SpeechRecognition not supported in this browser.";
      }
      return;
    }
    const isLocalhost = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
    const okContext = window.isSecureContext || location.protocol === "https:" || isLocalhost;
    if (!okContext){
      setVoiceStatusSafe("Voice: use https/localhost");
      if (holdToTalk){
        holdToTalk.disabled = true;
        holdToTalk.title = "Voice requires https:// or http://localhost (not file://).";
      }
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      isRecognizing = true;
      if (state?.typing){
        state.typing.student = true;
        state.typing.visitor = false;
      }
      renderHistory();
      setVoiceStatusSafe("Voice: listening…");
      holdToTalk?.classList.add("listening");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++){
        const res = event.results[i];
        const chunk = (res && res[0] && res[0].transcript) ? res[0].transcript : "";
        if (res.isFinal) finalText += chunk;
        else interimText += chunk;
      }
      const combined = String(finalText || interimText || "").trim();
      if (combined && textInput) textInput.value = combined;
    };

    recognition.onerror = () => {
      isRecognizing = false;
      holdToTalk?.classList.remove("listening");
      setVoiceStatusSafe("Voice: error");
    };

    recognition.onend = () => {
      setVoiceStatusSafe("Voice: ready");
      isRecognizing = false;
      holdToTalk?.classList.remove("listening");
      if (state?.typing) state.typing.student = false;
      renderHistory();

      if (VOICE_AUTOSEND && state){
        const toSend = (textInput?.value || "").trim();
        if (toSend){
          handleStudent(toSend);
          if (textInput) textInput.value = "";
        }
      }
    };
  }

  async function startListen(){
    if (!recognition || isRecognizing) return;
    const ok = await ensureMicPermission();
    if (!ok){ setVoiceStatusSafe("Voice: blocked"); return; }
    try { recognition.start(); } catch {}
  }
  function stopListen(){
    if (!recognition || !isRecognizing) return;
    try { recognition.stop(); } catch {}
  }

  holdToTalk?.addEventListener("pointerdown", (e) => { e.preventDefault(); startListen(); });
  holdToTalk?.addEventListener("pointerup", (e) => { e.preventDefault(); stopListen(); });
  holdToTalk?.addEventListener("pointercancel", stopListen);
  holdToTalk?.addEventListener("pointerleave", stopListen);

  // -------- Login --------
  function tryStart(){
    const surname = (studentSurnameInput?.value || "").trim();
    const group = studentGroupSel?.value;
    const difficulty = studentDifficultySel?.value || "standard";
    if (!surname || !group){
      if (loginError) loginError.style.display = "block";
      return;
    }
    if (loginError) loginError.style.display = "none";

    session = { surname, group, difficulty };
    saveStudentPrefill(session);
    updateStudentPill();

    if (loginModal) loginModal.hidden = true;

    resetScenario();
    textInput?.focus();
  }
  btnStartTraining?.addEventListener("click", tryStart);
  studentSurnameInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") tryStart(); });

  // -------- Boot --------
  const pre = loadStudentPrefill();
  if (pre && typeof pre === "object"){
    if (pre.surname && studentSurnameInput) studentSurnameInput.value = pre.surname;
    if (pre.group && studentGroupSel) studentGroupSel.value = pre.group;
    if (pre.difficulty && studentDifficultySel) studentDifficultySel.value = pre.difficulty;
    session = { ...session, ...pre };
  }

  updateStudentPill();
  syncVisitorAvatars();
  hideId();
  setupSpeech();

  if (loginModal) loginModal.hidden = false;

  history.length = 0;
  state = { stage: "idle", typing:{visitor:false, student:false}, visitor: { ...ID_DATA, contact: makeContact() }, facts:{}, misses:0 };
  renderHistory();
  updateHintBand(true);

})();