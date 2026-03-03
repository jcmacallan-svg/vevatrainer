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

    var needResize = canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr);
    if (needResize) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    // draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W: cssW, H: cssH, dpr: dpr };
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function drawContain(ctx, img, w, h, pad) {
    pad = (pad == null ? 18 : pad);
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    var s = Math.min(availW / iw, availH / ih); // CONTAIN
    var dw = iw * s, dh = ih * s;

    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette so the "mat" looks intentional
    ctx.save();
    var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.70);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // ---- Assets ----
  // Background table image (you already have this)
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Your current item PNGs
  // Put these files in: assets/items/
  // Keys here are normalized (lowercase + alphanumerics only)
  var ITEM_SPRITES = {
    // everyday
    "wallet": "assets/items/wallet.png",
    "phone": "assets/items/phone.png",
    "keys": "assets/items/keys.png",
    "notebook": "assets/items/notebook.png",
    "glasses": "assets/items/glasses.png",
    "headphones": "assets/items/headphones.png",
    "comb": "assets/items/comb.png",
    "id": "assets/items/ID.png",
    "usb": "assets/items/USB.png",
    "labello": "assets/items/labello.png",
    "lipbalm": "assets/items/labello.png",
    "cigarette": "assets/items/cigarette.png",
    "cigarettes": "assets/items/cigarette.png",

    // risky / contraband
    "joint": "assets/items/joint.png",
    "knife": "assets/items/knife.png",
    "smallpocketknife": "assets/items/knife.png",
    "gun": "assets/items/gun.png",
    "whiskey": "assets/items/whiskey.png"
  };

  // Per-item scale tuning (fraction of canvas width).
  // Bigger by default (user feedback: items were too small).
  var ITEM_SCALE = {
    "phone": 0.22,
    "wallet": 0.21,
    "keys": 0.18,
    "notebook": 0.24,
    "glasses": 0.24,
    "headphones": 0.28,
    "comb": 0.25,
    "id": 0.20,
    "usb": 0.18,
    "labello": 0.16,
    "lipbalm": 0.16,
    "cigarette": 0.24,
    "cigarettes": 0.24,
    "joint": 0.22,
    "knife": 0.27,
    "smallpocketknife": 0.27,
    "gun": 0.32,
    "whiskey": 0.24
  };

  function normalizeName(n) {
    return String(n || "").trim();
  }

  function normalizeKey(n) {
    // "Small pocket knife" -> "smallpocketknife"
    return String(n || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function spriteForItem(it) {
    if (!it) return "";
    if (it.src) return it.src;
    if (it.sprite) return it.sprite;
    var name = normalizeName(it.name);
    var key = normalizeKey(name);
    return ITEM_SPRITES[key] || "";
  }

  function scaleForItem(it, W) {
    var name = normalizeName(it && it.name);
    var key = normalizeKey(name);
    var s = ITEM_SCALE[key];
    if (s == null) s = 0.22;

    // allow overriding per item
    if (it && typeof it.scale === "number") s = it.scale;

    // safety caps
    if (s > 0.34) s = 0.34;
    if (s < 0.14) s = 0.14;
    return s;
  }

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = Array.isArray(opts.items) ? opts.items : [];

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Background table (contain so edges stay visible)
    try {
      var bg = await loadImage(tableSrc);
      drawContain(ctx, bg, W, H, 18);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    var list = items.slice(0, 6);

    // 3x2 slots, with slight jitter for realism
    var slots = [
      { x: 0.22, y: 0.32 }, { x: 0.50, y: 0.32 }, { x: 0.78, y: 0.32 },
      { x: 0.22, y: 0.72 }, { x: 0.50, y: 0.72 }, { x: 0.78, y: 0.72 }
    ];

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var slot = slots[i] || slots[slots.length - 1];

      var src = spriteForItem(it);
      if (!src) continue;

      var cx = slot.x * W + randBetween(-16, 16);
      var cy = slot.y * H + randBetween(-10, 10);
      var rot = randBetween(-0.18, 0.18);

      var baseScale = scaleForItem(it, W);

      try {
        var img = await loadImage(src);

        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // size relative to canvas width
        var targetW = W * baseScale;

        // for very wide items (comb, cigarettes), keep them from dominating
        var aspect = iw / Math.max(1, ih);
        if (aspect > 2.4) targetW *= 0.85;

        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // shadow "on table"
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // skip
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
