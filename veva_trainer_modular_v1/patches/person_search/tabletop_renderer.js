// patches/person_search/tabletop_renderer.js
(function(){
  "use strict";

  var IMG_CACHE = Object.create(null);

  function loadImage(src){
    return new Promise(function(resolve, reject){
      if(!src) return reject(new Error("no src"));
      if(IMG_CACHE[src]) return resolve(IMG_CACHE[src]);
      var img = new Image();
      img.onload = function(){ IMG_CACHE[src]=img; resolve(img); };
      img.onerror = function(){ reject(new Error("failed to load " + src)); };
      img.src = src;
    });
  }

  function fitCanvasToCss(canvas, ctx){
    var dpr = window.devicePixelRatio || 1;
    var r = canvas.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(r.width));
    var cssH = Math.max(1, Math.round(r.height));
    var pxW = Math.round(cssW * dpr);
    var pxH = Math.round(cssH * dpr);
    if(canvas.width !== pxW) canvas.width = pxW;
    if(canvas.height !== pxH) canvas.height = pxH;
    // Draw in CSS pixels
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return {W: cssW, H: cssH};
  }

  // Draw image like CSS background-size: contain, return drawn rect.
  function drawContain(ctx, img, W, H, pad){
    pad = (pad==null)? 18 : pad;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var availW = Math.max(1, W - pad*2);
    var availH = Math.max(1, H - pad*2);
    var s = Math.min(availW/iw, availH/ih);
    var dw = iw*s, dh = ih*s;
    var dx = (W - dw)/2;
    var dy = (H - dh)/2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette to frame the table
    ctx.save();
    var g = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.25, W/2, H/2, Math.max(W,H)*0.65);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    return {x:dx, y:dy, w:dw, h:dh};
  }

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function rand(min,max){ return min + Math.random()*(max-min); }

  var TABLE_SRC = "assets/table/tafelachtergrond.png";

  // Map display names -> sprite files
  var SPRITES = {
    "Wallet":"assets/items/wallet.png",
    "Phone":"assets/items/phone.png",
    "Notebook":"assets/items/notebook.png",
    "Keys":"assets/items/keys.png",
    "USB":"assets/items/USB.png",
    "ID":"assets/items/ID.png",
    "Glasses":"assets/items/glasses.png",
    "Headphones":"assets/items/headphones.png",
    "Comb":"assets/items/comb.png",
    "Cigarette":"assets/items/cigarette.png",
    "Labello":"assets/items/labello.png",
    "Joint":"assets/items/joint.png",
    "Knife":"assets/items/knife.png",
    "Gun":"assets/items/gun.png",
    "Whiskey":"assets/items/whiskey.png",
    // aliases / common variants
    "Small pocket knife":"assets/items/knife.png",
    "Pistol":"assets/items/gun.png"
  };

  // Decide which sprite to use for an item object or name.
  function spriteFor(item){
    if(!item) return "";
    if(typeof item === "string"){
      return SPRITES[item] || "";
    }
    if(item.src) return item.src;
    if(item.sprite) return item.sprite;
    if(item.name && SPRITES[item.name]) return SPRITES[item.name];
    return "";
  }

  function normalizeName(s){
    return String(s||"").trim();
  }

  function parseItemsFromText(){
    // We parse from the "You see the following items on the table: X, Y, Z." line
    var el = document.querySelector("#personSearchPanel .psOutfit");
    if(!el) return [];
    var txt = (el.textContent || "").replace(/\s+/g," ").trim();
    var m = txt.match(/You see the following items on the table:\s*([^\.]+)\.?/i);
    if(!m) return [];
    var raw = m[1].split(",").map(function(x){return x.trim();}).filter(Boolean);
    return raw.map(normalizeName);
  }

  function computeSlots(rect){
    // 3x2 grid inside the table rect with margins
    var mx = rect.w * 0.10;
    var my = rect.h * 0.14;
    var left = rect.x + mx;
    var top  = rect.y + my;
    var w = rect.w - mx*2;
    var h = rect.h - my*2;

    var xs = [left + w*0.18, left + w*0.50, left + w*0.82];
    var ys = [top + h*0.38,  top + h*0.74];
    return [
      {x:xs[0], y:ys[0]}, {x:xs[1], y:ys[0]}, {x:xs[2], y:ys[0]},
      {x:xs[0], y:ys[1]}, {x:xs[1], y:ys[1]}, {x:xs[2], y:ys[1]}
    ];
  }

  async function render(opts){
    opts = opts || {};
    var canvas = typeof opts.canvas === "string" ? document.getElementById(opts.canvas) : opts.canvas;
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    if(!ctx) return;

    var size = fitCanvasToCss(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.clearRect(0,0,W,H);

    var items = Array.isArray(opts.items) ? opts.items.slice(0,6) : [];
    var tableSrc = opts.tableSrc || TABLE_SRC;

    var tableRect = {x:0,y:0,w:W,h:H};
    try{
      var bg = await loadImage(tableSrc);
      tableRect = drawContain(ctx, bg, W, H, 18);
    }catch(e){
      ctx.fillStyle = "#151b2a";
      ctx.fillRect(0,0,W,H);
    }

    var slots = computeSlots(tableRect);

    for(var i=0;i<items.length && i<6;i++){
      var it = items[i];
      var name = (typeof it === "string") ? it : (it && it.name) ? it.name : "";
      var src = spriteFor(it) || spriteFor(name);
      if(!src) continue;

      var slot = slots[i] || slots[slots.length-1];
      var cx = slot.x + rand(-tableRect.w*0.03, tableRect.w*0.03);
      var cy = slot.y + rand(-tableRect.h*0.03, tableRect.h*0.03);
      var rot = rand(-0.14, 0.14);

      try{
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // size item relative to table rect (so it scales with resolution)
        var base = Math.min(tableRect.w, tableRect.h);
        var targetW = base * 0.18; // tuned for 6 items
        // Long items (knife/joint) a bit smaller to fit
        var lower = /knife|joint|cigarette/i.test(String(name)) ? 0.15 : 0.18;
        targetW = base * lower;

        var s = targetW / iw;
        var dw = iw*s;
        var dh = ih*s;

        // Keep inside table
        var halfW = dw/2, halfH = dh/2;
        cx = clamp(cx, tableRect.x + halfW + 6, tableRect.x + tableRect.w - halfW - 6);
        cy = clamp(cy, tableRect.y + halfH + 6, tableRect.y + tableRect.h - halfH - 6);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Shadow on table
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 22;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 14;

        ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
        ctx.restore();
      }catch(e2){
        // skip item
      }
    }
  }

  // ---------- UI (thumbnail + modal) ----------
  function ensureStyles(){
    if(document.getElementById("vevaTabletopStyles")) return;
    var css = ""
      + ".psTableThumbWrap{position:relative;width:100%;height:170px;border-radius:12px;border:1px solid var(--border);overflow:hidden;background:rgba(255,255,255,0.03);cursor:pointer;}"
      + ".psTableThumbCanvas{width:100%;height:100%;display:block;}"
      + ".psEnlargeHint{position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:6px;"
      + "padding:6px 10px;border-radius:999px;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.14);"
      + "color:#fff;font-size:12px;line-height:1;user-select:none;}"
      + ".psEnlargeHint .icon{font-size:13px;opacity:.95}"
      + ".vevaModalBackdrop{position:fixed;inset:0;background:rgba(0,0,0,0.55);display:none;align-items:center;justify-content:center;z-index:9999;}"
      + ".vevaModalBackdrop[aria-hidden='false']{display:flex;}"
      + ".vevaModal{width:min(980px,92vw);height:min(700px,86vh);background:rgba(18,23,36,0.96);border:1px solid rgba(255,255,255,0.14);border-radius:16px;box-shadow:0 18px 55px rgba(0,0,0,0.55);overflow:hidden;}"
      + ".vevaModalHeader{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.10);color:#fff;}"
      + ".vevaModalHeader .title{font-weight:700;font-size:14px;}"
      + ".vevaModalClose{width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;}"
      + ".vevaModalBody{height:calc(100% - 57px);padding:14px;}"
      + ".vevaModalCanvas{width:100%;height:100%;display:block;border-radius:12px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.03);}";
    var st = document.createElement("style");
    st.id = "vevaTabletopStyles";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function ensureUI(){
    ensureStyles();

    var panel = document.getElementById("personSearchPanel");
    if(!panel) return;

    // Find the "Person Search — Items" card body area
    var body = panel.querySelector(".cardBody");
    if(!body) return;

    // Insert thumbnail wrap just before #psCards if exists, else at end
    var existingWrap = body.querySelector(".psTableThumbWrap");
    if(!existingWrap){
      var wrap = document.createElement("div");
      wrap.className = "psTableThumbWrap";
      wrap.innerHTML = '<canvas class="psTableThumbCanvas" id="psTableThumbCanvas"></canvas>'
        + '<div class="psEnlargeHint" aria-label="Click to enlarge"><span class="icon">🔍➕</span><span>Click to enlarge</span></div>';
      var psCards = body.querySelector("#psCards");
      if(psCards) body.insertBefore(wrap, psCards);
      else body.appendChild(wrap);

      wrap.addEventListener("click", function(){
        openModal();
      });
    }

    // Modal
    if(!document.getElementById("vevaTabletopBackdrop")){
      var bd = document.createElement("div");
      bd.id = "vevaTabletopBackdrop";
      bd.className = "vevaModalBackdrop";
      bd.setAttribute("aria-hidden","true");
      bd.innerHTML = ''
        + '<div class="vevaModal" role="dialog" aria-modal="true">'
        +   '<div class="vevaModalHeader"><div class="title">Tabletop view</div>'
        +     '<button class="vevaModalClose" type="button" aria-label="Close">×</button>'
        +   '</div>'
        +   '<div class="vevaModalBody"><canvas class="vevaModalCanvas" id="psTableModalCanvas"></canvas></div>'
        + '</div>';
      document.body.appendChild(bd);

      // Close handlers
      var closeBtn = bd.querySelector(".vevaModalClose");
      closeBtn.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); closeModal(); });

      bd.addEventListener("click", function(ev){
        if(ev.target === bd) closeModal();
      });

      window.addEventListener("keydown", function(ev){
        if(ev.key === "Escape") closeModal();
      });
    }
  }

  var _modalOpen = false;

  function openModal(){
    ensureUI();
    var bd = document.getElementById("vevaTabletopBackdrop");
    if(!bd) return;
    bd.setAttribute("aria-hidden","false");
    _modalOpen = true;
    // Render big view
    var items = parseItemsFromText();
    render({ canvas: "psTableModalCanvas", tableSrc: TABLE_SRC, items: items });
  }

  function closeModal(){
    var bd = document.getElementById("vevaTabletopBackdrop");
    if(!bd) return;
    bd.setAttribute("aria-hidden","true");
    _modalOpen = false;
  }

  function hardCloseOnLoad(){
    var bd = document.getElementById("vevaTabletopBackdrop");
    if(bd) bd.setAttribute("aria-hidden","true");
  }

  var lastSig = "";
  function tick(){
    ensureUI();
    hardCloseOnLoad(); // ensure never auto shows
    var items = parseItemsFromText();
    var sig = items.join("|");
    if(sig !== lastSig){
      lastSig = sig;
      render({ canvas: "psTableThumbCanvas", tableSrc: TABLE_SRC, items: items });
      if(_modalOpen){
        render({ canvas: "psTableModalCanvas", tableSrc: TABLE_SRC, items: items });
      }
    }
    // Also rerender on resize to keep crisp
  }

  var resizeTimer = null;
  window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      lastSig = ""; // force rerender
      tick();
    }, 120);
  });

  // Start polling after DOM ready
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){
      setInterval(tick, 250);
    });
  }else{
    setInterval(tick, 250);
  }

  window.VEVA_TABLETOP = window.VEVA_TABLETOP || {};
  window.VEVA_TABLETOP.render = render;
  window.VEVA_TABLETOP.openModal = openModal;
  window.VEVA_TABLETOP.closeModal = closeModal;
})();
