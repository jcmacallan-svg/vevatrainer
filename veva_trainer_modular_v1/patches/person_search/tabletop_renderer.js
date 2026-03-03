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

    var wantW = Math.round(cssW * dpr);
    var wantH = Math.round(cssH * dpr);

    if (canvas.width !== wantW || canvas.height !== wantH) {
      canvas.width = wantW;
      canvas.height = wantH;
    }

    // Draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W: cssW, H: cssH };
  }

  function drawContain(ctx, img, w, h, pad) {
    pad = (pad == null) ? 16 : pad;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    var s = Math.min(availW / iw, availH / ih); // CONTAIN
    var dw = iw * s, dh = ih * s;

    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    // Soft vignette to feel like a table in a scene (not required, but subtle)
    ctx.save();
    var g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.25, w/2, h/2, Math.max(w,h)*0.6);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Assets
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Name -> sprite mapping (adjust to your filenames)
  var ITEM_SPRITES = {
    "Gun": "assets/items/gun.png",
    "Small pocket knife": "assets/items/knife.png",
    "Knife": "assets/items/knife.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Phone": "assets/items/phone.png",
    "Joint": "assets/items/joint.png",
    "Jacket": "assets/items/jacket.png",
    "Cap": "assets/items/cap.png",
    "Headgear": "assets/items/cap.png",
    "Helmet": "assets/items/helmet.png"
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, W, H);

    // Background
    try {
      var bg = await loadImage(tableSrc);
      drawContain(ctx, bg, W, H, 18);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    // Up to 6 items, laid out in 3x2 slots with jitter/rotation
    var list = items.slice(0, 6);

    var slots = [
      { x: 0.22, y: 0.34 }, { x: 0.50, y: 0.34 }, { x: 0.78, y: 0.34 },
      { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.70 }
    ];

    // Scale to fit regardless of panel size:
    // aim for ~1/4 of canvas width per item, but clamp so it stays reasonable.
    var targetW = Math.max(140, Math.min(260, Math.round(W * 0.22)));

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var slot = slots[i] || slots[slots.length - 1];

      var src = it.src || it.sprite || (it.name ? ITEM_SPRITES[it.name] : "");

      if (!src) continue;

      var cx = slot.x * W + randBetween(-18, 18);
      var cy = slot.y * H + randBetween(-12, 12);
      var rot = randBetween(-0.18, 0.18);

      try {
        var img = await loadImage(src);

        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // Fit width to targetW (keeps items consistent)
        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Shadow "on the table"
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // ignore load errors
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
