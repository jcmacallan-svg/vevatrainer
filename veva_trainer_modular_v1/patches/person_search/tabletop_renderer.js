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

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Draw background with CONTAIN, so whole table (incl. edges) is visible.
  // Returns the drawn rect so we can place items inside it.
  function drawContain(ctx, img, w, h, pad) {
    pad = pad || 18;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    var s = Math.min(availW / iw, availH / ih);
    var dw = iw * s, dh = ih * s;

    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette so the "mat" around the table feels natural
    ctx.save();
    var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.6);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    return { x: dx, y: dy, w: dw, h: dh };
  }

  // Assets (adjust paths if needed)
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Map item name -> sprite path (PNG with transparency)
  // Add aliases freely; if you instead provide it.src in ps.items, that will be used.
  var ITEM_SPRITES = {
    "Gun": "assets/items/gun.png",
    "Small pocket knife": "assets/items/knife.png",
    "Knife": "assets/items/knife.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Phone": "assets/items/phone.png",
    "Joint": "assets/items/joint.png"
  };

  function pickSprite(it) {
    return (it && (it.src || it.sprite)) || (it && ITEM_SPRITES[it.name]) || "";
  }

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = opts.items || [];

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fit to panel size (keeps things sharp on HiDPI)
    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Background table
    var tableRect = { x: 0, y: 0, w: W, h: H };
    try {
      var bg = await loadImage(tableSrc);
      tableRect = drawContain(ctx, bg, W, H, 18);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    var list = (Array.isArray(items) ? items : []).slice(0, 6);

    // Place items INSIDE the drawn table rect.
    // We compute a 3x2 grid within the table rect (with inner padding),
    // then scale each sprite to fit its cell.
    var innerPad = Math.max(14, Math.round(Math.min(tableRect.w, tableRect.h) * 0.06)); // ~6% padding
    var tx = tableRect.x + innerPad;
    var ty = tableRect.y + innerPad;
    var tw = Math.max(1, tableRect.w - innerPad * 2);
    var th = Math.max(1, tableRect.h - innerPad * 2);

    var cols = 3, rows = 2;
    var cellW = tw / cols;
    var cellH = th / rows;

    // target fill within each cell (tweakable)
    var cellFill = 0.72;  // percent of cell width/height used by item
    var maxRot = 0.16;    // radians (~9 degrees)

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var src = pickSprite(it);
      if (!src) continue;

      var c = i % cols;
      var r = Math.floor(i / cols);

      // center of the cell + jitter
      var cx = tx + c * cellW + cellW / 2 + randBetween(-cellW * 0.06, cellW * 0.06);
      var cy = ty + r * cellH + cellH / 2 + randBetween(-cellH * 0.05, cellH * 0.05);

      var rot = randBetween(-maxRot, maxRot);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // Fit item into cell (preserve aspect)
        var targetW = cellW * cellFill;
        var targetH = cellH * cellFill;

        var s = Math.min(targetW / iw, targetH / ih);

        // Prevent tiny items becoming unreadably small on very wide screens:
        // clamp to a reasonable minimum, but never exceed the fit scale.
        var minPx = Math.max(60, Math.round(Math.min(W, H) * 0.10));
        var minS = Math.min(targetW / iw, targetH / ih, minPx / Math.max(iw, ih));
        s = Math.max(s, minS);

        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Shadow (looks like item is on the table)
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 26;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // skip missing sprites
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
