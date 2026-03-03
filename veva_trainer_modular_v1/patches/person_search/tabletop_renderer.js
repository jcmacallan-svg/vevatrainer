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
    return { W: cssW, H: cssH };
  }

  function drawContain(ctx, img, w, h, pad) {
    pad = pad || 16;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);
    var s = Math.min(availW / iw, availH / ih);
    var dw = iw * s, dh = ih * s;
    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette / frame feel
    ctx.save();
    var g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.25, w/2, h/2, Math.max(w,h)*0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Mapping based on your current files in assets/items/
  var ITEM_SPRITES = {
    "cigarette": "assets/items/cigarette.png",
    "comb": "assets/items/comb.png",
    "glasses": "assets/items/glasses.png",
    "gun": "assets/items/gun.png",
    "headphones": "assets/items/headphones.png",
    "id": "assets/items/ID.png",
    "joint": "assets/items/joint.png",
    "keys": "assets/items/keys.png",
    "knife": "assets/items/knife.png",
    "labello": "assets/items/labello.png",
    "notebook": "assets/items/notebook.png",
    "phone": "assets/items/phone.png",
    "usb": "assets/items/USB.png",
    "wallet": "assets/items/wallet.png",
    "whiskey": "assets/items/whiskey.png",
    // optional apparel if you add them later:
    "jacket": "assets/items/jacket.png",
    "cap": "assets/items/cap.png"
  };

  function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
  }

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId;
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = Array.isArray(opts.items) ? opts.items.slice(0, 6) : [];
    var pad = typeof opts.pad === "number" ? opts.pad : 18;

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Background table
    try {
      var bg = await loadImage(tableSrc);
      drawContain(ctx, bg, W, H, pad);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    // Safe drawing area inside the table frame
    var safePad = Math.max(18, Math.round(Math.min(W, H) * 0.06));
    var safeX = safePad;
    var safeY = safePad;
    var safeW = Math.max(1, W - safePad * 2);
    var safeH = Math.max(1, H - safePad * 2);

    // 3x2 slot centers in safe area
    var colW = safeW / 3;
    var rowH = safeH / 2;

    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var key = normalizeName(it.key || it.spriteKey || it.name);
      var src = it.src || it.sprite || ITEM_SPRITES[key];

      if (!src) continue;

      var col = i % 3;
      var row = i < 3 ? 0 : 1;

      var cx = safeX + (col + 0.5) * colW + randBetween(-colW * 0.08, colW * 0.08);
      var cy = safeY + (row + 0.5) * rowH + randBetween(-rowH * 0.08, rowH * 0.08);

      // rotation
      var rot = randBetween(-0.18, 0.18);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // Target size relative to slot; keeps 6 items fitting
        var target = Math.min(colW, rowH) * 0.74; // tune: bigger/smaller
        var s = target / Math.max(iw, ih);
        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Shadow on table
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {}
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
