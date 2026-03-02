// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";

  // Tabletop renderer:
  // - fits canvas to CSS size with DPR for crisp rendering
  // - draws table background using "contain" so the full table is visible (incl. edges)
  // - draws up to 6 item PNGs (each item is its own PNG with transparency)
  // - adds soft shadows under items

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

    var pxW = Math.round(cssW * dpr);
    var pxH = Math.round(cssH * dpr);

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }

    // Draw in CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W: cssW, H: cssH };
  }

  function drawContain(ctx, img, w, h, pad) {
    pad = (pad == null) ? 18 : pad;

    // matte background behind the table image
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    // CONTAIN, not cover: keep full table visible
    var s = Math.min(availW / iw, availH / ih);
    var dw = iw * s, dh = ih * s;

    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette for depth
    try {
      ctx.save();
      var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.65);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.20)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } catch (e) {}
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Background (user provided)
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Sprite mapping (adjust names to match your item names)
  // Files you mentioned:
  // gun.png, knife.png, wallet.png, keys.png, notebook.png, phone.png, joint.png
  var ITEM_SPRITES = {
    "Gun": "assets/items/gun.png",
    "Pistol": "assets/items/gun.png",

    "Small pocket knife": "assets/items/knife.png",
    "Knife": "assets/items/knife.png",
    "Pocket knife": "assets/items/knife.png",

    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Phone": "assets/items/phone.png",

    "Joint": "assets/items/joint.png",
    "Weed joint": "assets/items/joint.png"
  };

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

    // Background table (contain so the whole table is visible)
    try {
      var bg = await loadImage(tableSrc);
      drawContain(ctx, bg, W, H, 18);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    var list = items.slice(0, 6);

    // Layout: 3x2 slots, with small jitter.
    // If fewer than 6 items, we still distribute them nicely.
    var slots = [
      { x: 0.22, y: 0.32 }, { x: 0.50, y: 0.32 }, { x: 0.78, y: 0.32 },
      { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.70 }
    ];

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var slot = slots[i] || slots[slots.length - 1];

      // src priority: per-item src/sprite, else lookup by name
      var src = it.src || it.sprite || ITEM_SPRITES[it.name];

      if (!src) continue;

      var cx = slot.x * W + randBetween(-14, 14);
      var cy = slot.y * H + randBetween(-10, 10);
      var rot = randBetween(-0.16, 0.16); // ~ -9..+9 deg

      // Slight per-item size tuning by name (optional)
      var baseScale = 0.35;
      var n = String(it.name || "");
      if (n === "Phone") baseScale = 0.36;
      if (n === "Notebook") baseScale = 0.38;
      if (n === "Gun" || n === "Pistol") baseScale = 0.42;
      if (n.indexOf("knife") >= 0 || n.indexOf("Knife") >= 0) baseScale = 0.38;

      var scale = randBetween(baseScale - 0.03, baseScale + 0.03);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        var targetW = W * scale;
        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Shadow on the table
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // skip if asset missing
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
