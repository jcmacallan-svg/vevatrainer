// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";

  var imgCache = {};

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      if (!src) return reject(new Error("No src"));
      if (imgCache[src]) return resolve(imgCache[src]);
      var img = new Image();
      img.onload = function () { imgCache[src] = img; resolve(img); };
      img.onerror = function () { reject(new Error("Failed to load: " + src)); };
      img.src = src;
    });
  }

  function fitCanvasToCssSize(canvas, ctx) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(rect.width));
    var cssH = Math.max(1, Math.round(rect.height));

    var pw = Math.round(cssW * dpr);
    var ph = Math.round(cssH * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    // draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { W: cssW, H: cssH, dpr: dpr };
  }

  // Draw table as CONTAIN so full table stays visible.
  // Returns the drawn rect (dx,dy,dw,dh) in CSS pixels.
  function drawContain(ctx, img, w, h, pad) {
    pad = pad || 16;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    var s = Math.min(availW / iw, availH / ih); // CONTAIN
    var dw = iw * s, dh = ih * s;

    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette so margins feel intentional
    ctx.save();
    var g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.25, w/2, h/2, Math.max(w,h)*0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    return { x: dx, y: dy, w: dw, h: dh };
  }

  function randBetween(min, max) { return min + Math.random() * (max - min); }

  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Mapping to your current filenames (assets/items/*.png)
  var ITEM_SPRITES = {
    "Comb": "assets/items/comb.png",
    "Cigarette": "assets/items/cigarette.png",
    "Glasses": "assets/items/glasses.png",
    "Gun": "assets/items/gun.png",
    "Pistol": "assets/items/gun.png",
    "Handgun": "assets/items/gun.png",
    "Headphones": "assets/items/headphones.png",
    "ID": "assets/items/ID.png",
    "Joint": "assets/items/joint.png",
    "Keys": "assets/items/keys.png",
    "Knife": "assets/items/knife.png",
    "Small pocket knife": "assets/items/knife.png",
    "Labello": "assets/items/labello.png",
    "Notebook": "assets/items/notebook.png",
    "Phone": "assets/items/phone.png",
    "USB": "assets/items/USB.png",
    "Wallet": "assets/items/wallet.png",
    "Whiskey": "assets/items/whiskey.png"
  };

  function ensureHintOverlay(canvas) {
    try{
      var wrap = canvas.parentElement;
      if (!wrap) return;
      wrap.classList.add("psTableThumbWrap");
      if (wrap.querySelector(".psEnlargeHint")) return;
      var hint = document.createElement("div");
      hint.className = "psEnlargeHint";
      hint.textContent = "Click to enlarge";
      wrap.appendChild(hint);
    }catch(e){}
  }

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = (opts.items || []).slice(0, 6);

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!opts.noHint) ensureHintOverlay(canvas);

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;
    ctx.clearRect(0, 0, W, H);

    // Background for margins
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);

    // Draw table and get its exact rect
    var rect = { x: 0, y: 0, w: W, h: H };
    try{
      var bg = await loadImage(tableSrc);
      rect = drawContain(ctx, bg, W, H, (opts.pad == null ? 12 : opts.pad));
    }catch(e){}

    // Constrain item placement inside the table rect (important!)
    var inset = (opts.inset == null ? 22 : opts.inset);
    var tx = rect.x + inset;
    var ty = rect.y + inset;
    var tw = Math.max(1, rect.w - inset*2);
    var th = Math.max(1, rect.h - inset*2);

    // 3x2 slots inside table rect
    var slots = [
      { x: 0.20, y: 0.30 }, { x: 0.50, y: 0.30 }, { x: 0.80, y: 0.30 },
      { x: 0.20, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.80, y: 0.70 }
    ];

    // Scale so 6 items fit nicely
    var baseScale = (opts.baseScale == null ? 0.26 : opts.baseScale); // relative to table rect width
    var scaleJitter = (opts.scaleJitter == null ? 0.05 : opts.scaleJitter);

    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var slot = slots[i] || slots[slots.length - 1];

      var src = it.src || it.sprite || ITEM_SPRITES[it.name];
      if (!src) continue;

      var cx = tx + slot.x * tw + randBetween(-tw*0.02, tw*0.02);
      var cy = ty + slot.y * th + randBetween(-th*0.02, th*0.02);
      var rot = randBetween(-0.18, 0.18);
      var scale = baseScale + randBetween(-scaleJitter, scaleJitter);

      try{
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        var targetW = tw * scale;
        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        // Clamp per-slot max so it never spills off-table
        var maxW = tw * 0.36;
        if (dw > maxW) {
          s = maxW / iw;
          dw = iw * s;
          dh = ih * s;
        }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Shadow (on table)
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
        ctx.restore();
      }catch(e2){}
    }
  }

  function ensureModal() {
    if (document.getElementById("psTableModal")) return;

    var modal = document.createElement("div");
    modal.id = "psTableModal";
    modal.className = "psTableModal hidden";
    modal.innerHTML =
      '<div class="psTableModalBackdrop"></div>' +
      '<div class="psTableModalDialog" role="dialog" aria-modal="true">' +
        '<button class="psTableModalClose" aria-label="Close">×</button>' +
        '<canvas id="psTableCanvasModal" class="psTableCanvasModal"></canvas>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.classList.add("hidden"); }

    modal.querySelector(".psTableModalBackdrop").addEventListener("click", close);
    modal.querySelector(".psTableModalClose").addEventListener("click", close);
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  async function openModal(opts) {
    ensureModal();
    var modal = document.getElementById("psTableModal");
    modal.classList.remove("hidden");

    await render({
      canvasId: "psTableCanvasModal",
      tableSrc: (opts && opts.tableSrc) || DEFAULT_TABLE,
      items: (opts && opts.items) || [],
      pad: 20,
      inset: 34,
      baseScale: 0.22,
      scaleJitter: 0.04,
      noHint: true
    });
  }

  function bindThumbnailClick(getStateFn) {
    try{
      var canvas = document.getElementById("psTableCanvas");
      if (!canvas) return;
      if (canvas.__psBound) return;
      canvas.__psBound = true;

      canvas.style.cursor = "pointer";
      canvas.addEventListener("click", function(){
        var st = (typeof getStateFn === "function") ? getStateFn() : null;
        var items = (st && st.items) ? st.items : [];
        var tableSrc = (st && st.tableSrc) ? st.tableSrc : DEFAULT_TABLE;
        openModal({ items: items, tableSrc: tableSrc });
      });
    }catch(e){}
  }

  window.VEVA_TABLETOP = {
    render: render,
    openModal: openModal,
    bindThumbnailClick: bindThumbnailClick
  };
})();