// patches/person_search/tabletop_renderer.js
(function(){
  "use strict";

  // Full-width tabletop renderer
  // - Canvas auto-sizes to its container width
  // - Height derived from table aspect ratio (shows full table incl. edges)
  // - Renders up to 6 item PNGs with soft shadow
  // - Uses existing PNGs in assets/items/

  var imgCache = {};

  function loadImage(src){
    return new Promise(function(resolve, reject){
      if (!src) return reject(new Error("No src"));
      if (imgCache[src]) return resolve(imgCache[src]);
      var img = new Image();
      img.onload = function(){ imgCache[src]=img; resolve(img); };
      img.onerror = function(){ reject(new Error("Failed to load: "+src)); };
      img.src = src;
    });
  }

  // Fit canvas pixel buffer to CSS size (DPR aware)
  function fitCanvasToCssSize(canvas, ctx){
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(rect.width));
    var cssH = Math.max(1, Math.round(rect.height));
    var pxW = Math.round(cssW * dpr);
    var pxH = Math.round(cssH * dpr);
    if (canvas.width !== pxW || canvas.height !== pxH){
      canvas.width = pxW;
      canvas.height = pxH;
    }
    // draw in CSS pixels
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { W: cssW, H: cssH };
  }

  // Draw table with CONTAIN so the whole surface (edges) remains visible
  function drawContain(ctx, img, w, h, pad){
    pad = pad || 14;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad*2);
    var availH = Math.max(1, h - pad*2);

    var s = Math.min(availW/iw, availH/ih);
    var dw = iw*s, dh = ih*s;
    var dx = (w - dw)/2;
    var dy = (h - dh)/2;

    // subtle mat behind (helps “frame”)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    ctx.drawImage(img, dx, dy, dw, dh);

    // soft vignette
    ctx.save();
    var g = ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.28,w/2,h/2,Math.max(w,h)*0.72);
    g.addColorStop(0,"rgba(0,0,0,0)");
    g.addColorStop(1,"rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  function randBetween(min,max){ return min + Math.random()*(max-min); }

  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Your current item set (filenames you listed)
  // IMPORTANT: filesystem is case-sensitive on many hosts.
  var ITEM_SPRITES = {
    "cigarette": "assets/items/cigarette.png",
    "comb":      "assets/items/comb.png",
    "glasses":   "assets/items/glasses.png",
    "gun":       "assets/items/gun.png",
    "twelve gun":"assets/items/gun.png",
    "headphones":"assets/items/headphones.png",
    "id":        "assets/items/ID.png",
    "joint":     "assets/items/joint.png",
    "keys":      "assets/items/keys.png",
    "knife":     "assets/items/knife.png",
    "labello":   "assets/items/labello.png",
    "notebook":  "assets/items/notebook.png",
    "phone":     "assets/items/phone.png",
    "usb":       "assets/items/USB.png",
    "wallet":    "assets/items/wallet.png",
    "whiskey":   "assets/items/whiskey.png"
  };

  function normName(name){
    return String(name||"").trim().toLowerCase();
  }

  // Maintain consistent size: scale based on max item dimension relative to table
  function computeItemScale(img, targetMaxPx){
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var maxDim = Math.max(iw, ih);
    if (!maxDim) return 1;
    return targetMaxPx / maxDim;
  }

  async function render(opts){
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = Array.isArray(opts.items) ? opts.items.slice(0,6) : [];

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure container-driven height based on table AR (so table fills width nicely)
    // If parent has no explicit height, derive it from width.
    var parent = canvas.parentElement;
    if (parent){
      var rect = parent.getBoundingClientRect();
      var cssW = Math.max(1, Math.round(rect.width));
      var TABLE_AR = 520/900; // adjust if your background has another ratio
      var wantH = Math.round(cssW * TABLE_AR);
      // clamp a bit so it stays usable
      wantH = Math.max(240, Math.min(420, wantH));
      parent.style.height = wantH + "px";
    }

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;
    ctx.clearRect(0,0,W,H);

    // background
    try{
      var bg = await loadImage(tableSrc);
      drawContain(ctx, bg, W, H, 16);
    }catch(e){
      ctx.fillStyle="#0b1220";
      ctx.fillRect(0,0,W,H);
    }

    // Placement region (leave some margin so items don't touch edges)
    var pad = Math.round(Math.min(W,H) * 0.06);
    var x0 = pad, y0 = pad;
    var x1 = W - pad, y1 = H - pad;

    // 3x2 slots within inner region
    var slots = [
      { x: 0.20, y: 0.32 }, { x: 0.50, y: 0.30 }, { x: 0.80, y: 0.32 },
      { x: 0.22, y: 0.72 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.72 }
    ];

    // target item size: bigger than before, but still fits 6
    var innerW = x1 - x0;
    var innerH = y1 - y0;
    var cellW = innerW / 3;
    var cellH = innerH / 2;
  // Make items larger but still safe for 6 slots
  var targetMax = Math.min(cellW, cellH) * 0.92; // ~92% of cell

    for (var i=0;i<items.length;i++){
      var it = items[i] || {};
      var slot = slots[i] || slots[slots.length-1];

      var key = normName(it.name);
      var src = it.src || it.sprite || ITEM_SPRITES[key];
      if (!src) continue;

      var cx = x0 + slot.x * innerW + randBetween(-cellW*0.08, cellW*0.08);
      var cy = y0 + slot.y * innerH + randBetween(-cellH*0.06, cellH*0.06);
      var rot = randBetween(-0.18, 0.18);

      try{
        var img = await loadImage(src);
        var s = computeItemScale(img, targetMax);

        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;
        var dw = iw*s, dh = ih*s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // shadow
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
        ctx.restore();
      }catch(e2){}
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();