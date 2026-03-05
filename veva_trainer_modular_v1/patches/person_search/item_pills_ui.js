// patches/person_search/item_pills_ui.js
(function(){
  "use strict";

  // Pills UI for Person Search items.
  // - Shows clickable "pills" for each item (max 6)
  // - Hover reveals actions: What is it? Take out (if in pocket/bag) / Put on table
  // - Clicking an action asks the visitor (adds a student message) and the visitor responds.
  // - The pill shows where the item was found / taken from (and updates to "table" if placed on table).
  //
  // This intentionally avoids images/canvas. It is robust even when the DOM around Person Search changes.

  // ---------- helpers ----------
  function $(sel, root){ return (root||document).querySelector(sel); }
  function el(tag, cls){ var d=document.createElement(tag); if(cls) d.className=cls; return d; }
  function norm(s){ return String(s||"").trim(); }

  function injectStyle(){
    if (document.getElementById("psItemPillsStyle")) return;
    var s = document.createElement("style");
    s.id = "psItemPillsStyle";
    s.textContent = "\
/* Hide tabletop/canvas UI if present */\
#psTableThumbWrap,.psTableThumbWrap,#psTableModal,#vevaTabletopBackdrop{display:none !important;}\
/* Pills container */\
.psItemPillsWrap{margin:10px auto 6px; max-width:760px;}\
.psItemPillsTitle{color:rgba(255,255,255,0.88); font-size:12px; letter-spacing:0.2px; margin:6px 2px 8px;}\
.psItemPills{display:flex; flex-wrap:wrap; gap:10px;}\
.psPill{position:relative; display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.04); color:#fff; user-select:none;}\
.psPill:hover{background:rgba(255,255,255,0.07);}\
.psPill[data-state='unknown']{cursor:default;}\
.psPill[data-state='known']{cursor:default;}\
.psPill .meta{font-size:12px; opacity:0.85; padding:2px 8px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.25);}\
.psPill[data-meta=''] .meta{display:none;}\
/* Popover */\
.psPopover{position:absolute; top:calc(100% + 8px); left:0; min-width:260px; z-index:60; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background:rgba(18,23,36,0.96); box-shadow:0 18px 45px rgba(0,0,0,0.55); display:none;}\
.psPill:hover .psPopover{display:block;}\
.psPopover .title{font-weight:700; font-size:13px; margin-bottom:8px; color:#fff;}\
.psPopover .desc{font-size:12px; opacity:0.85; margin-bottom:10px; line-height:1.35;}\
.psPopover .btnRow{display:flex; flex-wrap:wrap; gap:8px;}\
.psPopover button{padding:7px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); color:#fff; cursor:pointer;}\
.psPopover button:hover{background:rgba(255,255,255,0.10);}\
.psPopover button:active{transform:translateY(1px);}\
";
    document.head.appendChild(s);
  }

  // Try to read Person Search items from state.ps.items (preferred) or from the text line as fallback.
  function getPSItems(){
    var st = window.state && window.state.ps ? window.state.ps : null;
    if (st && Array.isArray(st.items) && st.items.length){
      // keep max 6, filter invalid twelve gun
      return st.items
        .filter(function(it){ return it && it.name && !(/twelve\s*gun/i).test(String(it.name)); })
        .slice(0,6)
        .map(function(it, idx){
          return {
            id: String(it.name).toLowerCase().replace(/\s+/g,"_") + "_" + idx,
            name: norm(it.name),
            // original "where" in visuals: right pocket / bag / waistband / wallet etc.
            where: norm(it.where || ""),
            kind: norm(it.kind || ""),
            foundAt: norm(it.foundAt || it.where || ""),
            // state for UI display only
            state: norm(it.uiState || (it.foundAt ? "known" : "unknown")) || "unknown"
          };
        });
    }

    // Fallback parse from psOutfit line
    var panel = document.getElementById("personSearchPanel");
    var root = panel || document;
    var outfit = root.querySelector("#psOutfit") || root.querySelector(".psOutfit");
    if (!outfit) return [];
    var txt = (outfit.textContent || "").replace(/\s+/g," ").trim();
    var m = txt.match(/You see the following items on the table:\s*([^\.]+)\.?/i);
    if (!m) return [];
    var raw = m[1].split(",").map(function(x){return x.trim();}).filter(Boolean).slice(0,6);
    return raw.map(function(name, idx){
      return { id: String(name).toLowerCase().replace(/\s+/g,"_") + "_" + idx, name: name, where:"", kind:"", foundAt:"", state:"unknown" };
    });
  }

  // Persist "foundAt/uiState" back into state.ps.items when possible.
  function setItemMetaByName(name, patch){
    var st = window.state && window.state.ps ? window.state.ps : null;
    if (!st || !Array.isArray(st.items)) return;
    for (var i=0;i<st.items.length;i++){
      var it = st.items[i];
      if (!it || !it.name) continue;
      if (String(it.name).toLowerCase() === String(name).toLowerCase()){
        if (patch.foundAt != null) it.foundAt = patch.foundAt;
        if (patch.uiState != null) it.uiState = patch.uiState;
        if (patch.where != null) it.where = patch.where;
        return;
      }
    }
  }

  function prettyWhere(w){
    w = norm(w);
    if (!w) return "";
    // normalize a bit for display
    return w
      .replace(/\bright\b/i, "right")
      .replace(/\bleft\b/i, "left");
  }

  // Build student instruction text (also human-readable in chat history)
  function buildInstruction(itemName, act){
    if (act === "what"){
      return "What is the " + itemName + "?";
    }
    if (act === "takeout"){
      return "Please take the " + itemName + " out and show it to me. Tell me where you took it from.";
    }
    if (act === "table"){
      return "Please put the " + itemName + " on the table so I can see it clearly. Tell me where you took it from.";
    }
    return "Show me the " + itemName + ".";
  }

  // Build visitor response deterministically from current state.ps items where possible.
  function makeVisitorResponse(itemName, act){
    var st = window.state && window.state.ps ? window.state.ps : null;
    var where = "";
    var kind = "";
    if (st && Array.isArray(st.items)){
      for (var i=0;i<st.items.length;i++){
        if (st.items[i] && st.items[i].name && String(st.items[i].name).toLowerCase() === String(itemName).toLowerCase()){
          where = st.items[i].foundAt || st.items[i].where || "";
          kind = st.items[i].kind || "";
          break;
        }
      }
    }
    where = norm(where);

    if (act === "what"){
      // Keep it short and natural.
      if (/wallet/i.test(itemName)) return "It's my wallet.";
      if (/phone/i.test(itemName)) return "It's my phone.";
      if (/keys?/i.test(itemName)) return "Those are my keys.";
      if (/id/i.test(itemName)) return "It's my ID card.";
      if (/usb/i.test(itemName)) return "It's a USB stick.";
      if (/glasses/i.test(itemName)) return "They're my glasses.";
      if (/headphones/i.test(itemName)) return "Those are my headphones.";
      if (/comb/i.test(itemName)) return "It's a comb.";
      if (/labello/i.test(itemName)) return "It's lip balm.";
      if (/cigarette/i.test(itemName)) return "It's a cigarette.";
      if (/notebook/i.test(itemName)) return "It's a notebook.";
      if (/knife/i.test(itemName)) return "It's a small knife.";
      if (/gun|pistol/i.test(itemName)) return "It's a pistol.";
      if (/whiskey/i.test(itemName)) return "It's a bottle of whiskey.";
      if (/joint/i.test(itemName)) return "It's a joint.";
      return "It's a " + itemName + ".";
    }

    // Take out / put on table
    var from = where ? (" from my " + where) : "";
    if (act === "takeout"){
      return "Okay. I'll take the " + itemName + from + " and show it to you.";
    }
    if (act === "table"){
      return "Okay. I'll take the " + itemName + from + " and place it on the table.";
    }
    return "Okay.";
  }

  // Call app.js functions if present (they are top-level in this app).
  function sayAsStudent(text){
    try{
      if (typeof window.addMsg === "function") window.addMsg("student", text);
    }catch(e){}
  }
  function sayAsVisitor(text){
    try{
      if (typeof window.enqueueVisitor === "function") window.enqueueVisitor(text);
    }catch(e){}
  }

  // ---------- UI mounting ----------
  function ensureUI(){
    injectStyle();

    var panel = document.getElementById("personSearchPanel");
    if (!panel) return;

    var body = panel.querySelector(".cardBody") || panel.querySelector(".card-body") || panel;
    if (!body) return;

    // Insert container once (prefer just after psOutfit)
    var wrap = body.querySelector("#psItemPillsWrap");
    if (!wrap){
      wrap = el("div","psItemPillsWrap");
      wrap.id = "psItemPillsWrap";

      var title = el("div","psItemPillsTitle");
      title.textContent = "Items (hover to ask / request):";
      wrap.appendChild(title);

      var list = el("div","psItemPills");
      list.id = "psItemPills";
      wrap.appendChild(list);

      var outfit = body.querySelector("#psOutfit") || body.querySelector(".psOutfit");
      if (outfit && outfit.parentNode === body){
        body.insertBefore(wrap, outfit.nextSibling);
      } else {
        body.insertBefore(wrap, body.firstChild);
      }
    }
  }

  function renderPills(){
    var panel = document.getElementById("personSearchPanel");
    if (!panel) return;

    ensureUI();

    var list = document.getElementById("psItemPills");
    if (!list) return;

    var items = getPSItems();
    // If no items, still render empty state.
    list.innerHTML = "";

    if (!items.length){
      var empty = el("div");
      empty.style.opacity = "0.85";
      empty.style.fontSize = "12px";
      empty.textContent = "No items available.";
      list.appendChild(empty);
      return;
    }

    items.forEach(function(item){
      var pill = el("div","psPill");
      pill.dataset.itemName = item.name;
      pill.dataset.state = item.state || "unknown";
      pill.dataset.meta = item.foundAt || "";

      var label = el("div");
      label.textContent = item.name;

      var meta = el("div","meta");
      meta.textContent = prettyWhere(item.foundAt);

      var pop = el("div","psPopover");
      var whereHint = item.foundAt ? ("Current: " + prettyWhere(item.foundAt) + ".") : "No location yet. Ask to locate it.";
      pop.innerHTML =
        "<div class='title'>" + item.name + "</div>" +
        "<div class='desc'>" + whereHint + "</div>" +
        "<div class='btnRow'>" +
          "<button type='button' data-act='what'>What is it?</button>" +
          "<button type='button' data-act='takeout'>Take out</button>" +
          "<button type='button' data-act='table'>Put on table</button>" +
        "</div>";

      pop.addEventListener("click", function(ev){
        var btn = ev.target.closest("button");
        if (!btn) return;
        ev.preventDefault(); ev.stopPropagation();

        var act = btn.getAttribute("data-act");
        var instruction = buildInstruction(item.name, act);
        sayAsStudent(instruction);

        // Visitor responds based on state (fast + deterministic)
        var vresp = makeVisitorResponse(item.name, act);
        sayAsVisitor(vresp);

        // Update meta: on 'table' we set foundAt=table; on takeout we keep original where if present.
        if (act === "table"){
          setItemMetaByName(item.name, { foundAt: "table", uiState: "known" });
        } else if (act === "takeout"){
          var st = window.state && window.state.ps ? window.state.ps : null;
          var w = item.foundAt || item.where || (st && st.items ? "" : "");
          setItemMetaByName(item.name, { foundAt: w || "shown", uiState: "known" });
        } else if (act === "what"){
          // Keep whatever we know, but mark as known.
          setItemMetaByName(item.name, { uiState: "known" });
        }

        // Re-render so meta appears immediately.
        renderPills();
      });

      pill.appendChild(label);
      pill.appendChild(meta);
      pill.appendChild(pop);
      list.appendChild(pill);
    });
  }

  // Boot + keep in sync when PS panel appears/updates.
  function boot(){
    ensureUI();
    renderPills();
    var obs = new MutationObserver(function(){
      // render only when PS is in DOM; cheap filter
      if (document.getElementById("personSearchPanel")) renderPills();
    });
    obs.observe(document.body, {subtree:true, childList:true, attributes:true});
    window.addEventListener("resize", function(){ renderPills(); });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
