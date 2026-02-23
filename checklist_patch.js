// checklist_patch.js - checklist UI for VEVA trainer
(() => {
  "use strict";
  const $ = (s)=>document.querySelector(s);
  const panel = $("#checklistPanel");
  const itemsEl = $("#checklistItems");
  const statusEl = $("#checklistStatus");
  const toggleBtn = $("#btnChecklistToggle");

  if (!panel || !itemsEl || !statusEl || !toggleBtn) return;

  const CK = {
    collapsed: false,
    items: [
      {id:"5wh", text:"Ask 5W/H questions (Who/What/When/Where/Why/How).", labels:["5W/H"], done:false},
      {id:"id", text:"Ask for ID + ask at least one control question.", labels:["ID"], done:false},
      {id:"supervisor", text:"Report to supervisor (Dutch summary).", labels:["NL report"], done:false},
      {id:"search", text:"Use Person Search when needed.", labels:["Search"], done:false},
      {id:"rules", text:"Explain rules: no drugs/alcohol/weapons + frisking.", labels:["Rules"], done:false},
    ]
  };

  function applyChecklistLabels(item){
    const wrap = document.createElement("div");
    wrap.className = "ckLbl";
    (item.labels||[]).forEach(t=>{
      const sp=document.createElement("span");
      sp.textContent=t;
      wrap.appendChild(sp);
    });
    return wrap;
  }
  // Provide global function to avoid "applyChecklistLabels is not defined" in older patches.
  window.applyChecklistLabels = window.applyChecklistLabels || applyChecklistLabels;

  function render(){
    itemsEl.innerHTML = "";
    let done = 0;
    for (const it of CK.items){
      const row = document.createElement("div");
      row.className = "ckItem"+(it.done?" done":"");
      const dot = document.createElement("div");
      dot.className = "ckDot";
      dot.textContent = it.done ? "✓" : "";
      const txt = document.createElement("div");
      txt.className = "ckTxt";
      txt.textContent = it.text;
      row.appendChild(dot);
      row.appendChild(txt);
      row.appendChild(applyChecklistLabels(it));
      itemsEl.appendChild(row);
      if (it.done) done++;
    }
    statusEl.textContent = done + "/" + CK.items.length;
  }

  function setDone(id, v=true){
    const it = CK.items.find(x=>x.id===id);
    if (!it) return;
    it.done = !!v;
    render();
  }

  // Public API for app.js
  window.VEVA_CHECKLIST = {
    setDone,
    reset: ()=>{ CK.items.forEach(i=>i.done=false); render(); },
    render
  };

  toggleBtn.addEventListener("click", ()=>{
    CK.collapsed = !CK.collapsed;
    panel.classList.toggle("collapsed", CK.collapsed);
  });

  render();
})();