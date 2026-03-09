// app.js (core modular engine) - see README for overview
// NOTE: This is a full working core. Keep patches modular; extend there first.

(() => {
  "use strict";
  const $ = (s)=>document.querySelector(s);

  const CFG = window.CONFIG || {};
  const BUILD = window.BUILD || { version:"dev", name:"VEVA Trainer", date:"" };

  const ASSET_BASE = CFG.assetBase || "assets/photos";
  const HEADSHOT_PREFIX = CFG.headshotPrefix || "headshot_";
  const HEADSHOT_COUNT = Number(CFG.headshotCount || 10);

  const VOICE_AUTOSEND = (CFG.voiceAutosend !== undefined) ? !!CFG.voiceAutosend : true;
  const DEBUG_ENABLED = (CFG.debug !== undefined) ? !!CFG.debug : true;

  // Pills
  const versionPill = $("#versionPill");
  const studentPill = $("#studentPill");
  const voiceStatus = $("#voiceStatus");
  const debugPill = $("#debugPill");

  // Sidebar
  const btnReturn = $("#btnReturn");
  const btnPersonSearch = $("#btnPersonSearch");
  const btnSignIn = $("#btnSignIn");
  const btnDeny = $("#btnDeny");
  const btnEndScenario = $("#btnEndScenario");
  const btnPhrases = $("#btnPhrases");
  const btnGoAppointment = $("#btnGoAppointment");
  const sidePills = $("#sidePills");
  const topPills = $("#topPills");
  const summaryModal = $("#summaryModal");
  const summaryStats = $("#summaryStats");
  const summaryHighlights = $("#summaryHighlights");
  const summaryImprovements = $("#summaryImprovements");
  const summaryList = $("#summaryList");
  const btnCloseSummary = $("#btnCloseSummary");
  const btnNewScenario = $("#btnNewScenario");
  const btnReset = $("#btnReset");

  // Input
  const textInput = $("#textInput");
  const btnSend = $("#btnSend");
  const holdToTalk = $("#holdToTalk");
  const notesPad = $("#notesPad");

  // Chat
  const chatSlots = $("#chatSlots");

  // Right panel
  const panelTitle = $("#panelTitle");
  const panelSub = $("#panelSub");
  const portraitPhoto = $("#portraitPhoto");
  const portraitMood = $("#portraitMood");
  const portraitDesc = $("#portraitDesc");

  const idCardWrap = $("#idCardWrap");
  const btnReturnId = $("#btnReturnId");
  const idPhoto = $("#idPhoto");
  const idName = $("#idName");
  const idSurname = $("#idSurname");
  const idDob = $("#idDob");
  const idNat = $("#idNat");
  const idNo = $("#idNo");
  const idBarcode = $("#idBarcode");
  const idLevel = $("#idLevel");
  const idScenario = $("#idScenario");

  const supervisorPanel = $("#supervisorPanel");
  const supervisorPhoto = $("#supervisorPhoto");
  const btnSupervisorSend = $("#btnSupervisorSend");
  const btnSupervisorBack = $("#btnSupervisorBack");
  const sv_wie = $("#sv_wie");
  const sv_wat = $("#sv_wat");
  const sv_waar = $("#sv_waar");
  const sv_wanneer = $("#sv_wanneer");
  const sv_waarom = $("#sv_waarom");
  const sv_note = $("#sv_note");

  const personSearchPanel = $("#personSearchPanel");
  const transitionModal = $("#transitionModal");
  const transitionText = $("#transitionText");
  const transitionBanner = $("#transitionBanner");
  const psOutfit = $("#psOutfit");
  const psCards = $("#psCards");
  const psRiskChip = $("#psRiskChip");
  const psItemsText = $("#psItemsText");

  const signInPanel = $("#signInPanel");
  const si_name = $("#si_name");
  const si_company = $("#si_company");
  const sigBox = $("#sigBox");
  const si_rulesForm = $("#si_rulesForm");
  const si_form = $("#si_form");
  const si_passPreview = $("#si_passPreview");
  const si_poc = $("#si_poc");
  const si_time = $("#si_time");
  const si_loc = $("#si_loc");
  const si_sig = $("#si_sig");
  const btnSignInIssue = $("#btnSignInIssue");

  const passPanel = $("#passPanel");

  // Central portrait (photo + mood strip) visibility controller.
  // Rule: if any bottom popup/panel (ID, Supervisor, PS, Sign-in, Pass) is visible, hide portraitRow.
  function syncPortraitVisibility(){
    const portraitRow = $("#portraitRow");
    if(!portraitRow) return;

    const panels = [
      $("#idCardWrap"),
      $("#supervisorPanel"),
      $("#personSearchPanel"),
      $("#signInPanel"),
      $("#passPanel"),
    ].filter(Boolean);

    const anyVisible = panels.some(el => !el.hidden && el.style.display !== "none");
    portraitRow.style.display = anyVisible ? "none" : "";
    portraitRow.hidden = anyVisible;

    // Also expose a body class for CSS fallback
    try{ document.body.classList.toggle("hasPopup", anyVisible); }catch{}
  }
  const passNo = $("#passNo");
  const passName = $("#passName");
  const passUntil = $("#passUntil");
  const btnPassReturn = $("#btnPassReturn");

  const hintBand = $("#hintBand");
  const hintBandText = $("#hintBandText");

  // Checklist (optional panel)
  const checklistEls = {
    gate_name: $("#cl_gate_name"),
    gate_purpose: $("#cl_gate_purpose"),
    gate_appt: $("#cl_gate_appt"),
    gate_who: $("#cl_gate_who"),
    gate_time: $("#cl_gate_time"),
    gate_about: $("#cl_gate_about"),
    gate_where: $("#cl_gate_where"),
    gate_id: $("#cl_gate_id"),
    gate_supervisor: $("#cl_gate_supervisor"),
    gate_search: $("#cl_gate_search"),
    gate_rules: $("#cl_gate_rules"),
    gate_send_ps: $("#cl_gate_send_ps"),

    // Person Search
    ps_sharp: $("#cl_ps_sharp"),
    ps_remove: $("#cl_ps_remove"),
    ps_position: $("#cl_ps_position"),
    ps_cleared: $("#cl_ps_cleared"),

    // Sign-in
    si_signed: $("#cl_si_signed"),
    si_issued: $("#cl_si_issued"),
    si_pass_no: $("#cl_si_pass_no"),
    si_visible: $("#cl_si_visible"),
    si_show: $("#cl_si_show"),
    si_return: $("#cl_si_return"),
    si_alarm: $("#cl_si_alarm"),
    si_closes: $("#cl_si_closes"),
  };

  // Login
  const loginModal = $("#loginModal");
  const studentSurnameInput = $("#studentSurname");
  const studentGroupSel = $("#studentGroup");
  const studentDifficultySel = $("#studentDifficulty");
  const btnStartTraining = $("#btnStartTraining");
  const loginError = $("#loginError");

  const TRANSPARENT_PX = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  // Legacy typing flags used by renderTyping/input handlers
  var typingVisitor = false;
  var typingStudent = false;

  // version pill
  const __assetVer = String(window.__ASSET_VER__ || "");
  const __assetShort = __assetVer ? __assetVer.slice(-6) : "";
  if (versionPill) versionPill.textContent = `v${BUILD.version}${__assetShort ? " · " + __assetShort : ""}`;
  document.title = `${BUILD.name} v${BUILD.version}${__assetShort ? " (" + __assetShort + ")" : ""}`;

  function setVoice(text){ if (voiceStatus) voiceStatus.textContent = text; }
  function setDebug(text){
    if (!debugPill) return;
    if (!DEBUG_ENABLED){ debugPill.hidden = true; return; }
    debugPill.hidden = false;
    debugPill.textContent = text || "Debug: —";
  
}

  // student session
  const STUDENT_KEY = "veva.student.v3";
  const NOTES_KEY = "veva.notes.v1";
  let session = { surname:"", group:"", difficulty:"standard" };
  function loadStudent(){ try{ return JSON.parse(localStorage.getItem(STUDENT_KEY)||"null"); }catch{ return null; } }
  function saveStudent(v){ try{ localStorage.setItem(STUDENT_KEY, JSON.stringify(v)); }catch{} }
  function updateStudentPill(){
    if (!studentPill) return;
    if (!session.surname || !session.group){ studentPill.textContent = "Student: —"; return; }
    const cap = (s)=>(s||"").charAt(0).toUpperCase()+(s||"").slice(1);
    studentPill.textContent = `Student: ${session.surname} | Group: ${session.group} | ${cap(session.difficulty)}`;
  }

  function loadNotes(){ try{ return String(localStorage.getItem(NOTES_KEY)||""); }catch{ return ""; } }
  function saveNotes(v){ try{ localStorage.setItem(NOTES_KEY, String(v||"")); }catch{} }

  const pad2 = (n)=>String(n).padStart(2,"0");
  const pick = (arr)=> (Array.isArray(arr)&&arr.length) ? arr[Math.floor(Math.random()*arr.length)] : "";
  const randInt = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

  let __uid=0;
  const uid = (p="id")=>`${p}_${++__uid}`;

  function normalize(s){
    return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}: ]/gu," ").replace(/\s+/g," ").trim();
  }

  // Training language gate: only respond to English.
  // (If the student types Dutch, we should not "understand" it.)
  function isLikelyNonEnglish(raw){
    const t = normalize(raw);
    if (!t) return false;
    // Common Dutch function words (very lightweight heuristic)
    const dutch = ["wat","waar","wanneer","waarom","hoe","wie","welke","kunt","kan","mag","moet","alstublieft","alsjeblieft","meneer","mevrouw","jij","u","uw","jouw","jullie","heb","heeft","zijn","ben","niet","wel","een","de","het","naar","binnen","buiten","afspraak","bedrijf","tijd","locatie","naam"];
    let hits = 0;
    for (const w of dutch){ if (new RegExp(`\\b${w}\\b`,`i`).test(t)) hits++; }
    // Basic English anchors
    const english = ["what","where","when","why","how","who","do","does","have","any","please","can","could","would","your","you","i","my","name","appointment","meeting","company","time","location","purpose"];
    let eHits = 0;
    for (const w of english){ if (new RegExp(`\\b${w}\\b`,`i`).test(t)) eHits++; }
    // If it looks Dutch and not enough English anchors, treat as non-English.
    return (hits >= 2 && eHits < 2);
  }

  // assets
  const soldierAvatar = new Image();
  soldierAvatar.src = `${ASSET_BASE}/soldier.png`;
  soldierAvatar.onerror = ()=> soldierAvatar.src = TRANSPARENT_PX;

  const supervisorAvatar = new Image();
  supervisorAvatar.src = `${ASSET_BASE}/soldier2.png`;
  supervisorAvatar.onerror = ()=> supervisorAvatar.src = `${ASSET_BASE}/soldier.png`;

  function headshotPath(i){ return `${ASSET_BASE}/${HEADSHOT_PREFIX}${pad2(i)}.png`; }

  function makeRandomVisitor(){
    const idx = randInt(1, HEADSHOT_COUNT);
    const FIRST = ["Liam","Noah","James","Oliver","Lucas","Milan","Daan","Sem","Jayden","Finn","Benjamin","Ethan","Jack","Thomas","Jason"];
    const LAST  = ["Miller","Bakker","de Vries","Jansen","Visser","Smit","Bos","van Dijk","de Jong","Meijer","Burke","Berk","Berg"];
    const NATS  = ["Dutch","German","Belgian","French","British"];
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const first = pick(FIRST);
    const last = pick(LAST);
    const year = randInt(1976, 2002);
    const day = pad2(randInt(1,28));
    const month = MONTHS[randInt(0, MONTHS.length-1)];
    const nat = pick(NATS);
    const idNo = (nat==="Dutch"?"NL-":nat==="German"?"DE-":nat==="Belgian"?"BE-":nat==="French"?"FR-":"UK-")+randInt(100000,999999);
    return { first, last, name:`${first} ${last}`, dob:`${day} ${month} ${year}`, nat, idNo, photoSrc: headshotPath(idx) };
  }

  function makeContact(){
    const RANKS=["Sergeant","Corporal","Lieutenant","Captain"];
    const LASTS=["Burke","Berk","Berg","de Vries","Jansen","Smit","Miller","Visser","Bos","van Dijk"];
    const rank=pick(RANKS); const base=pick(LASTS);
    const vars=Array.from(new Set([base, base.replace(/ke$/i,"k"), base.replace(/k$/i,"ke"), base.replace(/k$/i,"g"), base.replace(/g$/i,"k")])).filter(Boolean);
    const alt=vars[Math.min(vars.length-1, randInt(0,vars.length-1))] || base;
    return { rank, last:base, lastAlt:alt, full:`${rank} ${base}` };
  }

  const MOODS=[
    {key:"relaxed", line:"The visitor looks relaxed."},
    {key:"neutral", line:"The visitor looks neutral."},
    {key:"mixed", line:"The visitor looks a bit uneasy."},
    {key:"nervous", line:"The visitor looks nervous."},
    {key:"irritated", line:"The visitor looks irritated."},
  ];
  let currentMood = MOODS[1];

  // phrase helpers
  function bandFromMood(){
    try{
      const fn = window.VEVA_PHRASES?.gate?.bandFromMood;
      if (typeof fn === "function") return fn(currentMood.key);
    }catch{}
    return "cautious";
  }

  function getMeetingTime(state){
    if (state.facts.meetingTime && /^\d{2}:\d{2}$/.test(state.facts.meetingTime)) return state.facts.meetingTime;
    const now=new Date(); const dt=new Date(now.getTime()+randInt(15,25)*60*1000);
    const hhmm=`${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    state.facts.meetingTime=hhmm;
    return hhmm;
  }

  function generateCompany(state){
    const v = state.visitor || {};
    const first = (v.first||"").replace(/[^A-Za-z]/g,"");
    const last = (v.last||"").replace(/[^A-Za-z]/g,"");
    const pool = [
      "NorthSea Logistics","DeltaTech Services","Orion Maintenance","Aegis Security Systems",
      "Harborline Transport","Vector IT Consulting","BlueGate Facilities","Atlas Engineering"
    ];
    if (last) return `${last} ${pick(["Logistics","Consulting","Services","Transport","Maintenance"])}`;
    if (first) return `${first}${pick(["Tech","Works","Logistics","Services"])}`;
    return pick(pool);
  }

  function fill(tpl, state){
    const v = state.visitor;
    state.facts.locationCode = state.facts.locationCode || String(randInt(1,9)).padStart(2,"0");
    const map = {
      first:v.first,last:v.last,name:v.name,dob:v.dob,nat:v.nat,idNo:v.idNo,
      meetingTime:getMeetingTime(state),
      pocFull:v.contact.full,pocRank:v.contact.rank,pocLast:v.contact.last,pocLastAlt:v.contact.lastAlt,
      locationCode: state.facts.locationCode
    };
    return String(tpl||"").replace(/\{([A-Za-z0-9_]+)\}/g,(m,k)=> map[k]!==undefined?String(map[k]):m);
  }

  function phrase(bank, key, state, forceBand){
    const P = window.VEVA_PHRASES?.[bank];
    if (!P) return "Okay.";
    const entry = P[key];
    if (!entry) return "Okay.";
    if (typeof entry === "string") return fill(entry, state);
    if (Array.isArray(entry)) return fill(pick(entry), state);
    const band = forceBand || bandFromMood();
    const arr = entry[band] || entry.cautious || entry.open || entry.evasive || [];
    return fill(pick(arr), state) || "Okay.";
  }

  function detectIntent(raw){
    const n = normalize(raw);
    // Press for answer / ultimatum (used when visitor is evasive)
    if (/\b(please\s+answer|answer\s+(the\s+)?question|answer\s+directly|i\s+need\s+an\s+answer|i\s+need\s+a\s+clear\s+answer|stop\s+avoiding|don\'?t\s+avoid|cooperate|non\-?cooperative|if\s+you\s+don\'?t\s+cooperate|otherwise\s+entry\s+will\s+be\s+denied|i\s+will\s+deny\s+(your\s+)?entry|you\s+must\s+answer)\b/i.test(n)) return "press_for_answer";
    // Priority disambiguation for 5W appointment questions
    if (/\b(with\s+who(m)?|appointment\s+with|who\s+are\s+you\s+(meeting|seeing))\b/i.test(n)) return "who_meeting";
    if ((/\bwhat\s+time\b/i.test(n) || /\bwhen\b/i.test(n)) && /\b(appointment|meeting)\b/i.test(n)) return "time_meeting";
    if (/\bwhat\b/i.test(n) && /\b(appointment|meeting)\b/i.test(n) && /\babout\b/i.test(n)) return "about_meeting";
    
    // Illegal items check
    // Explain search due to threat level (separate from illegal items)
    if ((/\b(everyone|everybody|all\s+visitors?)\b/i.test(n) && /\b(search(ed)?|pat\s*down|screen(ed)?)\b/i.test(n)) && (/\b(threat|security)\b/i.test(n) || /\b(increase(d)?|elevate(d)?)\b/i.test(n) || /\bprocedure\b/i.test(n))) return "search_announce";
    if (/\b(due\s+to|because\s+of)\b/i.test(n) && /\b(threat|security)\b/i.test(n) && /\b(search|searched|pat\s*down)\b/i.test(n)) return "search_announce";

    if (/\b(illegal\s+items?|prohibited\s+items?|contraband|banned\s+items?)\b/i.test(n) && /\b(do\s+you\s+have|any|carrying|with\s+you|on\s+you|in\s+your\s+(bag|car|vehicle))\b/i.test(n)) return "ask_illegal";
    if (/\b(weapons?|knife|knives|gun|firearm|ammo|drugs?|narcotics?|alcohol|booze)\b/i.test(n) && /\b(do\s+you\s+have|any|carrying|with\s+you|on\s+you)\b/i.test(n)) return "ask_illegal";
    if (/\b(what\s+do\s+you\s+mean|what\s+does\s+that\s+mean|what\s+is\s+that\s+supposed\s+to\s+mean)\b/i.test(n)) return "illegal_clarify";
    if (/\b(no|not)\s+(weapons?|drugs?|alcohol)\b/i.test(n) || /\b(weapons?|drugs?|alcohol)\b[^.]{0,40}\b(not\s+allowed|forbidden|prohibited)\b/i.test(n) || /\b(contraband|illegal\s+items?)\b[^.]{0,40}\b(not\s+allowed|forbidden|prohibited)\b/i.test(n)) return "explain_illegal";
    if (/\b(hand\s*(them)?\s*in|hand\s*it\s*in|please\s+hand|turn\s+it\s+in|surrender|give\s+it\s+to\s+me|place\s+it\s+on\s+the\s+table)\b/i.test(n)) return "request_handin";

    
    // Person Search: expanded patterns
    if (/\bsharp\b|\bneedle\b|\bknife\b|\bra(z|s)or\b/i.test(n) && /\bdo\s+you\s+have|any\b/i.test(n)) return "ps_ask_sharp";
    if (/\b(strip|take\s+off\s+all\s+clothes|remove\s+all\s+clothes|remove\s+everything)\b/i.test(n)) return "ps_strip";
    if (/\bempty\s+your\s+pockets\b/i.test(n)) return "ps_empty_pockets";
    if (/\bplace\s+all\s+items\b|\bon\s+the\s+table\b/i.test(n)) return "ps_items_table";
    if (/\barmpits\b/i.test(n) && /\bsearch|checking\b|\bam\s+going\s+to\b/i.test(n)) return "ps_explain_armpits";
    if (/\bwaist|waistband|belt\b/i.test(n) && /\bcheck|search|checking\b|\bam\s+checking\b/i.test(n)) return "ps_explain_waist";
    // "Put your leg on my knee" should count as the leg-on-knee instruction
    if (/\bleg\b/i.test(n) && /\bknee\b/i.test(n)) return "ps_leg_on_knee";

    
    // Robust Gate patterns (always-on)
    if (/\b(what\s*(is|'s)\s*your\s*name|your\s*name\s*please)\b/i.test(n)) return "ask_name";
    if (/\b(surname|last\s*name|family\s*name)\b/i.test(n) && (/\bwhat\b/i.test(n) || /\byour\b/i.test(n))) return "ask_surname";
    if (/\b(purpose|reason)\b.*\b(visit|here)\b|\bwhy\s+are\s+you\s+here\b/i.test(n)) return "ask_purpose";
    if (/\bdo\s+you\s+have\s+an?\s+appointment\b|\bappointment\?\b/i.test(n)) return "ask_appt";
    if (/\bwho\b.*\b(meeting|appointment|see|seeing|contact)\b|\bpoint\s+of\s+contact\b/i.test(n)) return "ask_who";
    if (/\bwhat\s+time\b.*\bappointment\b|\bappointment\s+time\b/i.test(n)) return "ask_time";
    if (/\bwhat\b.*\b(meeting|appointment)\b.*\babout\b|\bmeeting\s+topic\b/i.test(n)) return "ask_about";
    if (/\bwhere\b.*\b(meeting|appointment|going)\b|\blocation\b/i.test(n)) return "ask_where";
    if (/\b(company|employer|organization|organisation|firm)\b/i.test(n) && /\b(from|with|work\s*for|represent)\b/i.test(n)) return "ask_company";

    // Person Search patterns
    if (/\bdo\s+you\s+have\b.*\b(sharp|knife|needle|razor|blade)\b/i.test(n)) return "ps_ask_sharp";

    // Remove outerwear (jacket / headgear)
    if (/(remove|take\s*off|please\s+remove|could\s+you\s+remove|can\s+you\s+remove)\b.*\b(jacket|coat|cap|hat|headgear|hood|helmet)\b/i.test(n)) return "ps_remove_outer";
    if (/\b(jacket|coat)\b.*\b(headgear|cap|hat|helmet)\b.*\b(remove|off|take\s*off)\b/i.test(n)) return "ps_remove_outer";

    // Positioning
    if (/\bstand\s+still\b|\bhands\s+on\s+the\s+wall\b|\bfeet\s+apart\b|\bface\s+the\s+wall\b/i.test(n)) return "ps_position";
    if (/\bspread\b/i.test(n) && /\b(arms?|hands?)\b/i.test(n) && /\b(legs?|feet)\b/i.test(n)) return "ps_position";
    if (/\b(arms?|hands?)\b[^.]{0,30}\bapart\b/i.test(n) && /\b(legs?|feet)\b[^.]{0,30}\bapart\b/i.test(n)) return "ps_position";

    // Search statements (wording can be "I am going to search under/around ...")
    if (/\b(armpit|armpits)\b/i.test(n) || /\bunder\s+your\s+arms?\b/i.test(n)){
      if (/(search|check|checking|pat\s*down|going\s+to|i'?m\s+(going\s+to|gonna)|i\s+am\s+(going\s+to|going\s+to\s+be))\b/i.test(n)) return "ps_explain_armpits";
    }
    if (/\b(waist|waistband|belt|around\s+your\s+waist|private\s+area|groin)\b/i.test(n)){
      if (/(search|check|checking|pat\s*down|going\s+to|i'?m\s+(going\s+to|gonna)|i\s+am\s+(going\s+to|going\s+to\s+be))\b/i.test(n)) return "ps_explain_waist";
    }

    // Leg on knee
    if (/\b(put|place|lift|raise)\b/i.test(n) && /\b(leg|foot)\b/i.test(n) && /\b(knee|thigh)\b/i.test(n)) return "ps_leg_on_knee";
    if (/\bleg\b/i.test(n) && /\bon\b/i.test(n) && /\bmy\s+knee\b/i.test(n)) return "ps_leg_on_knee";

    // Items checked
    if (/\b(i\s*(have\s*)?checked\s+your\s+items?|i\s*am\s*going\s*to\s*check\s+your\s+items?|i\s*will\s*check\s+your\s+items?|i\s*am\s*checking\s+your\s+items?)\b/i.test(n)) return "ps_check_items";
    if (/\b(everything\s+is\s+ok|looks\s+fine|items?\s+are\s+ok|all\s+items?\s+are\s+ok|nothing\s+found|no\s+issues)\b/i.test(n)) return "ps_check_items";
    // Clearance phrasing: can be used with or without explicitly mentioning sign-in.
    if (/\b(i\s*(have\s*)?checked\s+everything|i\s*have\s*checked\s+everything|i\s*checked\s+everything)\b/i.test(n) && /\b(ok(ay)?|clear|good\s+to\s+go|you\s*\'?re\s+ok|you\s*\'?re\s+okay|you\s*\'?re\s+good)\b/i.test(n)){
      if (/\b(sign\s*in|register|sign-in|office)\b/i.test(n)) return "go_sign_in";
      return "ps_clear";
    }
    if (/\b(clear(ed)?\s+to\s+(proceed|go)|you\s+are\s+clear|free\s+to\s+proceed|ok(ay)?\s+to\s+proceed)\b/i.test(n) && /\b(sign\s*in|register|sign-in|office)\b/i.test(n)) return "go_sign_in";

    // IMPORTANT: explicit "go to sign-in office" must win over generic "sign in" intent.
    // Otherwise button text like "Go to Sign-in Office" gets misclassified as si_sign_in.
    if (/\b(go\s+to|proceed\s+to|walk\s+to)\b.*\b(sign\s*-?in(\s+office)?|reception|sign\s*in\s+desk)\b/i.test(n)) return "go_sign_in";

    
    // Sign-in intents
    if (/\b(sign\s*in|register|sign\s+here|signature)\b/i.test(n)) return "si_sign_in";
    if ((/\b(issue|give|hand)\b/i.test(n) || /\bhere\s+is\b/i.test(n)) && /\b(visitor\s*pass|pass|badge)\b/i.test(n)) return "si_issue_pass";
    if (/\b(pass|badge)\b/i.test(n) && /\b(VP-\d{4}|\d{3,6})\b/i.test(n)) return "si_pass_no";
    // "wear" is sometimes transcribed as "where" by STT/TTS confusion – accept both.
    if (/\b(pass|badge)\b/i.test(n) && (/\b(visible|wear|where|display)\b/i.test(n) || (/\bkeep\b/i.test(n) && /\bvisible\b/i.test(n)))) return "si_rule_visible";
    if ((/\b(show|present|display)\b/i.test(n)) && (/\b(on\s+request|when\s+asked|if\s+asked|upon\s+request|requested)\b/i.test(n) || (/\brequest\b/i.test(n) && /\b(show|present|display)\b/i.test(n)))) return "si_rule_show";
    if ((/\b(return|hand\s+back|give\s+back)\b/i.test(n)) && (/\b(on\s+exit|when\s+you\s+leave|when\s+leaving|when\s+you\s+exit|before\s+you\s+leave|at\s+the\s+gate)\b/i.test(n) || /\b(exit|leave)\b/i.test(n))) return "si_rule_return";
    if (/\b(alarm|fire\s+alarm|assembly\s*(point|area)|muster\s*point)\b/i.test(n)) return "si_rule_alarm";
    if (/\b(base\s+closes|closing\s+time|closes\s+at|closed\s+at)\b/i.test(n) || /\bcloses\b/i.test(n) || /\b4\s*(pm|p\.m\.|o\'clock|oclock)?\b/i.test(n)) return "si_rule_closes";

    const list = Array.isArray(window.VEVA_INTENTS) ? window.VEVA_INTENTS : [];
    for (const it of list){ try{ if (it?.rx?.test(raw)) return it.key; }catch{} }

    // Defensive fallbacks for phrasing variants (local, so checklist keeps working even if VEVA_INTENTS is missing)
    if (/\b(hi|hello|good\s+(morning|afternoon|evening))\b/i.test(n) && /\bhelp\b/i.test(n)) return "greet";

    // Gate: name
    if (/\b(what\s+is|may\s+i\s+have|can\s+i\s+have)\s+(your\s+)?(full\s+)?name\b/i.test(n)) return "ask_name";
    if (/\bsurname\b/i.test(n) && /\b(what\s+is|your)\b/i.test(n)) return "ask_surname";

    // Gate: purpose
    if (/\b(purpose|reason)\b/i.test(n) && /\b(visit|here|coming)\b/i.test(n)) return "purpose";
    if (/\bwhat\s+are\s+you\s+here\s+for\b/i.test(n)) return "purpose";

    // Gate: appointment
    if (/\bappointment\b/i.test(n) && /\b(do\s+you\s+have|have\s+you\s+got|got\s+an|have\s+an|any)\b/i.test(n)) return "has_appointment";

    // Gate: who meeting / contact person
    if (/\b(who|with\s+whom)\b/i.test(n) && /\b(meet(ing)?|appointment|seeing|contact|point\s+of\s+contact)\b/i.test(n)) return "who_meeting";

    // Gate: time
    if (/\b(what\s+time|when)\b/i.test(n) && /\b(appointment|meeting)\b/i.test(n)) return "time_meeting";

    // Gate: about/topic
    if (/\b(what\s+is\s+it\s+about|topic|about)\b/i.test(n) && /\b(appointment|meeting|visit)\b/i.test(n)) return "about_meeting";

    // Gate: where/location
    if (/\b(where)\b/i.test(n) && /\b(appointment|meeting|going|location|building|room)\b/i.test(n)) return "where_meeting";

    // Gate: ID
    if (/\b(id|identification|identity\s+card)\b/i.test(n) && /\b(see|check|show|may\s+i\s+see|can\s+i\s+see)\b/i.test(n)) return "ask_id";

    // Supervisor
    if (/\b(check\s+with|contact|call|speak\s+to|talk\s+to)\s+(my\s+)?supervisor\b/i.test(n)) return "contact_supervisor";

    // Illegal items
    if (/\b(illegal\s+items?|prohibited\s+items?|contraband|banned\s+items?)\b/i.test(n) && /\b(do\s+you\s+have|any|carrying|with\s+you|on\s+you|in\s+your\s+(bag|car|vehicle))\b/i.test(n)) return "ask_illegal";
    if (/\b(weapons?|knife|knives|gun|firearm|ammo|drugs?|narcotics?|alcohol|booze)\b/i.test(n) && /\b(do\s+you\s+have|any|carrying|with\s+you|on\s+you)\b/i.test(n)) return "ask_illegal";
    if (/\b(no|not)\s+(weapons?|drugs?|alcohol)\b/i.test(n) || /\b(weapons?|drugs?|alcohol)\b[^.]{0,40}\b(not\s+allowed|forbidden|prohibited)\b/i.test(n)) return "explain_illegal";
    if (/\b(hand\s*(them)?\s*in|hand\s*it\s*in|please\s+hand|turn\s+it\s+in|surrender|give\s+it\s+to\s+me)\b/i.test(n)) return "request_handin";

    // Transitions
    if (/\b(go\s+to|proceed\s+to|walk\s+to|send\s+(him|her|the\s+visitor)\s+to)\b.*\b(person\s+search|search\s+area)\b/i.test(n)) return "go_person_search";
    if (/\b(go\s+to|proceed\s+to|walk\s+to)\b.*\b(sign\s*-?in|sign\s*in\s+office|reception|sign\s*in\s+desk)\b/i.test(n)) return "go_sign_in";


    return "unknown";
  }


  // chat
  let history=[];
  function addMsg(side, text, meta){
    history.push({side,text,meta:meta||""});
    if (history.length>60) history.shift();
    renderChat();
  }
  function renderChat(){
    if (!chatSlots) return;
    chatSlots.innerHTML="";
    // Keep the UI clean: show at most 4 chat bubbles.
    for (const m of history.slice(-4)){
      const row=document.createElement("div");
      row.className="chatRow "+(m.side==="visitor"?"left":"right");
      const img=document.createElement("img");
      img.className="avatar";
      img.alt = m.side==="visitor" ? "Visitor" : "Soldier";
      img.src = m.side==="visitor" ? (state?.visitor?.photoSrc||TRANSPARENT_PX) : (m.side==="supervisor" ? (supervisorAvatar.src||soldierAvatar.src) : (soldierAvatar.src||TRANSPARENT_PX));
      const bubble=document.createElement("div"); bubble.className="bubble";
      const t=document.createElement("div"); t.textContent=m.text||"";
      bubble.appendChild(t);
      if (m.meta){
        const meta=document.createElement("div"); meta.className="meta"; meta.textContent=m.meta; bubble.appendChild(meta);
      }
      if (m.side==="visitor"){ row.appendChild(img); row.appendChild(bubble); }
      else { row.appendChild(bubble); row.appendChild(img); }
      chatSlots.appendChild(row);
    }
    chatSlots.scrollTop = chatSlots.scrollHeight;
  }

  const q=[]; let tmr=null; let approach=null;
  
    function enqueueVisitor(text){
    // Show typing dots for ~2–3s max (fast iteration; length adds but is capped)
    const t = String(text||"");
    typingVisitor = true;
    renderTyping();

    // Base delay 2000–2600ms, plus a small length bonus, hard-capped at 3000ms.
    const base = 2000 + Math.floor(Math.random() * 601); // 2000..2600
    const lengthBonus = Math.min(t.length * 10, 700);
    const delay = Math.min(base + lengthBonus, 3000); 

    setTimeout(()=>{
      typingVisitor = false;
      // remove any pending typing placeholder and render
      addMsg("visitor", t);
      window.VEVA_LOG?.({type:"visitor", stage: state?.stage, text: t});
      speakVisitor(t);
      renderChat();
      updateHint();
    }, delay);
  }


  function drain(){
    if (tmr || !q.length) return;
    // typing dot
    history.push({side:"visitor", text:"", typing:true}); renderTyping();
    tmr=setTimeout(()=>{
      tmr=null;
      history = history.filter(x=>!x.typing);
      const next=q.shift();
      addMsg("visitor", next);
      window.VEVA_LOG?.({type:"visitor", stage: state.stage, text: next});
      speakVisitor(next);
      if (q.length) drain();
    }, 850);
  }
  function renderTyping(){
    if (!chatSlots) return;
    chatSlots.innerHTML="";
    const view = history.slice(-4);
    for (const m of view){
      const row=document.createElement("div");
      row.className="chatRow "+((m.side==="visitor")?"left":"right");
      const img=document.createElement("img");
      img.className="avatar";
      img.alt = m.side==="visitor" ? "Visitor" : (m.side==="supervisor" ? "Supervisor" : "Soldier");
      if (m.side==="visitor") img.src = state?.visitor?.photoSrc||TRANSPARENT_PX;
      else if (m.side==="supervisor") img.src = supervisorAvatar.src||soldierAvatar.src||TRANSPARENT_PX;
      else img.src = soldierAvatar.src||TRANSPARENT_PX;
      const bubble=document.createElement("div"); bubble.className="bubble";
      const t=document.createElement("div"); t.textContent=m.text||"";
      bubble.appendChild(t);
      if (m.meta){ const meta=document.createElement("div"); meta.className="meta"; meta.textContent=m.meta; bubble.appendChild(meta); }
      row.appendChild(img); row.appendChild(bubble);
      chatSlots.appendChild(row);
    }
    if (typingVisitor){
      const row=document.createElement("div"); row.className="chatRow left";
      const img=document.createElement("img"); img.className="avatar"; img.alt="Visitor"; img.src=state?.visitor?.photoSrc||TRANSPARENT_PX;
      const bubble=document.createElement("div"); bubble.className="bubble";
      const t=document.createElement("div"); t.innerHTML='<span class="typingDots"><span></span><span></span><span></span></span>';
      bubble.appendChild(t); row.appendChild(img); row.appendChild(bubble); chatSlots.appendChild(row);
    }
    chatSlots.scrollTop = chatSlots.scrollHeight;
  }


  function hideAllPanels(){
    if (idCardWrap) idCardWrap.hidden=true;
    if (supervisorPanel) supervisorPanel.hidden=true;
    if (personSearchPanel) personSearchPanel.hidden=true;
    if (signInPanel) signInPanel.hidden=true;
    if (passPanel) passPanel.hidden=true;
    const portraitRow = $("#portraitRow");
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()
    syncPortraitVisibility();

  }

  function showId(){
    hideAllPanels();
    if (!idCardWrap) return;

    // Hide the portrait guidance row to give the ID card full space
    const portraitRow = $("#portraitRow");
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()

    idCardWrap.hidden=false;
    syncPortraitVisibility();

    if (idScenario) idScenario.textContent = state.flowName || "Gate";
    if (idLevel) idLevel.textContent = String(session.difficulty||"standard").toUpperCase();
    if (idName) idName.textContent=state.visitor.name;
    if (idSurname) idSurname.textContent=state.visitor.last;
    if (idDob) idDob.textContent=state.visitor.dob;
    if (idNat) idNat.textContent=state.visitor.nat;
    if (idNo) idNo.textContent=state.visitor.idNo;
    if (idPhoto) idPhoto.src=state.visitor.photoSrc||TRANSPARENT_PX;
    if (idBarcode) idBarcode.textContent=`VEVA|${state.visitor.idNo}|${state.visitor.dob}|${state.visitor.nat}`;

    state.ui.idVisible=true;
    updateHint();
  }
  function hideId(){
    if (!idCardWrap) return;
    idCardWrap.hidden=true; state.ui.idVisible=false; updateHint();
    syncPortraitVisibility();

  }

  function showSupervisor(){
    hideAllPanels();
    // When a bottom-panel card is shown (Supervisor), hide the portrait + mood row.
    const portraitRow = $("#portraitRow");
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()
    // Auto-fill fields ONLY for items the student already asked (green tickmarks).
    // Missing items remain empty so the student still notices what's incomplete.
    const fl = state.flags || {};
    if (sv_wie) sv_wie.value = fl.nameAsked ? (state.visitor?.name || "") : "";
    if (sv_wat) sv_wat.value = fl.purposeAsked ? (state.facts?.purposeText || "") : "";
    if (sv_waar) sv_waar.value = fl.whereAsked ? (state.facts?.whereText || (state.facts?.locationCode ? `Gebouw ${state.facts.locationCode}` : "")) : "";
    if (sv_wanneer) sv_wanneer.value = fl.timeAsked ? (state.facts?.meetingTime || getMeetingTime(state)) : "";
    if (sv_waarom) sv_waarom.value = fl.aboutAsked ? (state.facts?.aboutText || "") : "";
    if (sv_note) sv_note.textContent = "";
    supervisorPanel.hidden=false;
    syncPortraitVisibility();
    if (supervisorPhoto) supervisorPhoto.src = supervisorAvatar.src || soldierAvatar.src;
    state.ui.supervisorVisible=true;
    if (panelTitle) panelTitle.textContent="Supervisor";
    if (panelSub) panelSub.textContent="5W/H report (NL)";
    updateHint();
  }
  function backToVisitor(){
    state.ui.supervisorVisible=false;
    supervisorPanel.hidden=true;
    if (panelTitle) panelTitle.textContent="Visitor";
    if (panelSub) panelSub.textContent=state.flowName||"—";
    if (state.stage.startsWith("ps_")){
      if (!state.flags.psSharpAsked) return 'Example: "Do you have any sharp objects on you?"';
      if (!state.flags.psRemoveOuter) return 'Example: "Please remove your jacket / headgear."';
      if (!state.flags.psPositioned) return 'Example: "Stand still. Hands on the wall. Feet apart."';
      if (!state.flags.psExplainArmpits) return 'Example: "I am going to search around your armpits."';
      if (!state.flags.psExplainWaist) return 'Example: "I am checking around your waistband / private area."';
      if (!state.flags.psLegOnKnee) return 'Example: "Please place your leg on my knee."';
      if (!state.flags.psItemsOk) return 'Example: "Everything looks fine. All items are OK."';
      if (!state.flags.psCleared) return 'Example: "You are cleared. Please proceed to sign-in."';
      return "Proceed to sign-in.";
    }
if (state.stage.startsWith("si_")) showSignIn();
    else if (state.ui.idVisible) idCardWrap.hidden=false;
    else hideAllPanels();
    updateHint();
    syncPortraitVisibility();

  }

  function showPersonSearch(){
    hideAllPanels();
    // Keep portrait row visible during Person Search
personSearchPanel.hidden=false;
    syncPortraitVisibility();
    if (panelTitle) panelTitle.textContent="Person Search";
    if (panelSub) panelSub.textContent="Search procedure";
    renderPS();
    updateHint();
  
    syncPortraitVisibility();
  }
  
  function setSignInView(mode){
    // mode: "register" | "rules"
    const titleEl = signInPanel ? signInPanel.querySelector(".cardTitle") : null;
    const subEl = signInPanel ? signInPanel.querySelector(".cardSub") : null;
    const chipEl = signInPanel ? signInPanel.querySelector(".chip") : null;

    const isRules = (mode==="rules");
    if (si_form){
      si_form.hidden = isRules;
      si_form.style.display = isRules ? "none" : "";
    }
    const sigLabel = signInPanel ? signInPanel.querySelector(".sigLabel") : null;
    if (sigLabel){
      sigLabel.hidden = isRules;
      sigLabel.style.display = isRules ? "none" : "";
    }
    if (si_rulesForm){
      si_rulesForm.hidden = !isRules;
      si_rulesForm.style.display = isRules ? "" : "none";
    }

    if (titleEl) titleEl.textContent = isRules ? "Wachtconsignes" : "Sign-in Register";
    if (subEl) subEl.textContent = isRules ? "Base rules briefing" : "Fill in the entry log.";
    if (chipEl) chipEl.textContent = isRules ? "RULES" : "REGISTER";
  }

function showSignIn(){
    hideAllPanels();
    signInPanel.hidden=false;
    syncPortraitVisibility();
    if (panelTitle) panelTitle.textContent="Sign-in";
    if (panelSub) panelSub.textContent="Register + pass";

    // In sign-in office, hide the portrait guidance block to give the form full space
    const portraitRow = $("#portraitRow");
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()

    // At arrival, the register starts blank. Fields are filled only when the student asks the questions here.
    state.flags = state.flags || {};
    if (!state.flags.siFormInitialized){
      if (si_name) si_name.value = "";
      if (si_poc) si_poc.value = "";
      if (si_time) si_time.value = "";
      if (si_loc) si_loc.value = "";
      if (si_company) si_company.value = "";
      state.flags.siFormInitialized = true;
    }

    // Missing company should stand out in the form during sign-in.
    if (si_company){
      const missing = !si_company.value;
      si_company.classList.toggle("missing", missing);
    }

    // Prepare pass number preview (student must state it later)
    state.pass = state.pass || {};
    state.pass.id = state.pass.id || ("VP-"+randInt(1000,9999));
    if (si_passPreview) si_passPreview.textContent = state.pass.id;

    // Signature / rules step:
    const signed = !!state.flags.siSigned;
    setSignInView(signed ? "rules" : "register");

    updateHint();
  }
  function showPass(){
    hideAllPanels();
    const portraitRow = $("#portraitRow");
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()
    passPanel.hidden=false;
    syncPortraitVisibility();
    if (panelTitle) panelTitle.textContent="Sign-in";
    if (panelSub) panelSub.textContent="Visitor pass issued";
    state.pass = state.pass || {};
    state.pass.id = state.pass.id || ("VP-"+randInt(1000,9999));
    state.pass.until = state.pass.until || "16:00";
    if (passNo) passNo.textContent="PASS: "+state.pass.id;
    if (passName) passName.textContent=state.visitor.name;
    if (passUntil) passUntil.textContent=state.pass.until;
    updateHint();
    syncPortraitVisibility();

  }

  function renderPS(){
    const ps = state.ps; if (!ps) return;

    // Risk chip
    if (psRiskChip) psRiskChip.textContent = "RISK: " + (ps.hasIllegal ? "POSSIBLE CONTRABAND" : "LOW");

    // Build readable outfit + item summary (no extra cards below)
    const o = ps.outfit || {};
    const style = (o.style === "workwear") ? "workwear" : "casual";
    const capTxt = o.cap ? "a cap" : "no cap";
    const jacketTxt = o.jacket ? "a jacket" : "no jacket";
    const bagTxt = o.bag ? "a bag" : "no bag";

    // Items list (max 6) and filter out any stray invalid names
    const rawItems = Array.isArray(ps.items) ? ps.items.slice(0, 6) : [];
    const items = rawItems
      .filter(it => it && it.name && !(/twelve\s*gun/i).test(String(it.name)))
      .map(it => String(it.name));

    const itemsText = items.length ? items.join(", ") : "none";

    if (psOutfit){
      psOutfit.innerHTML =
        `<div class="psLine">The visitor is wearing a <b>${style}</b> outfit with <b>${capTxt}</b>, <b>${jacketTxt}</b>, <b>${bagTxt}</b>.</div>` +
        `<div class="psLine">You see the following items on the table: <b>${itemsText}</b>.</div>`;
    }

    // Interactive item pills (tap to select, then type your question)
    if (psItemsText){
      psItemsText.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "psPillsWrap";

      const help = document.createElement("div");
      help.className = "psPillsHelp";
      help.textContent = "Tap an item to select it, then type your question (e.g., \"What is this?\").";
      wrap.appendChild(help);

      const makeRow = (label, arr, inPocket)=>{
        const row = document.createElement("div");
        row.className = "psPillsRow";
        const lab = document.createElement("div");
        lab.className = "psPillsRowLabel";
        lab.textContent = label;
        row.appendChild(lab);

        const pills = document.createElement("div");
        pills.className = "psPills";

        (arr||[])
          .filter(it => it && it.name && !(/twelve\s*gun/i).test(String(it.name)))
          .slice(0, 10)
          .forEach((it)=>{
            const btn = document.createElement("button");
            btn.type = "button";
            const isSel = (state.ps?.selectedId && it.id === state.ps.selectedId);
            btn.className = "psItemPill" + (inPocket ? " psItemPill--inPocket" : "") + (isSel ? " isSelected" : "");
            btn.textContent = String(it.name);
            btn.setAttribute("aria-pressed", isSel ? "true" : "false");
            btn.addEventListener("click", ()=>{
              if (!state.ps) return;
              state.ps.selectedId = it.id;
              state.ps.lastFeltId = it.id;
              renderPS();
              try{ textInput?.focus(); }catch{}
            });
            pills.appendChild(btn);
          });

        row.appendChild(pills);
        return row;
      };

      const tableItems = Array.isArray(ps.items) ? ps.items : [];
      const pocketItems = Array.isArray(ps.pocketItems) ? ps.pocketItems : [];

      if (tableItems.length) wrap.appendChild(makeRow("On the table", tableItems, false));
      if (pocketItems.length) wrap.appendChild(makeRow("Felt in pockets (not yet removed)", pocketItems, true));

      psItemsText.appendChild(wrap);
    }

    // Keep legacy item cards hidden (we use tabletop + pills)
    if (psCards){
      psCards.innerHTML = "";
      psCards.style.display = "none";
      psCards.hidden = true;
    }
  }

  function psItemExplanation(item){
    const displayName = String(item?.name || "this");
    const actualName  = String(item?.actualName || item?.name || "this");
    const where = item?.where ? String(item.where) : "my pocket";

    const isContraband = (nm)=>/\b(gun|firearm|knife|blade|whisky|vodka|beer|alcohol|joint|weed|cannabis|drugs?)\b/i.test(String(nm||""));
    const contraband = isContraband(actualName);
    const unknown = /unknown/i.test(displayName) || (String(item?.kind||"")==="unknown");

    // Non-contraband: just say what it is (no extra justification needed).
    if (!contraband && !unknown){
      return `It’s my ${actualName}.`;
    }

    // Contraband / unknown: include an excuse for why it was still in the pockets.
    const excuses = [
      `Sorry — I forgot it was still in ${where}.`,
      `I didn’t realize I had to empty my pockets.`,
      `I honestly wasn’t thinking — it must’ve stayed in ${where}.`,
      `I must have missed it when I emptied my pockets. Sorry.`,
      `I didn’t mean to bring it in — I forgot it was there.`
    ];

    if (unknown){
      const filler = [
        `Uh… it’s a ${actualName}.`,
        `I think it’s a ${actualName}.`,
        `It looks like a ${actualName}.`
      ];
      return `${pick(filler)} ${pick(excuses)}`;
    }

    // Contraband
    const openers = [
      `Uh… that’s a ${actualName}.`,
      `It’s a ${actualName}.`,
      `That’s a ${actualName}…`
    ];
    return `${pick(openers)} ${pick(excuses)}`;
  }

  // --- Person Search: pocket discoveries during pat-down ---
  function psIsActive(){ return !!state?.ps && state.flowName==="Person Search"; }

  function psFindById(id){
    const ps = state?.ps;
    if (!ps || !id) return null;
    const a = Array.isArray(ps.items) ? ps.items : [];
    const b = Array.isArray(ps.pocketItems) ? ps.pocketItems : [];
    return a.find(x=>x?.id===id) || b.find(x=>x?.id===id) || null;
  }

  function psPickFeltLocation(){
    return pick(["left pocket","right pocket","jacket pocket","waistband area"]);
  }

  function psCreatePocketItem(){
    const location = psPickFeltLocation();

    const benign = [
      {name:"Phone", actualName:"phone", kind:"legal"},
      {name:"USB", actualName:"USB stick", kind:"legal"},
      {name:"Headphones", actualName:"headphones", kind:"legal"},
      {name:"Keys", actualName:"keys", kind:"legal"},
      {name:"Wallet", actualName:"wallet", kind:"legal"},
      {name:"ID", actualName:"ID card", kind:"legal"},
      {name:"Notebook", actualName:"small notebook", kind:"legal"},
      {name:"Glasses", actualName:"glasses", kind:"legal"},
      {name:"Comb", actualName:"comb", kind:"legal"},
      {name:"Labello", actualName:"lip balm", kind:"legal"},
      {name:"Cigarette", actualName:"cigarette pack", kind:"legal"}
    ];

    const contraband = [
      {name:"Knife", actualName:"knife", kind:"illegal"},
      {name:"Gun", actualName:"gun", kind:"illegal"},
      {name:"Whisky", actualName:"small whisky bottle", kind:"illegal"},
      {name:"Joint", actualName:"joint", kind:"illegal"}
    ];

    // Chance the felt object is "unknown" to the student.
    const unknownRoll = Math.random() < 0.35;

    // If scenario already hints at illegal items, slightly increase chance of contraband.
    const illegalBias = state?.ps?.hasIllegal ? 0.35 : 0.18;
    const isIllegal = Math.random() < illegalBias;

    const chosen = isIllegal ? pick(contraband) : pick(benign);

    if (unknownRoll){
      // Display as unknown, but keep an actual name for explanation.
      return {
        id: uid("psPocket"),
        name: "Unknown item",
        actualName: chosen.actualName || chosen.name,
        kind: "unknown",
        where: location,
        inPocket: true
      };
    }

    return {
      id: uid("psPocket"),
      name: chosen.name,
      actualName: chosen.actualName || chosen.name,
      kind: chosen.kind || "legal",
      where: location,
      inPocket: true
    };
  }

  function psMaybeFeltDuringWaistSearch(){
    if (!psIsActive()) return false;
    const ps = state.ps;

    // Prevent spamming: max 2 "felt" items in pockets at a time.
    const pocketCount = Array.isArray(ps.pocketItems) ? ps.pocketItems.length : 0;
    if (pocketCount >= 2) return false;

    // 60% chance you actually feel something.
    const found = Math.random() < 0.60;
    if (!found) return false;

    const it = psCreatePocketItem();
    ps.pocketItems = Array.isArray(ps.pocketItems) ? ps.pocketItems : [];
    ps.pocketItems.push(it);
    ps.lastFeltId = it.id;
    ps.selectedId = it.id;

    enqueueVisitor(`As you pat around my waist, you feel a small object in my ${it.where}.`);
    renderPS();
    try{ textInput?.focus(); }catch{}
    return true;
  }

  function psTakeOutSelected(){
    if (!psIsActive()) return false;
    const ps = state.ps;
    const id = ps.selectedId || ps.lastFeltId;
    const idx = (ps.pocketItems||[]).findIndex(x=>x?.id===id);
    if (idx < 0) return false;

    const it = ps.pocketItems[idx];
    ps.pocketItems.splice(idx,1);
    it.inPocket = false;
    ps.items = Array.isArray(ps.items) ? ps.items : [];
    ps.items.push(it);

    enqueueVisitor("Okay. I’ll take it out and place it carefully on the table.");
    renderPS();
    return true;
  }

  function psEmptyPockets(){
    if (!psIsActive()) return false;
    const ps = state.ps;
    ps.pocketItems = Array.isArray(ps.pocketItems) ? ps.pocketItems : [];

    // If we already left something behind earlier and the student asks again, reveal it now.
    if (ps.leftBehindId && !ps.leftBehindResolved){
      const lbIdx = ps.pocketItems.findIndex(x=>x?.id===ps.leftBehindId);
      if (lbIdx >= 0){
        const it = ps.pocketItems[lbIdx];
        ps.pocketItems.splice(lbIdx,1);
        it.inPocket = false;
        ps.items = Array.isArray(ps.items) ? ps.items : [];
        ps.items.push(it);
        ps.leftBehindResolved = true;
        enqueueVisitor("Oh—wait. I missed something. I’ll put this on the table as well.");
      }
    }

    // First empty-pockets request: chance to leave one unknown item behind.
    if (!ps.leftBehindId && ps.pocketItems.length){
      if (Math.random() < 0.25){
        // Prefer leaving an unknown item; otherwise convert one item to unknown.
        let leave = ps.pocketItems.find(x=>/unknown/i.test(String(x?.name||"")));
        if (!leave){
          leave = ps.pocketItems[ps.pocketItems.length-1];
          leave.name = "Unknown item";
          leave.kind = "unknown";
        }
        ps.leftBehindId = leave.id;
      }
    }

    // Move everything except leftBehindId (if set and not resolved).
    const keepId = (ps.leftBehindId && !ps.leftBehindResolved) ? ps.leftBehindId : null;
    const toMove = ps.pocketItems.filter(x=>x?.id!==keepId);
    ps.pocketItems = ps.pocketItems.filter(x=>x?.id===keepId);

    if (toMove.length){
      ps.items = Array.isArray(ps.items) ? ps.items : [];
      toMove.forEach(it=>{ it.inPocket=false; ps.items.push(it); });
      enqueueVisitor("Okay. I’ll empty my pockets and place the items on the table.");
    } else {
      enqueueVisitor("Okay. My pockets are empty.");
    }

    renderPS();
    return true;
  }

  function psAnswerSelectedWhatIsThis(){
    if (!psIsActive()) return false;
    const ps = state.ps;
    const it = psFindById(ps.selectedId || ps.lastFeltId);
    if (!it){
      enqueueVisitor("Which item do you mean? Please tap an item first.");
      return true;
    }
    enqueueVisitor(psItemExplanation(it));
    return true;
  }

  // Hints
  function shouldHints(){ return (session.difficulty||"standard")!=="advanced"; }
  function setHint(t){ if (hintBandText) hintBandText.textContent=t||""; }
  function hideHint(){ if (!hintBand) return; hintBand.hidden=true; hintBand.style.display="none"; }
  function showHint(t){ if (!hintBand) return; hintBand.hidden=false; hintBand.style.display=""; setHint(t); }
  const PRESS_HINT_TEXT='Press for an answer: "I need an answer to that question, otherwise entry will be denied."';
  function updateHint(){
    if (!hintBand) return;
    // Always keep checklist in sync, even when hints are disabled (Advanced)
    if (!shouldHints() || state.ui.supervisorVisible){ hideHint(); updateChecklist(); return; }
    const diff = session.difficulty||"standard";
    const can = (diff==="basic") || (diff==="standard" && (state.misses||0)>=2);
    if (!can){ hideHint(); updateChecklist(); return; }
    showHint(nextHint());
    updateChecklist();
  }

  function ensureChecklistMarkup(){
    const panel = document.getElementById("checklistPanel");
    const list = document.getElementById("checklistList");
    if (!panel || !list) return;
    panel.style.display = "";
    if (list.children.length) return;
    list.innerHTML = `
      <div class="clGroup">
        <div class="clGroupTitle">Gate (5W/H + ID)</div>
        <label class="clItem" id="cl_gate_name"><input type="checkbox" disabled> <span>Name</span></label>
        <label class="clItem" id="cl_gate_purpose"><input type="checkbox" disabled> <span>Reason for visit</span></label>
        <label class="clItem" id="cl_gate_appt"><input type="checkbox" disabled> <span>Appointment</span></label>
        <label class="clItem" id="cl_gate_who"><input type="checkbox" disabled> <span>With whom</span></label>
        <label class="clItem" id="cl_gate_time"><input type="checkbox" disabled> <span>Time</span></label>
        <label class="clItem" id="cl_gate_about"><input type="checkbox" disabled> <span>About</span></label>
        <label class="clItem" id="cl_gate_where"><input type="checkbox" disabled> <span>Where</span></label>
        <label class="clItem" id="cl_gate_id"><input type="checkbox" disabled> <span>ID checked & returned</span></label>
        <label class="clItem" id="cl_gate_supervisor"><input type="checkbox" disabled> <span>Supervisor report (NL)</span></label>
        <label class="clItem" id="cl_gate_search"><input type="checkbox" disabled> <span>Explain search (increased threat)</span></label>
        <label class="clItem" id="cl_gate_rules"><input type="checkbox" disabled> <span>Illegal items check</span></label>
        <label class="clItem" id="cl_gate_send_ps"><input type="checkbox" disabled> <span>Sent to person search</span></label>
      </div>`;
    // rebind references if cache delivered old HTML
    checklistEls.gate_name = $("#cl_gate_name"); checklistEls.gate_purpose=$("#cl_gate_purpose"); checklistEls.gate_appt=$("#cl_gate_appt");
    checklistEls.gate_who=$("#cl_gate_who"); checklistEls.gate_time=$("#cl_gate_time"); checklistEls.gate_about=$("#cl_gate_about"); checklistEls.gate_where=$("#cl_gate_where");
    checklistEls.gate_id=$("#cl_gate_id"); checklistEls.gate_supervisor=$("#cl_gate_supervisor"); checklistEls.gate_search=$("#cl_gate_search"); checklistEls.gate_rules=$("#cl_gate_rules"); checklistEls.gate_send_ps=$("#cl_gate_send_ps");
  }

  function setChecklistDone(el, done, key){
    if (!el) return;

    const fl = state?.flags || {};
    const gateLocked = !!fl.gateLocked;
    const psLocked = !!fl.psLocked;
    const gateSnap = state?.lockedGate || {};
    const psSnap = state?.lockedPS || {};
    const isPSKey = !!(key && key.startsWith('ps_'));
    const doneVal = (gateLocked && key && (key in gateSnap)) ? !!gateSnap[key]
      : (psLocked && isPSKey && (key in psSnap)) ? !!psSnap[key]
      : !!done;
    el.classList.toggle("done", doneVal);
    const box = el.querySelector('input[type="checkbox"]');
    if (box){ box.checked = !!doneVal; box.indeterminate = false; }

    // missed marking: Gate keys after supervisor contact / move to PS / explicit lock
    const missableGate = new Set(["gate_name","gate_purpose","gate_appt","gate_who","gate_time","gate_about","gate_where","gate_id","gate_supervisor","gate_search","gate_rules"]);
    const missablePS = new Set(["ps_sharp","ps_remove","ps_position","ps_cleared"]);
    const missableSI = new Set(["si_signed","si_issued","si_pass_no","si_visible","si_show","si_return","si_alarm","si_closes"]);

    const gateMiss = !!fl.sentToPersonSearch;
    const psMiss = !!fl.sentToSignIn;
    const siMiss = !!fl.ended;

    const isPS = key && key.startsWith("ps_");
    const isSI = key && key.startsWith("si_");
    const shouldMiss = isPS ? psMiss : (isSI ? siMiss : gateMiss);

    const missable = isPS ? missablePS : (isSI ? missableSI : missableGate);

    if (shouldMiss && key && missable.has(key) && !doneVal){
      el.classList.add("missed");
      if (box){ box.checked = false; box.indeterminate = false; }
    } else {
      el.classList.remove("missed");
    }
  }

  
  function lockGateNow(){
    const f = state.facts || {};
    const fl = state.flags || {};
    state.flags.gateLocked = true;
    state.lockedGate = {
      gate_name: !!fl.nameAsked,
      gate_purpose: !!fl.purposeAsked,
      gate_appt: !!fl.apptAsked,
      gate_who: !!fl.whoAsked,
      gate_time: !!fl.timeAsked,
      gate_about: !!fl.aboutAsked,
      gate_where: !!fl.whereAsked,
      gate_id: !!fl.idChecked,
      gate_supervisor: !!fl.reportedSupervisor,
      gate_search: !!fl.searchExplained,
      gate_rules: !!fl.illegalDone
    };
  }

  function lockPSNow(){
    state.flags = state.flags || {};
    const fl = state.flags;
    fl.psLocked = true;
    const outfit = state?.ps?.outfit || {};
    const needsOuter = !!(outfit.jacket || outfit.cap || outfit.headgear || outfit.helmet);
    state.lockedPS = {
      ps_sharp: !!fl.psSharpAsked,
      ps_remove: (!needsOuter) || !!fl.psRemoveOuter,
      ps_position: !!fl.psPositioned,
      ps_cleared: !!fl.psCleared
    };
  }


  
  // Example sentences for feedback
  function exampleFor(key){
    const ex = {
      gate_name: 'Example: "What is your name?"',
      gate_purpose: 'Example: "What is the purpose of your visit?"',
      gate_appt: 'Example: "Do you have an appointment?"',
      gate_who: 'Example: "Who are you meeting with?"',
      gate_time: 'Example: "What time is your appointment?"',
      gate_about: 'Example: "What is the meeting about?"',
      gate_where: 'Example: "Where is the meeting / location?"',
      gate_id: 'Example: "May I see your ID, please?"',
      gate_supervisor: 'Example: "I will contact my supervisor and report this."',
      gate_search: 'Example: "Due to an increased threat level, everyone will be searched."',
      gate_rules: 'Example: "Do you have any illegal items—weapons, drugs, or alcohol?"',
      gate_send_ps: 'Example: "Please follow me to the person search area."',
      ps_sharp: 'Example: "Do you have any sharp objects on you?"',
      ps_remove: 'Example: "Please remove your jacket and headgear."',
      ps_position: 'Example: "Spread your arms and legs."',
      ps_cleared: 'Example: "I\'ve checked everything—you\'re OK. Clear to proceed."',
      si_signed: 'Example: "Please sign here."',
      si_pass_no: 'Example: "Your pass number is VP-1234."',
      si_issued: 'Example: "Here is your visitor pass."',
      si_rule_visible: 'Example: "Keep the pass visible at all times."',
      si_rule_show: 'Example: "Show it on request."',
      si_rule_return: 'Example: "Return it when you leave."',
      si_rule_alarm: 'Example: "In an alarm, go to the assembly point."',
      si_rule_closes: 'Example: "The base closes at 1700."',
    };
    return ex[key] || "";
  }

function buildScenarioSummary(){
    try{
      updateChecklist();

      const rows = [];
      const all = Object.entries(checklistEls || {}).filter(([k,el])=>!!el);
      let ok=0, miss=0, todo=0;

      // group keys into sections
      const sectionOf = (key)=>{
        if (key.startsWith("gate_")) return "Gate";
        if (key.startsWith("ps_")) return "Person search";
        if (key.startsWith("si_")) return "Sign-in";
        return "Other";
      };

      const sectionStats = {};
      const addSec = (sec)=>{ sectionStats[sec] ||= {ok:0, miss:0, todo:0, total:0}; };

      for (const [key, el] of all){
        const label = (el.textContent || key).trim();
        const isDone = el.classList.contains("done");
        const isMiss = el.classList.contains("missed");
        if (isDone) ok++;
        else if (isMiss) miss++;
        else todo++;

        const sec = sectionOf(key);
        addSec(sec);
        sectionStats[sec].total++;
        if (isDone) sectionStats[sec].ok++;
        else if (isMiss) sectionStats[sec].miss++;
        else sectionStats[sec].todo++;

        rows.push({key, label, status: isDone ? "ok" : (isMiss ? "miss" : "todo"), section: sec});
      }

      // Score: only score sections the student actually reached.
      // - Gate is always applicable.
      // - Person search is applicable after being sent to PS (or later).
      // - Sign-in is applicable after being sent to sign-in (or later).
      const reachedPS = !!state?.flags?.sentToPersonSearch || (state?.stage||"").startsWith("ps_") || (state?.stage||"").startsWith("si_");
      const reachedSI = !!state?.flags?.sentToSignIn || (state?.stage||"").startsWith("si_") || !!state?.flags?.ended;
      const isApplicable = (key)=>{
        if (!key) return true;
        if (key.startsWith("gate_")) return true;
        if (key.startsWith("ps_")) return reachedPS;
        if (key.startsWith("si_")) return reachedSI;
        return true;
      };

      const applicable = rows.filter(r=>isApplicable(r.key));
      const total = applicable.length;
      const okA = applicable.filter(r=>r.status==="ok").length;
      const missA = applicable.filter(r=>r.status==="miss").length;
      const todoA = applicable.filter(r=>r.status==="todo").length;
      const score = total ? Math.round((okA / total) * 100) : 0;

      // Per-section scores (only meaningful when section was reached)
      const gateSt = sectionStats["Gate"] || {ok:0,total:0};
      const psSt = sectionStats["Person search"] || {ok:0,total:0};
      const siSt = sectionStats["Sign-in"] || {ok:0,total:0};
      const gateScore = gateSt.total ? Math.round((gateSt.ok / gateSt.total) * 100) : 0;
      const psScore = reachedPS ? (psSt.total ? Math.round((psSt.ok / psSt.total) * 100) : 0) : null;
      const siScore = reachedSI ? (siSt.total ? Math.round((siSt.ok / siSt.total) * 100) : 0) : null;

      const grade = (score>=90) ? "Excellent" : (score>=75) ? "Good" : (score>=60) ? "Needs improvement" : "Poor";
      const gradeHint = (grade==="Excellent") ? "Very strong performance—keep this pace." :
        (grade==="Good") ? "Solid run. Tighten up the missed steps for a higher score." :
        (grade==="Needs improvement") ? "You covered some key steps, but missed several required actions." :
        "Many required steps were missed—slow down and follow the checklist.";

      // top strengths: first 3 ok items (applicable only)
      const strengths = applicable.filter(r=>r.status==="ok").slice(0,3).map(r=>r.label);

      // improvements: prioritize missed first, then todo (applicable only)
      const misses = applicable.filter(r=>r.status==="miss");
      const todos = applicable.filter(r=>r.status==="todo");

      const topFixes = [...misses, ...todos].slice(0,3).map(r=>({label:r.label, hint: exampleFor(r.key)}));

      // Return both raw and applicable counts for display.
      return {
        ok, miss, todo,
        totalRaw: (ok+miss+todo),
        okA, missA, todoA, total,
        score, grade, gradeHint,
        gateScore, psScore, siScore,
        rows, sectionStats, strengths, topFixes
      };
    }catch(e){
      return {ok:0, miss:0, todo:0, totalRaw:0, okA:0, missA:0, todoA:0, total:0, score:0, grade:"—", gradeHint:"", rows:[], sectionStats:{}, strengths:[], topFixes:[]};
    }
  }

  function showScenarioSummary(sum){
    sum = sum || buildScenarioSummary();

    if (summaryStats){
      summaryStats.textContent = `${sum.grade} — ${sum.score}%  •  Done: ${sum.okA}/${sum.total}  •  Missed: ${sum.missA}  •  Remaining: ${sum.todoA}  •  ${sum.gradeHint}`;
    }

    // KPIs per section
    if (summaryHighlights){
      const secOrder = ["Gate","Person search","Sign-in","Other"];
      const kpis = secOrder.filter(s=>sum.sectionStats[s]).map(s=>{
        const st = sum.sectionStats[s];
        const pct = st.total ? Math.round((st.ok / st.total) * 100) : 0;
        return `<div class="kpi"><b>${s}:</b> ${pct}% (✓${st.ok} ✕${st.miss} •${st.todo})</div>`;
      }).join("");
      const strengths = (sum.strengths && sum.strengths.length)
        ? `<ul>${sum.strengths.map(t=>`<li>${t}</li>`).join("")}</ul>`
        : `<ul><li>No completed steps yet.</li></ul>`;

      summaryHighlights.innerHTML = `<h4>What went well</h4>${strengths}<div class="kpiRow">${kpis}</div>`;
    }

    if (summaryImprovements){
      const fixes = (sum.topFixes && sum.topFixes.length)
        ? `<ul>${sum.topFixes.map(f=>`<li><b>${f.label}</b>${f.hint ? `<br><span class="muted">${f.hint}</span>` : ""}</li>`).join("")}</ul>`
        : `<ul><li>Nothing to improve — great run.</li></ul>`;
      summaryImprovements.innerHTML = `<h4>Top improvements (next run)</h4>${fixes}`;
    }

    if (summaryList){
      summaryList.innerHTML = "";
      // sort by section, then status (miss, todo, ok)
      const statusRank = {miss:0, todo:1, ok:2};
      const sectionRank = { "Gate":0, "Person search":1, "Sign-in":2, "Other":3 };
      const sorted = [...sum.rows].sort((a,b)=> (sectionRank[a.section]??9)-(sectionRank[b.section]??9) || (statusRank[a.status]??9)-(statusRank[b.status]??9) );

      sorted.forEach(r=>{
        const div=document.createElement("div");
        div.className="summaryRow";
        const badge=document.createElement("div");
        badge.className = "summaryBadge " + (r.status==="ok" ? "summaryBadge--ok" : (r.status==="miss" ? "summaryBadge--miss" : "summaryBadge--todo"));
        badge.textContent = (r.status==="ok" ? "✓" : (r.status==="miss" ? "✕" : "•"));
        const txt=document.createElement("div");
        txt.className="summaryText";
        const t=document.createElement("div");
        t.className="summaryTitle";
        t.textContent = `[${r.section}] ${r.label}`;
        const h=document.createElement("div");
        h.className="summaryHint";
        const ex = (r.status!=="ok") ? exampleFor(r.key) : "";
        h.textContent = (r.status==="ok" ? "Completed." : (r.status==="miss" ? "Not asked / skipped." : "Not reached yet.")) + (ex ? "  " + ex : "");
        txt.appendChild(t); txt.appendChild(h);
        div.appendChild(badge); div.appendChild(txt);
        summaryList.appendChild(div);
      });
    }

    if (summaryModal) summaryModal.hidden=false;
  }

  // --- Results logging (Google Sheets via Apps Script Web App) ---
  function logResultsToSheets(sum){
    try{
      const url = window.CONFIG?.logEndpoint;
      if (!url) return;

      const student = (session?.surname || "").trim();
      const className = (session?.group || "").trim();
      const difficulty = (session?.difficulty || "standard").trim();
      state.runId = state.runId || ("RUN-"+randInt(100000,999999));

      const payload = {
        ts: new Date().toISOString(),
        event: eventName,
        student,
        className,
        runId: state.runId,
        stats: {
          difficulty,
          totalScore: (sum?.score ?? ""),
          gateScore: (sum?.gateScore ?? ""),
          personSearchScore: (sum?.psScore==null) ? "" : sum.psScore,
          signInScore: (sum?.siScore==null) ? "" : sum.siScore,
          top3: sum?.topFixes || [],
          build: String(BUILD?.version || ""),
          userAgent: navigator.userAgent
        },
        userAgent: navigator.userAgent
      };

      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(()=>{});
    }catch{}
  }

  function endScenarioNow(eventName){
    eventName = eventName || "endScenario";
    state.flags.ended = true;
    try{ inputEl.disabled = true; }catch{}
    try{ sendBtn.disabled = true; }catch{}
    try{ btnEndScenario.disabled = true; }catch{}
    const sum = buildScenarioSummary();
    showScenarioSummary(sum);
    // Fire-and-forget Google Sheets logging
    try{ logResultsToSheets(sum); }catch{}
  }

function updateChecklist(){
    ensureChecklistMarkup();
    if (!state) return;
    const f = state.facts || {};
    const fl = state.flags || {};

    setChecklistDone(checklistEls.gate_name, !!fl.nameAsked, "gate_name");
    setChecklistDone(checklistEls.gate_purpose, !!fl.purposeAsked, "gate_purpose");
    setChecklistDone(checklistEls.gate_appt, !!fl.apptAsked, "gate_appt");
    setChecklistDone(checklistEls.gate_who, !!fl.whoAsked, "gate_who");
    setChecklistDone(checklistEls.gate_time, !!fl.timeAsked, "gate_time");
    setChecklistDone(checklistEls.gate_about, !!fl.aboutAsked, "gate_about");
    setChecklistDone(checklistEls.gate_where, !!fl.whereAsked, "gate_where");
    setChecklistDone(checklistEls.gate_id, !!fl.idChecked, "gate_id");
    setChecklistDone(checklistEls.gate_supervisor, !!fl.reportedSupervisor, "gate_supervisor");
    setChecklistDone(checklistEls.gate_search, !!fl.searchExplained, "gate_search");
    setChecklistDone(checklistEls.gate_rules, !!fl.illegalDone, "gate_rules");
    setChecklistDone(checklistEls.gate_send_ps, !!fl.sentToPersonSearch, "gate_send_ps");

    const outfit = state?.ps?.outfit || {};
    const needsOuter = !!(outfit.jacket || outfit.cap || outfit.headgear || outfit.helmet);
    setChecklistDone(checklistEls.ps_sharp, !!fl.psSharpAsked, "ps_sharp");
    // Only required if the visitor is actually wearing outerwear/headgear.
    setChecklistDone(checklistEls.ps_remove, (!needsOuter) || !!fl.psRemoveOuter, "ps_remove");
    setChecklistDone(checklistEls.ps_position, !!fl.psPositioned, "ps_position");
    setChecklistDone(checklistEls.ps_cleared, !!fl.psCleared, "ps_cleared");

    setChecklistDone(checklistEls.si_signed, !!fl.siSigned, "si_signed");
    setChecklistDone(checklistEls.si_issued, !!fl.siIssued, "si_issued");
    setChecklistDone(checklistEls.si_pass_no, !!fl.siPassNoStated, "si_pass_no");
    setChecklistDone(checklistEls.si_visible, !!fl.siRuleVisible, "si_visible");
    setChecklistDone(checklistEls.si_show, !!fl.siRuleShowOnRequest, "si_show");
    setChecklistDone(checklistEls.si_return, !!fl.siRuleReturnOnExit, "si_return");
    setChecklistDone(checklistEls.si_alarm, !!fl.siRuleAlarmAssembly, "si_alarm");
    setChecklistDone(checklistEls.si_closes, !!fl.siRuleBaseCloses, "si_closes");

    checkAutoEnd();
  }
  


  function checkAutoEnd(){
    if (!state || state.autoEnded) return;
    // Auto-end only when user reached Sign-in and completed all required items for reached phases
    const fl = state.flags || {};
    if (!state.reachedSI) return;

    const gateOk = !!fl.nameAsked && !!fl.purposeAsked && !!fl.apptAsked && !!fl.whoAsked && !!fl.timeAsked && !!fl.aboutAsked && !!fl.whereAsked
      && !!fl.idChecked && !!fl.reportedSupervisor && !!fl.searchExplained && !!fl.illegalDone && !!fl.sentToPersonSearch;

    const outfit = state?.ps?.outfit || {};
    const needsOuter = !!(outfit.jacket || outfit.cap || outfit.headgear || outfit.helmet);
    const psOk = !state.reachedPS || (
      !!fl.psSharpAsked && (!!fl.psPositioned) && (!!fl.psCleared) && (!needsOuter || !!fl.psRemoveOuter)
    );

    const siOk = !!fl.siSigned && !!fl.siIssued && !!fl.siPassNoStated && !!fl.siRuleVisible && !!fl.siRuleShowOnRequest
      && !!fl.siRuleReturnOnExit && !!fl.siRuleAlarmAssembly && !!fl.siRuleBaseCloses;

    if (gateOk && psOk && siOk){
      state.autoEnded = true;
      // tiny delay so UI updates render before modal appears
      setTimeout(()=>{ try{ endScenario(); } catch(e){} }, 250);
    }
  }
function nextHint(){
    if (state.stage.startsWith("gate_")){
      const f=state.facts;
      if (!f.name) return 'Example: "What is your full name?"';
      if (!f.purpose) return 'Example: "What is the purpose of your visit today?"';
      if (!state.flags.apptAsked) return 'Example: "Do you have an appointment?"';
      if (!f.who) return 'Example: "With whom do you have an appointment?"';
      if (!f.time) return 'Example: "What time is the appointment?"';
      if (!f.about) return 'Example: "What is the appointment about?"';
      if (!f.location) return 'Example: "Where is the appointment?"';
      if (!state.flags.idChecked) return 'Example: "Can I see your ID, please?"';
      if (!state.flags.reportedSupervisor) return 'Example: "I will contact my supervisor."';
      if (!state.flags.searchExplained) return 'Example: "Due to an increased threat level, everyone will be searched."';
      if (!state.flags.illegalDone) return 'Example: "Do you have any illegal items—weapons, drugs, or alcohol?"';
      if (!state.flags.sentToPersonSearch) return 'Example: "Please go to person search. My colleague will assist you."';
      return "Continue the procedure.";
    }
    if (state.stage.startsWith("ps_")){
      if (!state.flags.psSharpAsked) return 'Example: "Do you have any sharp objects on you?"';
      if (!state.flags.psPositioned) return 'Example: "Spread your arms and legs."';
      if (!state.flags.psCleared) return 'Example: "I\'ve checked everything—you\'re OK. Clear to proceed."';
      return "Proceed to sign-in.";
    }
    if (state.stage.startsWith("si_")){
      if (!state.flags.siIssued) return "Fill the register and issue a visitor pass.";
      return "Ask them to return the pass when leaving.";
    }
    return "Continue.";
  }
  function miss(nudge){ state.misses=(state.misses||0)+1; updateHint(); if(nudge) showHint(nudge); }

  // state
  let state = null;

  function resetScenario(){
    currentMood = MOODS[randInt(0, MOODS.length-1)];
    const v = makeRandomVisitor();
    v.contact = makeContact();
    state = {
      flowName:"Gate", stage:"gate_approach", misses:0, lastIntent:"", lastAsked:"",
      visitor:v,
      facts:{ name:"", purpose:"", appt:"yes", who:"", time:"", about:"", location:"", meetingTime:"", locationCode:"", purposeText:"", whoText:"", aboutText:"", whereText:"", company:"" },
      flags:{ idChecked:false, reportedSupervisor:false, searchExplained:false, illegalDone:false, sentToPersonSearch:false, psSharpAsked:false, psRemoveOuter:false, psPositioned:false, psCleared:false, siIssued:false, siRuleVisible:false, siRuleShowOnRequest:false, siRuleReturnOnExit:false, siRuleAlarmAssembly:false, siRuleBaseCloses:false },
      ui:{ idVisible:false, supervisorVisible:false },
      ps:null, pass:null,
      evasiveFor: pick(["purpose","who_meeting","about_meeting","where_meeting","time_meeting"])
    };

    history=[]; renderChat();

    // New scenario => clear notes
    if (notesPad){ notesPad.value = ""; }
    saveNotes("");

    hideAllPanels();
    const portraitRow = $("#portraitRow");
    // Default: show portrait + mood indicator when no bottom panel is active.
  // portrait visibility handled by syncPortraitVisibility()  // portrait visibility handled by syncPortraitVisibility()

    if (portraitPhoto) portraitPhoto.src = v.photoSrc || TRANSPARENT_PX;
    if (portraitMood) portraitMood.textContent = `A visitor is approaching the gate. ${currentMood.line}`;
    if (portraitDesc) portraitDesc.textContent = "";

    // Add a short scene-setting line in the chat at scenario start.
    addMsg("visitor", "A visitor is approaching the gate.");

    if (approach) clearTimeout(approach);
    approach=setTimeout(()=>{
      state.stage="gate_start";
      enqueueVisitor(phrase("shared","greeting",state));
      window.VEVA_LOG?.({type:"system", action:"scenario_start", student:session, mood:currentMood.key, evasiveFor:state.evasiveFor});
      updateHint();
    }, 5000);
  }

  function gateComplete(){
    const f=state.facts;
    return !!(f.name && f.purpose && f.who && f.time && f.about && f.location && state.flags.idChecked && state.flags.reportedSupervisor && state.flags.illegalDone);
  }

  function enterPersonSearch(){
    state.flowName="Person Search";
    state.stage="ps_arrival";
    const V=window.VEVA_PS_VISUALS;
    const outfit=V?.makeOutfit?V.makeOutfit():{cap:false,jacket:false,bag:false,style:"casual"};
    const itemsObj=V?.makeItems?V.makeItems():{items:[],hasIllegal:false};
    const sharpItem = pick([null,null,null,"small pocket knife","needle","razor blade"]); // ~40% chance
    state.ps={
      outfit,
      items:(itemsObj.items||[]).map((it)=>({...(it||{}), id:(it&&it.id)||uid("psItem"), inPocket:false})),
      pocketItems:[],
      lastFeltId:null,
      selectedId:null,
      leftBehindId:null,
      leftBehindResolved:false,
      hasIllegal:itemsObj.hasIllegal,
      sharpItem
    };
    if (portraitMood) portraitMood.textContent="Person Search";
    if (portraitDesc) portraitDesc.textContent="Give clear instructions. If you find something, ask them to take it out.";
    showPersonSearch();
    enqueueVisitor(pick(window.VEVA_PHRASES?.person_search?.arrival || ["You arrive at the person search area."]));
    updateHint();
  }

  function handleGate(intent, raw){
    // Normalize intent keys (detectIntent uses ask_*; handlers use legacy keys)
    const rawN = String(raw||"");
    const map = { ask_purpose:"purpose", ask_where:"where_meeting", ask_appt:"has_appointment", ask_who:"who_meeting", ask_time:"time_meeting", ask_about:"about_meeting" };
    if (map[intent]) intent = map[intent];

    if (state.stage==="gate_start" || state.stage==="gate_help"){
      // Allow jumping straight into questions (no mandatory "How can I help")
      state.stage="gate_5wh";
    }

    if (intent==="ask_name"){
      state.flags.nameAsked = true;
      updateChecklist(); state.facts.name=state.visitor.name; enqueueVisitor(`My name is ${state.visitor.first}.`); updateHint(); return; }
    if (intent==="ask_surname"){
      state.flags.nameAsked = true;
      updateChecklist(); enqueueVisitor(`My surname is ${state.visitor.last}.`); updateHint(); return; }
    if (intent==="purpose"){
      state.flags.purposeAsked = true;
      updateChecklist();
      state.facts.purpose="known";
      if (state.evasiveFor==="purpose" && bandFromMood()==="evasive" && !state.flags.forcedCoop){
        enqueueVisitor("It’s personal."); showHint(PRESS_HINT_TEXT); return;
      }
      const resp = phrase("gate","purpose",state, state.flags.forcedCoop ? "open":null);
      state.facts.purposeText = resp;
      enqueueVisitor(resp);
      updateHint(); return;
    }
    if (intent==="has_appointment"){ state.flags.apptAsked = true; updateChecklist(); state.visitorDeclaredAppt = "yes"; /* info only */ enqueueVisitor(phrase("gate","has_appointment_yes",state)); updateHint(); return; }

    if (intent==="who_meeting"){
      state.flags.whoAsked = true;
      updateChecklist();
      state.facts.who="known";
      if (state.evasiveFor==="who_meeting" && bandFromMood()==="evasive" && !state.flags.forcedCoop && !state.flags.evasiveUsed){
        state.flags.evasiveUsed=true;
        enqueueVisitor("Someone inside."); showHint(PRESS_HINT_TEXT); return;
      }
      const resp = phrase("gate","who_meeting",state, state.flags.forcedCoop ? "open":null);
      state.facts.whoText = resp;
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="time_meeting"){
      state.flags.timeAsked = true;
      updateChecklist();
      state.facts.time="known";
      const t = getMeetingTime(state);
      state.facts.meetingTime = t;
      enqueueVisitor(`My appointment is at ${t}.`);
      updateHint();
      return;
    }
    if (intent==="about_meeting"){
      state.flags.aboutAsked = true;
      updateChecklist();
      state.facts.about="known";
      const resp = phrase("gate","about_meeting",state, state.flags.forcedCoop ? "open":null);
      state.facts.aboutText = resp;
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="where_meeting"){
      state.flags.whereAsked = true;
      updateChecklist();
      state.facts.location="known";
      const resp = `At reception, building ${state.facts.locationCode}.`;
      state.facts.whereText = `Gebouw ${state.facts.locationCode}`;
      enqueueVisitor(resp);
      updateHint();
      return;
    }

    if (intent==="ask_id"){
      state.flags.idChecked=true;
      showId();
      enqueueVisitor(phrase("gate","ask_id",state));
      window.VEVA_LOG?.({type:"id", action:"shown", idNo:state.visitor.idNo});
      updateHint(); return;
    }
    if (intent==="dob_q"){ enqueueVisitor(`My date of birth is ${state.visitor.dob}.`); return; }
    if (intent==="nat_q"){ enqueueVisitor(`My nationality is ${state.visitor.nat}.`); return; }
    if (intent==="spell_last_name"){
      state.flags.nameAsked = true;
      updateChecklist();
      const letters=String(state.visitor.last||"").replace(/[^A-Za-z]/g,"").toUpperCase().split("");
      enqueueVisitor(letters.length?letters.join("-"):String(state.visitor.last||"").toUpperCase());
      return;
    }

    if (intent==="return_id"){
      if (state.ui.idVisible){ hideId(); enqueueVisitor(phrase("gate","return_id",state)); window.VEVA_LOG?.({type:"id", action:"returned"}); updateHint(); return; }
      miss("Show the ID first."); return;
    }

    if (intent==="contact_supervisor"){
      if (!state.flags.idChecked){ enqueueVisitor("Please check my ID first."); miss('Try: “Can I see your ID, please?”'); return; }
      state.flags.reportedSupervisor=true;
      showSupervisor();
      return;
    }


    if (intent==="ask_illegal"){
      state.flags.illegalAsked = true;
      // For training: asking the illegal items question counts as completing the illegal-items check.
      state.flags.illegalDone = true;
      // If the student asks specifically about weapons/drugs/alcohol, visitor can answer directly.
      if (/\b(weapons?|knife|knives|gun|firearm|ammo|drugs?|narcotics?|alcohol)\b/i.test(rawN)){
        if (state.visitor?.illegalItem){
          enqueueVisitor(`Yes. I have ${state.visitor.illegalItem}.`);
        } else {
          enqueueVisitor("No, I don\'t have any weapons, drugs or alcohol with me.");
        }
      } else {
        enqueueVisitor("What do you mean by illegal items?");
      }
      updateChecklist();
      updateHint();
      return;
    }
    if (intent==="search_announce"){
      state.flags.searchExplained = true;
      enqueueVisitor("Okay, I understand.");
      updateChecklist();
      updateHint();
      return;
    }
    if (intent==="explain_illegal" || intent==="rules_contraband"){
      state.flags.illegalExplained = true;
      enqueueVisitor("Okay, I understand.");
      updateHint();
      return;
    }
    if (intent==="request_handin"){
      state.flags.illegalDone = true;
      enqueueVisitor("Sure. If I have anything, I can hand it in now.");
      updateHint();
      return;
    }


    if (intent==="press_for_answer"){
      state.flags.forcedCoop=true;
      enqueueVisitor("Understood. I will answer your questions.");
      showHint(PRESS_HINT_TEXT);
      updateHint();
      return;
    }

    if (intent==="go_person_search"){
      // Lock gate results now so later questions cannot retroactively fix earlier misses
      try{ lockGateNow(); }catch(e){}
      state.flags.sentToPersonSearch=true;
      updateChecklist();
      enqueueVisitor("Okay.");
      // Student initiates move to person search

      // Show 5s transition popup instead of a visitor line
      if (transitionText) transitionText.textContent = "The visitor follows you to the person search area.";
      if (transitionBanner){ transitionBanner.textContent = "The visitor is following you to the person search area."; transitionBanner.hidden=false; }
      if (transitionModal) transitionModal.hidden = false;

      setTimeout(()=>{
        if (transitionModal) transitionModal.hidden = true;
        if (transitionBanner) transitionBanner.hidden = true;
        enterPersonSearch();
      }, 5000);
      return;
    }

    miss('Example: "What is the purpose of your visit today?" or "Can I see your ID, please?" or "I will contact my supervisor."');
  }

  function handlePS(intent, raw){
    showPersonSearch();

    // If PS has been locked (jumped forward), do not award retroactive credit.
    if (state?.flags?.psLocked){
      enqueueVisitor("Understood.");
      updateHint();
      return;
    }

    // Normalize legacy keys
    if (intent==="ps_any_sharp") intent = "ps_ask_sharp";
    if (intent==="ps_position_arms" || intent==="ps_position_legs") intent = "ps_position";
    if (intent==="ps_search_areas") intent = "ps_explain_waist";
    if (intent==="ps_leg_on_knee") intent = "ps_leg_on_knee";

    if (intent==="ps_ask_sharp"){
      state.flags.psSharpAsked = true;
      updateChecklist();
      if (state.ps?.sharpItem){
        enqueueVisitor(`Yes. I have a ${state.ps.sharpItem}.`);
        enqueueVisitor("Here you go. I can hand it in now.");
        state.ps.sharpItem = null;
      } else {
        enqueueVisitor("No, I don't have any sharp objects on me.");
      }
      updateHint();
      return;
    }

    if (intent==="ps_remove_outer"){
      state.flags.psRemoveOuter = true;
      updateChecklist();
      enqueueVisitor("Okay. I'll remove my jacket / headgear.");
      updateHint();
      return;
    }

    if (intent==="ps_position"){
      state.flags.psPositioned = true;
      updateChecklist();
      enqueueVisitor("Okay.");
      updateHint();
      return;
    }

    // Pocket / clothing instructions
    if (intent==="ps_strip"){
      state.flags.psStrip = true;
      updateChecklist();
      enqueueVisitor("Okay… I will remove all my clothes as requested.");
      updateHint();
      return;
    }

    if (intent==="ps_empty_pockets" || intent==="ps_items_table"){
      state.flags.psEmptyPockets = true;
      updateChecklist();
      try{ psEmptyPockets(); }catch(e){ enqueueVisitor("Okay."); }
      updateHint();
      return;
    }


    // Explain where you will search (must mention at least armpits + waistband/private)
    if (intent==="ps_explain_armpits"){
      state.flags.psExplainArmpits = true;
      updateChecklist();
      enqueueVisitor("Okay.");
      updateHint();
      return;
    }
    if (intent==="ps_explain_waist"){
      state.flags.psExplainWaist = true;
      updateChecklist();
      enqueueVisitor("Okay.");
      // When the student announces they will search around the waist, there is a chance you actually feel an item.
      try{ psMaybeFeltDuringWaistSearch(); }catch(e){}
      updateHint();
      return;
    }

    if (intent==="ps_leg_on_knee"){
      state.flags.psLegOnKnee = true;
      updateChecklist();
      enqueueVisitor("Okay.");
      updateHint();
      return;
    }

    if (intent==="ps_check_items"){
      state.flags.psItemsOk = true;
      updateChecklist();
      enqueueVisitor("Okay.");

      // If the student combines "items are OK" with a clearance instruction, allow immediate transition.
      const n = normalize(raw||"");
      if (/\b(clear(ed)?\s+to\s+(proceed|go)|you\s+are\s+clear|free\s+to\s+proceed|ok(ay)?\s+to\s+proceed)\b/i.test(n) && /\b(sign\s*in|register|sign-in|office)\b/i.test(n)){
        state.flags.psCleared = true;
        state.flags.sentToSignIn = true;
        updateChecklist();
        state.flowName="Sign-in";
        state.stage="si_arrival";
        showSignIn();
        enqueueVisitor("Okay. I will proceed to sign-in.");
      }

      updateHint();
      return;
    }


    // Free-form questions during Person Search (student must type it themselves)
    if (state.flowName==="Person Search" && intent==="unknown"){
      const n = normalize(raw||"");
      if (/\bwhat\s+is\s+this\b|\bwhat\'s\s+this\b|\bwhat\s+is\s+that\b/i.test(n)){
        try{ psAnswerSelectedWhatIsThis(); }catch(e){ enqueueVisitor("Which item do you mean?"); }
        updateHint();
        return;
      }

      if (/\b(take\s+it\s+out|remove\s+it|pull\s+it\s+out|take\s+that\s+out|remove\s+that)\b/i.test(n) || (/\b(place|put|set)\b/i.test(n) && /\b(on|in)\b/i.test(n) && /\btable|tray\b/i.test(n))){
        const ok = (function(){ try{ return psTakeOutSelected(); }catch(e){ return false; } })();
        if (ok){ updateHint(); return; }
      }
    }

    if (intent==="ps_clear" || intent==="ps_resolve" || intent==="go_sign_in"){
      // Only clear after key steps have been covered; student can still proceed, misses are marked at transition.
      state.flags.psCleared = true;
      state.flags.sentToSignIn = true; // finalize PS misses on transition
      updateChecklist();
      state.flowName="Sign-in";
      state.stage="si_arrival";
      showSignIn();
      enqueueVisitor("Okay. You are cleared. Please proceed to sign-in.");
      updateHint();
      return;
    }

    miss('Person Search: ask about sharp objects, remove jacket/headgear if needed, give positioning (spread arms and legs), then clear the person (e.g., "I\'ve checked everything—you\'re OK. Clear to proceed.").');
  }

  
  function maybeCompleteSignIn(){
    if (!state || state.flowName!=="Sign-in") return;
    const rulesOk = !!(state.flags.siRuleVisible && state.flags.siRuleShowOnRequest && state.flags.siRuleReturnOnExit && state.flags.siRuleAlarmAssembly && state.flags.siRuleBaseCloses);
    if (state.flags.siComplete) return;
    if (state.flags.siSigned && state.flags.siIssued && state.flags.siPassNoStated && rulesOk){
      state.flags.siComplete = true;
      updateChecklist();
      showPass();
      enqueueVisitor("Thank you.");
      updateHint();
    }
  }

function handleSI(intent, raw){
    showSignIn();
    const n = String(raw||"");

    if (intent==="ask_name" || intent==="ask_surname"){
      state.flags.nameAsked = true;
      if (si_name) si_name.value = state.visitor?.name || "";
      enqueueVisitor(`My name is ${state.visitor?.name || "—"}.`);
      updateHint();
      return;
    }

    // Allow asking remaining 5W/H details at the sign-in office (if not already asked at the gate)
    if (intent==="ask_company"){
      state.flags.companyAsked = true;
      state.facts.company = state.facts.company || generateCompany(state);
      if (si_company && !si_company.value) si_company.value = state.facts.company;
      enqueueVisitor(`I'm from ${state.facts.company}.`);
      updateHint();
      return;
    }
    if (intent==="ask_purpose" || intent==="purpose"){
      state.flags.purposeAsked = true;
      state.facts.purpose = state.facts.purpose || "known";
      const resp = phrase("gate","purpose",state, state.flags.forcedCoop ? "open":null);
      state.facts.purposeText = resp;
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="ask_who" || intent==="who_meeting"){
      state.flags.whoAsked = true;
      state.facts.who = state.facts.who || "known";
      const resp = phrase("gate","who_meeting",state, state.flags.forcedCoop ? "open":null);
      state.facts.whoText = resp;
      if (si_poc && !si_poc.value) si_poc.value = state.visitor?.contact?.full || "";
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="ask_time" || intent==="time_meeting"){
      state.flags.timeAsked = true;
      state.facts.time = state.facts.time || "known";
      const t = getMeetingTime(state);
      state.facts.meetingTime = t;
      if (si_time && !si_time.value) si_time.value = t;
      enqueueVisitor(`My appointment is at ${t}.`);
      updateHint();
      return;
    }
    if (intent==="ask_about" || intent==="about_meeting"){
      state.flags.aboutAsked = true;
      state.facts.about = state.facts.about || "known";
      const resp = phrase("gate","about_meeting",state, state.flags.forcedCoop ? "open":null);
      state.facts.aboutText = resp;
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="ask_where" || intent==="where_meeting"){
      state.flags.whereAsked = true;
      state.facts.location = state.facts.location || "known";
      const resp = `At reception, building ${state.facts.locationCode}.`;
      state.facts.whereText = `Gebouw ${state.facts.locationCode}`;
      if (si_loc && !si_loc.value) si_loc.value = `Building ${state.facts.locationCode}`;
      enqueueVisitor(resp);
      updateHint();
      return;
    }
    if (intent==="ask_appt" || intent==="has_appointment"){
      state.flags.apptAsked = true;
      enqueueVisitor(phrase("gate","has_appointment_yes",state));
      updateHint();
      return;
    }
    if (intent==="si_sign_in"){
      // Student initiates signing the register
      state.flags.siSigned = true;

      // Fill only what has been asked at sign-in (values are set when the student asks the questions).
      // For safety, if fields are still empty, we can at least insert known values (name / time / location).
      if (si_name && !si_name.value) si_name.value = state.visitor?.name || "";
      if (si_time && !si_time.value) si_time.value = getMeetingTime(state);
      if (si_loc && !si_loc.value) si_loc.value = state.facts.locationCode ? `Building ${state.facts.locationCode}` : (state.facts.location||"");

      // Animate signature inside the signature box
      if (sigBox){ sigBox.classList.remove("sigRun"); void sigBox.offsetWidth; sigBox.classList.add("sigRun"); }
      if (si_sig) si_sig.value = "signed";

      // Mark checklist immediately, then transition the UI to the base-rules screen after the signature animation starts.
      updateChecklist();
      enqueueVisitor("Okay.");

      // After the signature is drawn, switch to the rules overview (register form hides, rules appear).
      setTimeout(()=>{ try{ setSignInView("rules"); }catch(e){} }, 850);

      updateHint();
      return;
    }
    if (intent==="si_issue_pass"){
      state.flags.siIssued = true;
      // Keep the rules form visible; issuing is confirmed by the student's statement.
      showSignIn();

      // Student must *state* which pass is being issued (e.g., "I am issuing pass VP-1234")
      const pid = state?.pass?.id || "";
      const statedExact = pid && new RegExp("\\b"+pid.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+"\\b","i").test(n);
      const statedGeneric = /\b(pass|badge)\b/i.test(n) && /\b(VP-\d{4}|\d{3,6})\b/i.test(n);
      if (statedExact || statedGeneric) state.flags.siPassNoStated = true;

      updateChecklist();
      enqueueVisitor("Okay.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_pass_no"){
      state.flags.siPassNoStated = true;
      updateChecklist();
      enqueueVisitor("Understood.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_rule_visible"){
      state.flags.siRuleVisible = true;
      updateChecklist();
      enqueueVisitor("Okay. I will wear it visibly.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_rule_show"){
      state.flags.siRuleShowOnRequest = true;
      updateChecklist();
      enqueueVisitor("Understood. I will show it on request.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_rule_return"){
      state.flags.siRuleReturnOnExit = true;
      updateChecklist();
      enqueueVisitor("Okay. I'll return it when I leave.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_rule_alarm"){
      state.flags.siRuleAlarmAssembly = true;
      updateChecklist();
      enqueueVisitor("Okay. I will go to the assembly area if there is an alarm.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    if (intent==="si_rule_closes"){
      state.flags.siRuleBaseCloses = true;
      updateChecklist();
      enqueueVisitor("Okay.");
      maybeCompleteSignIn();
      updateHint();
      return;
    }
    miss("Sign-in: sign the register, issue the visitor pass, then explain the pass rules.");
  }

  function handleStudent(raw){
    const txt=String(raw||"").trim();
    if (!txt || !state) return;

    // Only English input is accepted for intent detection.
    if (isLikelyNonEnglish(txt)){
      addMsg("student", txt);
      enqueueVisitor("Please use English during this training.");
      return;
    }
    if (state.stage==="gate_approach"){
      // Allow immediate interaction; skip the approach timer so checklist can start right away
      try{ if (approach) clearTimeout(approach); }catch{}
      state.stage="gate_start";
      enqueueVisitor(phrase("shared","greeting",state));
      updateHint();
    }

    addMsg("student", txt);
    window.VEVA_LOG?.({type:"student", stage:state.stage, text:txt});

    const intent=detectIntent(txt);
    setDebug(`Intent: ${intent} · Stage: ${state.stage}`);

    if (intent==="deny"){ enqueueVisitor(phrase("shared","deny_why",state)); return; }

    // Force jump to the sign-in office when requested (training focus mode).
    if (intent==="go_sign_in"){
      // Mark earlier steps as missed (red crosses) but do not block the transition.
      // Also lock earlier phases so they cannot be fixed retroactively.
      try{ lockGateNow(); }catch(e){}
      try{ lockPSNow(); }catch(e){}
      state.flags.sentToPersonSearch = true;
      state.flags.sentToSignIn = true;
      state.flowName="Sign-in";
      state.stage="si_arrival";
      updateChecklist();
      showSignIn();
      enqueueVisitor("Okay. I will proceed to the sign-in office.");
      updateHint();
      return;
    }


    // --- Global identity / control questions (available in any stage) ---
    if (intent === "ask_name"){
      if (String(state.stage||"").startsWith("gate_")){
        state.flags.nameAsked = true;
        state.facts.name = "known";
        updateChecklist();
      }
      enqueueVisitor(`My name is ${state.visitor.first}.`);
      updateHint();
      return;
    }
    if (intent === "ask_surname"){
      if (String(state.stage||"").startsWith("gate_")){
        state.flags.nameAsked = true;
        state.facts.name = "known";
        updateChecklist();
      }
      enqueueVisitor(`My last name is ${state.visitor.last}.`);
      updateHint();
      return;
    }
    if (intent === "spell_last_name"){
      const letters = String(state.visitor.last || "")
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .split("");
      const spelled = letters.length ? letters.join("-") : String(state.visitor.last || "").toUpperCase();
      enqueueVisitor(spelled || `My surname is ${state.visitor.last}.`);
      updateHint();
      return;
    }
    if (intent === "ask_age" || intent === "confirm_age"){
      const dobStr = String(state.visitor.dob || "");
      const m = dobStr.match(/^(\d{2})\s+([A-Za-z]{3})\s+(\d{4})$/);
      const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
      let age = null;
      if (m){
        const d = parseInt(m[1], 10);
        const mon = months[m[2]];
        const y = parseInt(m[3], 10);
        if (mon !== undefined){
          const now = new Date();
          let a = now.getFullYear() - y;
          const bdThisYear = new Date(now.getFullYear(), mon, d);
          if (now < bdThisYear) a--;
          age = a;
        }
      }
      if (age === null){
        enqueueVisitor("I\'d rather not share that.");
        return;
      }

      if (intent === "ask_age"){
        enqueueVisitor(`I am ${age} years old.`);
        return;
      }

      const n = txt.match(/\b(\d{1,3})\b/);
      const said = n ? parseInt(n[1], 10) : null;
      if (said === null){
        enqueueVisitor(`I am ${age} years old.`);
        return;
      }
      if (said === age){
        enqueueVisitor("That\'s correct.");
        return;
      }
      enqueueVisitor(`Not quite. I am ${age} years old.`);
      return;
    }

    if (state.stage.startsWith("gate_")) return handleGate(intent, txt);
    if (state.stage.startsWith("ps_")) return handlePS(intent, txt);
    if (state.stage.startsWith("si_")) return handleSI(intent, txt);

    enqueueVisitor("Okay.");
  }

  textInput?.addEventListener("input", ()=>{
  if (!textInput) return;
  const hasText = !!textInput.value.trim();
  if (typingStudent !== hasText){
    typingStudent = hasText;
    if (hasText) typingVisitor = false;
    renderTyping();
  }
});

btnSend?.addEventListener("click", ()=>{
    const t=(textInput?.value||"").trim();
    if (textInput) textInput.value="";
    handleStudent(t);
  });
  textInput?.addEventListener("keydown",(e)=>{ if(e.key==="Enter") btnSend?.click(); });

  btnNewScenario?.addEventListener("click", ()=>{
    textInput.disabled=false; btnSend.disabled=false; holdToTalk.disabled=false;
    resetScenario();
  });
  btnPhrases?.addEventListener("click", ()=>{ window.open("VEVA_Checkpoint_Trainer_Woordenlijst_EN-NL.pdf","_blank","noopener"); });

  btnPersonSearch?.addEventListener("click", ()=> handleStudent("Go to person search"));
  btnSignIn?.addEventListener("click", ()=> handleStudent("Go to sign-in office"));
  btnEndScenario?.addEventListener("click", ()=> endScenarioNow("endScenario"));
  btnGoAppointment?.addEventListener("click", ()=> endScenarioNow("goAppointment"));
  btnCloseSummary?.addEventListener("click", ()=>{ if(summaryModal) summaryModal.hidden=true; });
  btnDeny?.addEventListener("click", ()=> enqueueVisitor(phrase("shared","deny_why",state)));

  btnReturnId?.addEventListener("click", ()=>{ if(state?.ui?.idVisible){ hideId(); enqueueVisitor(phrase("gate","return_id",state)); window.VEVA_LOG?.({type:"id", action:"returned_btn"}); } });

  btnSupervisorBack?.addEventListener("click", backToVisitor);
  btnSupervisorSend?.addEventListener("click", ()=>{
    const report={
      wie:(sv_wie?.value||"").trim(),
      wat:(sv_wat?.value||"").trim(),
      waar:(sv_waar?.value||"").trim(),
      wanneer:(sv_wanneer?.value||"").trim(),
      waarom:(sv_waarom?.value||"").trim(),
    };
    window.VEVA_LOG?.({type:"supervisor_report", stage:state.stage, report, visitor:{name:state.visitor.name,idNo:state.visitor.idNo}, student:session});
    addMsg("student","[Report sent to supervisor]","NL 5W/H logged");
    state.flags.reportedSupervisor = true;
    updateChecklist();
    backToVisitor();
    enqueueVisitor("Understood. Thank you.");
    updateHint();
  });

  // Live highlight: company is the common remaining field at sign-in
  si_company?.addEventListener("input", ()=>{
    const missing = !(si_company.value||"").trim();
    si_company.classList.toggle("missing", missing);
  });

  btnPassReturn?.addEventListener("click", ()=>{
    window.VEVA_LOG?.({type:"return_pass", action:"returned", pass:state.pass, visitor:state.visitor, student:session});
    enqueueVisitor("Thank you. Have a good day.");
    state.stage="ended";
    setDebug("Intent: — · Stage: ended");
  });

  // Speech recognition
  let recognition=null; let isRec=false;
  function voiceSupported(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
  async function ensureMic(){
    try{
      if(!navigator.mediaDevices?.getUserMedia) return true;
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      s.getTracks().forEach(t=>t.stop());
      return true;
    }catch{ return false; }
  }
  function setupSpeech(){
    if(!voiceSupported()){ setVoice("Voice: not supported"); if(holdToTalk){holdToTalk.disabled=true;holdToTalk.title="SpeechRecognition not supported.";} return; }
    const isLocal = location.hostname==="localhost"||location.hostname==="127.0.0.1";
    const ok = window.isSecureContext || location.protocol==="https:" || isLocal;
    if(!ok){ setVoice("Voice: use https/localhost"); if(holdToTalk){holdToTalk.disabled=true;holdToTalk.title="Voice needs https or localhost.";} return; }
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    recognition=new SR();
    recognition.lang="en-US";
    recognition.interimResults=true;
    recognition.continuous=false;

    recognition.onstart=()=>{ isRec=true; setVoice("Voice: listening…"); holdToTalk?.classList.add("listening"); };
    recognition.onresult=(e)=>{
      let finalText="", interim="";
      for(let i=e.resultIndex;i<e.results.length;i++){
        const r=e.results[i]; const chunk=r?.[0]?.transcript||"";
        if(r.isFinal) finalText+=chunk; else interim+=chunk;
      }
      const combined=String(finalText||interim||"").trim();
      if(combined && textInput) textInput.value=combined;
    };
    recognition.onerror=()=>{ isRec=false; holdToTalk?.classList.remove("listening"); setVoice("Voice: error"); };
    recognition.onend=()=>{
      isRec=false; holdToTalk?.classList.remove("listening"); setVoice("Voice: ready");
      if(VOICE_AUTOSEND){
        const toSend=(textInput?.value||"").trim();
        if(toSend){ handleStudent(toSend); if(textInput) textInput.value=""; }
      }
    };
  }
  async function startListen(){
    if(!recognition||isRec) return;
    const ok=await ensureMic(); if(!ok){ setVoice("Voice: blocked"); return; }
    try{ recognition.start(); }catch{}
  }
  function stopListen(){ if(!recognition||!isRec) return; try{ recognition.stop(); }catch{} }

  holdToTalk?.addEventListener("pointerdown",(e)=>{ e.preventDefault(); startListen(); });
  holdToTalk?.addEventListener("pointerup",(e)=>{ e.preventDefault(); stopListen(); });
  holdToTalk?.addEventListener("pointercancel", stopListen);
  holdToTalk?.addEventListener("pointerleave", stopListen);

  // TTS (visitor)
  let ttsReady=false;
  let cachedTTSVoice=null;

  // ===== Voice selector pill =====
  const voiceSelect = document.getElementById("voiceSelect");
  const voiceLang = document.getElementById("voiceLang");
  const voiceGender = document.getElementById("voiceGender");
  let voiceGenderPref = (localStorage.getItem("veva.voiceGender") || "male");
  let voiceLangPref = (localStorage.getItem("veva.voiceLang") || "en-GB");

  function isEnglish(v){ return /^en(-|_)/i.test(v.lang) || v.lang.toLowerCase()==="en"; }
  function isLang(v, lang){ return (v.lang||"").toLowerCase().startsWith((lang||"").toLowerCase()); }

  function nameLooksMale(name){
    return /male|daniel|george|arthur|fred|guy|alex|tom|matthew|brian|ryan/i.test(name||"");
  }
  function nameLooksFemale(name){
    return /female|susan|victoria|karen|samantha|emma|amelia|siri/i.test(name||"");
  }

  function chooseVoice(voices){
    const lang = voiceLangPref;
    const gender = voiceGenderPref;
    const pool = voices.filter(v => isEnglish(v) && isLang(v, lang));
    if (!pool.length) return null;

    if (gender === "male"){
      return pool.find(v => nameLooksMale(v.name)) || pool[0];
    } else {
      return pool.find(v => nameLooksFemale(v.name)) || pool[0];
    }
  }

  function populateVoiceSelect(){
    if(!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];

    // set UI values
    if (voiceLang){
      if (![...voiceLang.options].some(o=>o.value===voiceLangPref)) voiceLangPref = "en-GB";
      voiceLang.value = voiceLangPref;
    }
    if (voiceGender){
      voiceGender.textContent = (voiceGenderPref === "female") ? "Female" : "Male";
    }

    // detail dropdown (exact voice)
    if (voiceSelect){
      voiceSelect.innerHTML = "";
      const en = voices.filter(isEnglish);
      en.forEach(v=>{
        const opt=document.createElement("option");
        opt.value=v.name;
        opt.textContent=`${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
      });
    }

    const chosen = chooseVoice(voices);
    if (chosen){
      cachedTTSVoice = chosen;
      if (voiceSelect) voiceSelect.value = chosen.name;
    }
  }

  if ("speechSynthesis" in window){
    window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
    setTimeout(populateVoiceSelect, 250);
  }

  voiceLang?.addEventListener("change", ()=>{
    voiceLangPref = voiceLang.value;
    localStorage.setItem("veva.voiceLang", voiceLangPref);
    populateVoiceSelect();
  });

  voiceGender?.addEventListener("click", ()=>{
    voiceGenderPref = (voiceGenderPref === "male") ? "female" : "male";
    localStorage.setItem("veva.voiceGender", voiceGenderPref);
    populateVoiceSelect();
  });

  voiceSelect?.addEventListener("change", ()=>{
    const voices = window.speechSynthesis.getVoices() || [];
    const chosen = voices.find(v=>v.name===voiceSelect.value);
    if(chosen){
      cachedTTSVoice = chosen;
    }
  });

  function refreshVoices(){
    try{ cachedTTSVoice = pickVoice(); }catch{}
  }
  function primeTTS(){
    try{
      if(!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(" ");
      u.volume=0; u.lang="en-GB";
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
      ttsReady=true;
      try{ window.speechSynthesis.onvoiceschanged = refreshVoices; refreshVoices(); }catch{};
    }catch{}
  }
  function pickVoice(){
    try{
      const vs=window.speechSynthesis?.getVoices?.()||[];
      const pref=vs.find(v=>/en/i.test(v.lang) && /male|daniel|george|arthur|fred|guy/i.test(v.name));
      return pref || vs.find(v=>/en/i.test(v.lang)) || null;
    }catch{ return null; }
  }
  function speakVisitor(text){
    try{
      if(!ttsReady) return;
      if(!("speechSynthesis" in window)) return;
      const t=String(text||"").trim(); if(!t) return;
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(t);
      const v = cachedTTSVoice || pickVoice();
      if(!v){
        // No English voice available → don't speak with Dutch default voice
        return;
      }
      u.voice = v;
      u.lang = v.lang || "en-US";
      u.rate=1.0; u.pitch=0.75; u.volume=1.0;
      window.speechSynthesis.speak(u);
    }catch{}
  }

  // login
  function tryStart(){
    const surname=(studentSurnameInput?.value||"").trim();
    const group=studentGroupSel?.value;
    const difficulty=studentDifficultySel?.value||"standard";
    if(!surname||!group){ if(loginError) loginError.style.display="block"; return; }
    if(loginError) loginError.style.display="none";
    session={surname,group,difficulty}; saveStudent(session); updateStudentPill();
    loginModal.hidden=true;
      checklistPanel?.classList.add("isCollapsed");
      if (btnChecklistCollapse) btnChecklistCollapse.textContent = "▸";
      document.body.classList.remove("prestart");
      if (checklistPanel) checklistPanel.hidden=false;
    primeTTS();
    resetScenario();
    textInput?.focus();
  }
  btnStartTraining?.addEventListener("click", tryStart);
  studentSurnameInput?.addEventListener("keydown",(e)=>{ if(e.key==="Enter") tryStart(); });


// Checklist collapse (UI)
const btnChecklistCollapse = $("#btnChecklistCollapse");
btnChecklistCollapse?.addEventListener("click", ()=>{
  const panel = document.getElementById("checklistPanel");
  if (!panel) return;
  const isCollapsed = panel.classList.toggle("isCollapsed");
  // When collapsed we show an expand arrow
  btnChecklistCollapse.textContent = isCollapsed ? "▸" : "◂";
  btnChecklistCollapse.setAttribute("aria-label", isCollapsed ? "Expand checklist" : "Collapse checklist");
});

  // boot
  const pre=loadStudent();
  if(pre && typeof pre==="object"){
    if(pre.surname) studentSurnameInput.value=pre.surname;
    if(pre.group) studentGroupSel.value=pre.group;
    if(pre.difficulty) studentDifficultySel.value=pre.difficulty;
    session={...session,...pre};
  }
  updateStudentPill();

  // notes pad (left sidebar)
  if (notesPad){
    notesPad.value = loadNotes();
    notesPad.addEventListener("input", ()=> saveNotes(notesPad.value));
  }

  setupSpeech();
  loginModal.hidden=false;

  // initial dummy
  state={flowName:"Gate", stage:"idle", visitor:{...makeRandomVisitor(), contact:makeContact(), illegalItem: pick([null,null,null,null,"a small pocket knife","a needle","a razor blade"] )}, facts:{}, flags:{}, ui:{idVisible:false,supervisorVisible:false}, misses:0, visitorDeclaredAppt:null};
  if(portraitPhoto) portraitPhoto.src=state.visitor.photoSrc||TRANSPARENT_PX;
  if(supervisorPhoto) supervisorPhoto.src=supervisorAvatar.src||soldierAvatar.src;
  hideAllPanels();
  if (checklistPanel) checklistPanel.hidden=true;
  renderChat();
updateChecklist();
})();