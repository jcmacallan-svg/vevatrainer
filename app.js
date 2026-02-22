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
  const btnNewScenario = $("#btnNewScenario");
  const btnReset = $("#btnReset");

  // Input
  const textInput = $("#textInput");
  const btnSend = $("#btnSend");
  const holdToTalk = $("#holdToTalk");

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

  const personSearchPanel = $("#personSearchPanel");
  const psOutfit = $("#psOutfit");
  const psCards = $("#psCards");
  const psRiskChip = $("#psRiskChip");

  const signInPanel = $("#signInPanel");
  const si_name = $("#si_name");
  const si_company = $("#si_company");
  const si_poc = $("#si_poc");
  const si_time = $("#si_time");
  const si_loc = $("#si_loc");
  const si_sig = $("#si_sig");
  const btnSignInIssue = $("#btnSignInIssue");

  const passPanel = $("#passPanel");
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
    gate_rules: $("#cl_gate_rules"),
    gate_send_ps: $("#cl_gate_send_ps"),
    ps_started: $("#cl_ps_started"),
    ps_position: $("#cl_ps_position"),
    ps_resolved: $("#cl_ps_resolved"),
    si_issued: $("#cl_si_issued"),
    si_rules: $("#cl_si_rules"),
    si_close: $("#cl_si_close"),
  };

  // Login
  const loginModal = $("#loginModal");
  const studentSurnameInput = $("#studentSurname");
  const studentGroupSel = $("#studentGroup");
  const studentDifficultySel = $("#studentDifficulty");
  const btnStartTraining = $("#btnStartTraining");
  const loginError = $("#loginError");

  const TRANSPARENT_PX = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

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
  let session = { surname:"", group:"", difficulty:"standard" };
  function loadStudent(){ try{ return JSON.parse(localStorage.getItem(STUDENT_KEY)||"null"); }catch{ return null; } }
  function saveStudent(v){ try{ localStorage.setItem(STUDENT_KEY, JSON.stringify(v)); }catch{} }
  function updateStudentPill(){
    if (!studentPill) return;
    if (!session.surname || !session.group){ studentPill.textContent = "Student: —"; return; }
    const cap = (s)=>(s||"").charAt(0).toUpperCase()+(s||"").slice(1);
    studentPill.textContent = `Student: ${session.surname} | Group: ${session.group} | ${cap(session.difficulty)}`;
  }

  const pad2 = (n)=>String(n).padStart(2,"0");
  const pick = (arr)=> (Array.isArray(arr)&&arr.length) ? arr[Math.floor(Math.random()*arr.length)] : "";
  const randInt = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

  function normalize(s){
    return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}: ]/gu," ").replace(/\s+/g," ").trim();
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
    // Priority disambiguation for 5W appointment questions
    if (/\b(with\s+who(m)?|appointment\s+with|who\s+are\s+you\s+(meeting|seeing))\b/i.test(n)) return "who_meeting";
    if ((/\bwhat\s+time\b/i.test(n) || /\bwhen\b/i.test(n)) && /\b(appointment|meeting)\b/i.test(n)) return "time_meeting";
    if (/\bwhat\b/i.test(n) && /\b(appointment|meeting)\b/i.test(n) && /\babout\b/i.test(n)) return "about_meeting";
    const list = Array.isArray(window.VEVA_INTENTS) ? window.VEVA_INTENTS : [];
    for (const it of list){ try{ if (it?.rx?.test(raw)) return it.key; }catch{} }
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
    const t=String(text||"").trim(); if(!t) return;
    q.push(t); drain();
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
  }

  function showId(){
    if (!idCardWrap) return;
    if (idScenario) idScenario.textContent = state.flowName || "Gate";
    if (idLevel) idLevel.textContent = String(session.difficulty||"standard").toUpperCase();
    if (idName) idName.textContent=state.visitor.name;
    if (idSurname) idSurname.textContent=state.visitor.last;
    if (idDob) idDob.textContent=state.visitor.dob;
    if (idNat) idNat.textContent=state.visitor.nat;
    if (idNo) idNo.textContent=state.visitor.idNo;
    if (idPhoto) idPhoto.src=state.visitor.photoSrc||TRANSPARENT_PX;
    if (idBarcode) idBarcode.textContent=`VEVA|${state.visitor.idNo}|${state.visitor.dob}|${state.visitor.nat}`;
    hideAllPanels();
    idCardWrap.hidden=false;
    state.ui.idVisible=true;
    updateHint();
  }
  function hideId(){
    if (!idCardWrap) return;
    idCardWrap.hidden=true; state.ui.idVisible=false; updateHint();
  }

  function showSupervisor(){
    hideAllPanels();
    // Always start empty: student must fill everything themselves.
    for (const el of [sv_wie, sv_wat, sv_waar, sv_wanneer, sv_waarom]){ if (el) el.value = ""; }
    if (sv_note) sv_note.textContent = "";
    supervisorPanel.hidden=false;
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
    if (state.stage.startsWith("ps_")) showPersonSearch();
    else if (state.stage.startsWith("si_")) showSignIn();
    else if (state.ui.idVisible) idCardWrap.hidden=false;
    else hideAllPanels();
    updateHint();
  }

  function showPersonSearch(){
    hideAllPanels();
    personSearchPanel.hidden=false;
    if (panelTitle) panelTitle.textContent="Person Search";
    if (panelSub) panelSub.textContent="Search procedure";
    renderPS();
    updateHint();
  }
  function showSignIn(){
    hideAllPanels();
    signInPanel.hidden=false;
    if (panelTitle) panelTitle.textContent="Sign-in";
    if (panelSub) panelSub.textContent="Register + pass";
    if (si_name) si_name.value=state.visitor.name;
    if (si_poc) si_poc.value=state.visitor.contact.full;
    if (si_time) si_time.value=state.facts.meetingTime||"";
    updateHint();
  }
  function showPass(){
    hideAllPanels();
    passPanel.hidden=false;
    if (panelTitle) panelTitle.textContent="Sign-in";
    if (panelSub) panelSub.textContent="Visitor pass issued";
    state.pass = state.pass || {};
    state.pass.id = state.pass.id || ("VP-"+randInt(1000,9999));
    state.pass.until = state.pass.until || "16:00";
    if (passNo) passNo.textContent="PASS: "+state.pass.id;
    if (passName) passName.textContent=state.visitor.name;
    if (passUntil) passUntil.textContent=state.pass.until;
    updateHint();
  }

  function renderPS(){
    const ps = state.ps; if (!ps) return;
    if (psRiskChip) psRiskChip.textContent="RISK: "+(ps.hasIllegal ? "POSSIBLE CONTRABAND" : "LOW");
    if (psOutfit){
      const o=ps.outfit;
      const parts=[o.style==="workwear"?"Workwear":"Casual", o.cap?"cap":"no cap", o.jacket?"jacket":"no jacket", o.bag?"bag":"no bag"];
      psOutfit.textContent="Outfit: "+parts.join(" · ");
    }
    if (psCards){
      psCards.innerHTML="";
      for (const it of ps.items){
        const c=document.createElement("div");
        c.className="itemCard";
        c.innerHTML=`<div class="t">${it.name}</div><div class="s">${it.where}${it.kind==="illegal" ? " · ⚠︎" : ""}</div>`;
        psCards.appendChild(c);
      }
    }
  }

  // Hints
  function shouldHints(){ return (session.difficulty||"standard")!=="advanced"; }
  function setHint(t){ if (hintBandText) hintBandText.textContent=t||""; }
  function hideHint(){ if (!hintBand) return; hintBand.hidden=true; hintBand.style.display="none"; }
  function showHint(t){ if (!hintBand) return; hintBand.hidden=false; hintBand.style.display=""; setHint(t); }
  const PRESS_HINT_TEXT='Press for an answer: "I need an answer to that question, otherwise entry will be denied."';
  function updateHint(){
    if (!hintBand) return;
    if (!shouldHints() || state.ui.supervisorVisible){ hideHint(); return; }
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
        <label class="clItem" id="cl_gate_rules"><input type="checkbox" disabled> <span>Rules explained</span></label>
        <label class="clItem" id="cl_gate_send_ps"><input type="checkbox" disabled> <span>Sent to person search</span></label>
      </div>`;
    // rebind references if cache delivered old HTML
    checklistEls.gate_name = $("#cl_gate_name"); checklistEls.gate_purpose=$("#cl_gate_purpose"); checklistEls.gate_appt=$("#cl_gate_appt");
    checklistEls.gate_who=$("#cl_gate_who"); checklistEls.gate_time=$("#cl_gate_time"); checklistEls.gate_about=$("#cl_gate_about"); checklistEls.gate_where=$("#cl_gate_where");
    checklistEls.gate_id=$("#cl_gate_id"); checklistEls.gate_supervisor=$("#cl_gate_supervisor"); checklistEls.gate_rules=$("#cl_gate_rules"); checklistEls.gate_send_ps=$("#cl_gate_send_ps");
  }

  function setChecklistDone(el, done){
    if (!el) return;
    el.classList.toggle("done", !!done);
  }

  function updateChecklist(){
    ensureChecklistMarkup();
    if (!state) return;
    const f = state.facts || {};
    const fl = state.flags || {};

    setChecklistDone(checklistEls.gate_name, !!f.name);
    setChecklistDone(checklistEls.gate_purpose, !!f.purpose);
    setChecklistDone(checklistEls.gate_appt, !!f.appt);
    setChecklistDone(checklistEls.gate_who, !!f.who);
    setChecklistDone(checklistEls.gate_time, !!f.time);
    setChecklistDone(checklistEls.gate_about, !!f.about);
    setChecklistDone(checklistEls.gate_where, !!f.location);
    setChecklistDone(checklistEls.gate_id, !!fl.idChecked);
    setChecklistDone(checklistEls.gate_supervisor, !!fl.reportedSupervisor);
    setChecklistDone(checklistEls.gate_rules, !!fl.rulesDone);
    setChecklistDone(checklistEls.gate_send_ps, !!fl.sentToPersonSearch);

    setChecklistDone(checklistEls.ps_started, !!fl.psStarted);
    setChecklistDone(checklistEls.ps_position, !!fl.psPositioned);
    setChecklistDone(checklistEls.ps_resolved, !!fl.psResolved);

    setChecklistDone(checklistEls.si_issued, !!fl.siIssued);
    // not implemented separately yet — best effort:
    setChecklistDone(checklistEls.si_rules, !!fl.siIssued);
    setChecklistDone(checklistEls.si_close, state.stage === "done");
  }
  function nextHint(){
    if (state.stage.startsWith("gate_")){
      const f=state.facts;
      if (!f.name) return 'Ask: “Who are you?”';
      if (!f.purpose) return 'Ask: “What are you doing here?”';
      if (!f.appt) return 'Ask: “Do you have an appointment?”';
      if (!f.who) return 'Ask: “With whom do you have an appointment?”';
      if (!f.time) return 'Ask: “What time is the appointment?”';
      if (!f.about) return 'Ask: “What is the appointment about?”';
      if (!f.location) return 'Ask: “Where is the appointment?”';
      if (!state.flags.idChecked) return 'Ask: “Can I see your ID, please?”';
      if (!state.flags.reportedSupervisor) return 'Say: “I will contact my supervisor.”';
      if (!state.flags.rulesDone) return "Explain: no drugs, alcohol or weapons. Everyone is searched.";
      if (!state.flags.sentToPersonSearch) return "Say: proceed to person search.";
      return "Continue the procedure.";
    }
    if (state.stage.startsWith("ps_")){
      if (!state.flags.psStarted) return "Tell them: Empty your pockets and place items on the table.";
      if (!state.flags.psPositioned) return "Give instructions: arms out, palms up, legs apart.";
      if (state.ps?.hasIllegal && !state.flags.psResolved) return "If you find something: ask them to take it out.";
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
      facts:{ name:"", purpose:"", appt:"yes", who:"", time:"", about:"", location:"", meetingTime:"", locationCode:"" },
      flags:{ idChecked:false, reportedSupervisor:false, rulesDone:false, sentToPersonSearch:false, psStarted:false, psPositioned:false, psResolved:false, siIssued:false },
      ui:{ idVisible:false, supervisorVisible:false },
      ps:null, pass:null,
      evasiveFor: pick(["purpose","who_meeting","about_meeting","where_meeting","time_meeting"])
    };

    history=[]; renderChat();
    hideAllPanels();

    if (portraitPhoto) portraitPhoto.src = v.photoSrc || TRANSPARENT_PX;
    if (portraitMood) portraitMood.textContent = `A visitor walks up to the gate. ${currentMood.line}`;
    if (portraitDesc) portraitDesc.textContent = "";

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
    return !!(f.name && f.purpose && f.who && f.time && f.about && f.location && state.flags.idChecked && state.flags.reportedSupervisor && state.flags.rulesDone);
  }

  function enterPersonSearch(){
    state.flowName="Person Search";
    state.stage="ps_arrival";
    const V=window.VEVA_PS_VISUALS;
    const outfit=V?.makeOutfit?V.makeOutfit():{cap:false,jacket:false,bag:false,style:"casual"};
    const itemsObj=V?.makeItems?V.makeItems():{items:[],hasIllegal:false};
    state.ps={outfit, items:itemsObj.items, hasIllegal:itemsObj.hasIllegal};
    if (portraitMood) portraitMood.textContent="Person Search";
    if (portraitDesc) portraitDesc.textContent="Give clear instructions. If you find something, ask them to take it out.";
    showPersonSearch();
    enqueueVisitor(pick(window.VEVA_PHRASES?.person_search?.arrival || ["You arrive at the person search area."]));
    updateHint();
  }

  function handleGate(intent, raw){
    if (state.stage==="gate_start"){
      if (intent==="greet"){ state.stage="gate_help"; enqueueVisitor(phrase("shared","need_help",state)); updateHint(); return; }
      miss("Try greeting first."); return;
    }
    if (state.stage==="gate_help"){
      if (intent==="help_open"){ state.stage="gate_5wh"; enqueueVisitor("I have an appointment on base."); state.facts.purpose="known"; updateHint(); return; }
      miss('Try: “How can I help you?”'); return;
    }

    if (intent==="ask_name"){ state.facts.name=state.visitor.name; enqueueVisitor(`My name is ${state.visitor.first} ${state.visitor.last}.`); updateHint(); return; }
    if (intent==="ask_surname"){ enqueueVisitor(`My surname is ${state.visitor.last}.`); updateHint(); return; }
    if (intent==="purpose"){
      state.facts.purpose="known";
      if (state.evasiveFor==="purpose" && bandFromMood()==="evasive" && !state.flags.forcedCoop){
        enqueueVisitor("It’s personal."); showHint(PRESS_HINT_TEXT); return;
      }
      enqueueVisitor(phrase("gate","purpose",state, state.flags.forcedCoop ? "open":null));
      updateHint(); return;
    }
    if (intent==="has_appointment"){ state.facts.appt="yes"; enqueueVisitor(phrase("gate","has_appointment_yes",state)); updateHint(); return; }

    if (intent==="who_meeting"){
      state.facts.who="known";
      if (state.evasiveFor==="who_meeting" && bandFromMood()==="evasive" && !state.flags.forcedCoop && !state.flags.evasiveUsed){
        state.flags.evasiveUsed=true;
        enqueueVisitor("Someone inside."); showHint(PRESS_HINT_TEXT); return;
      }
      enqueueVisitor(phrase("gate","who_meeting",state, state.flags.forcedCoop ? "open":null));
      updateHint();
      return;
    }
    if (intent==="time_meeting"){ state.facts.time="known"; enqueueVisitor(`My appointment is at ${getMeetingTime(state)}.`); updateHint(); return; }
    if (intent==="about_meeting"){ state.facts.about="known"; enqueueVisitor(phrase("gate","about_meeting",state, state.flags.forcedCoop ? "open":null)); updateHint(); return; }
    if (intent==="where_meeting"){ state.facts.location="known"; enqueueVisitor(`At reception, building ${state.facts.locationCode}.`); updateHint(); return; }

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

    if (intent==="rules_contraband" || intent==="search_announce"){ state.flags.rulesDone=true; enqueueVisitor("Understood."); updateHint(); return; }

    if (intent==="press_for_answer"){
      state.flags.forcedCoop=true;
      enqueueVisitor("Understood. I will answer your questions.");
      showHint(PRESS_HINT_TEXT);
      updateHint();
      return;
    }

    if (intent==="go_person_search"){
      if (!gateComplete()){ miss("Complete the 5W/H, check ID, contact supervisor, and explain rules."); return; }
      state.flags.sentToPersonSearch=true;
      enqueueVisitor("Okay.");
      enqueueVisitor("The visitor follows your colleague to the person search.");
      enterPersonSearch();
      return;
    }

    miss("Try a 5W question, ask for ID, or contact your supervisor.");
  }

  function handlePS(intent){
    showPersonSearch();
    if (intent==="ps_any_sharp"){ enqueueVisitor(pick(window.VEVA_PHRASES.person_search.sharp_q)); return; }
    if (intent==="ps_empty_pockets"){ state.flags.psStarted=true; enqueueVisitor(pick(window.VEVA_PHRASES.person_search.pockets_ack)); window.VEVA_LOG?.({type:"ps", action:"pockets", items:state.ps.items, hasIllegal:state.ps.hasIllegal}); updateHint(); return; }
    if (intent==="ps_remove_cap"){
      if (state.ps.outfit.cap){ state.ps.outfit.cap=false; renderPS(); enqueueVisitor(pick(window.VEVA_PHRASES.person_search.cap_ack)); return; }
      enqueueVisitor("He is not wearing a cap."); return;
    }
    if (intent==="ps_remove_jacket"){
      if (state.ps.outfit.jacket){ state.ps.outfit.jacket=false; renderPS(); enqueueVisitor(pick(window.VEVA_PHRASES.person_search.jacket_ack)); return; }
      enqueueVisitor("He is not wearing a jacket."); return;
    }
    if (intent==="ps_position_arms" || intent==="ps_position_legs" || intent==="ps_search_areas" || intent==="ps_leg_on_knee"){
      state.flags.psPositioned=true; enqueueVisitor("Okay."); updateHint(); return;
    }
    if (intent==="ps_found_something"){
      if (state.ps.hasIllegal){ state.flags.psResolved=true; enqueueVisitor(pick(window.VEVA_PHRASES.person_search.found_reply)); enqueueVisitor("That item is not allowed on base. Entry is denied."); window.VEVA_LOG?.({type:"ps", action:"contraband_found", items:state.ps.items}); updateHint(); return; }
      enqueueVisitor("There is nothing else in the pockets."); updateHint(); return;
    }
    if (intent==="ps_clear" || intent==="go_sign_in"){
      state.flowName="Sign-in"; state.stage="si_arrival";
      showSignIn();
      enqueueVisitor("Okay. Please proceed to sign-in.");
      updateHint();
      return;
    }
    miss("Give clear instructions: empty pockets, remove cap/jacket, and positioning.");
  }

  function handleSI(){
    showSignIn();
    miss("Fill in the register on the right, then issue the visitor pass.");
  }

  function handleStudent(raw){
    const txt=String(raw||"").trim();
    if (!txt || !state) return;
    if (state.stage==="gate_approach") return;

    addMsg("student", txt);
    window.VEVA_LOG?.({type:"student", stage:state.stage, text:txt});

    const intent=detectIntent(txt);
    setDebug(`Intent: ${intent} · Stage: ${state.stage}`);

    if (intent==="deny"){ enqueueVisitor(phrase("shared","deny_why",state)); return; }

    // --- Global identity / control questions (available in any gate stage) ---
    if (intent === "ask_name"){
      state.facts.name = true;
      enqueueVisitor(`My name is ${state.visitor.first}.`);
      return;
    }
    if (intent === "ask_surname"){
      state.facts.surname = true;
      enqueueVisitor(`My last name is ${state.visitor.last}.`);
      return;
    }
    if (intent === "spell_last_name"){
      const letters = String(state.visitor.last || "")
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .split("");
      const spelled = letters.length ? letters.join("-") : String(state.visitor.last || "").toUpperCase();
      enqueueVisitor(spelled || `My surname is ${state.visitor.last}.`);
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
    if (state.stage.startsWith("ps_")) return handlePS(intent);
    if (state.stage.startsWith("si_")) return handleSI(intent);

    enqueueVisitor("Okay.");
  }

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
  btnReset?.addEventListener("click", ()=>{ loginModal.hidden=false; history=[]; renderChat(); hideAllPanels(); if(textInput) textInput.value=""; });

  btnPersonSearch?.addEventListener("click", ()=> handleStudent("Go to person search"));
  btnSignIn?.addEventListener("click", ()=> handleStudent("Go to sign-in office"));
  btnDeny?.addEventListener("click", ()=> enqueueVisitor(phrase("shared","deny_why",state)));
  btnReturn?.addEventListener("click", ()=> enqueueVisitor("Return (placeholder)."));

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
    backToVisitor();
    enqueueVisitor("Understood. Thank you.");
    updateHint();
  });

  btnSignInIssue?.addEventListener("click", ()=>{
    const entry={
      name:(si_name?.value||state.visitor.name).trim(),
      company:(si_company?.value||"").trim(),
      poc:(si_poc?.value||state.visitor.contact.full).trim(),
      time:(si_time?.value||state.facts.meetingTime||"").trim(),
      location:(si_loc?.value||state.facts.location||"").trim(),
      signature:(si_sig?.value||"").trim(),
    };
    if(!entry.signature){ miss("Ask the visitor to sign (type name) before issuing the pass."); return; }
    state.flags.siIssued=true;
    window.VEVA_LOG?.({type:"sign_in", action:"issue_pass", entry, visitor:state.visitor, student:session});
    showPass();
    enqueueVisitor("Here is your visitor pass. Please wear it visibly at all times.");
    updateHint();
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
  function primeTTS(){
    try{
      if(!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(" ");
      u.volume=0; u.lang="en-GB";
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
      ttsReady=true;
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
      const v=pickVoice(); if(v) u.voice=v;
      u.lang=v?.lang||"en-GB"; u.rate=1.0; u.pitch=0.75; u.volume=1.0;
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
    primeTTS();
    resetScenario();
    textInput?.focus();
  }
  btnStartTraining?.addEventListener("click", tryStart);
  studentSurnameInput?.addEventListener("keydown",(e)=>{ if(e.key==="Enter") tryStart(); });

  // boot
  const pre=loadStudent();
  if(pre && typeof pre==="object"){
    if(pre.surname) studentSurnameInput.value=pre.surname;
    if(pre.group) studentGroupSel.value=pre.group;
    if(pre.difficulty) studentDifficultySel.value=pre.difficulty;
    session={...session,...pre};
  }
  updateStudentPill();
  setupSpeech();
  loginModal.hidden=false;

  // initial dummy
  state={flowName:"Gate", stage:"idle", visitor:{...makeRandomVisitor(), contact:makeContact()}, facts:{}, flags:{}, ui:{idVisible:false,supervisorVisible:false}, misses:0};
  if(portraitPhoto) portraitPhoto.src=state.visitor.photoSrc||TRANSPARENT_PX;
  if(supervisorPhoto) supervisorPhoto.src=supervisorAvatar.src||soldierAvatar.src;
  hideAllPanels();
  renderChat();
updateChecklist();
})();