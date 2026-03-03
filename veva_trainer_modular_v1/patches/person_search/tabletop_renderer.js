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
    var w = Math.round(cssW * dpr);
    var h = Math.round(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W: cssW, H: cssH };
  }

  // Draw table as CONTAIN so the full table stays visible. Returns the table rect.
  function drawContain(ctx, img, W, H, pad) {
    pad = (pad == null) ? 12 : pad;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var availW = Math.max(1, W - pad * 2);
    var availH = Math.max(1, H - pad * 2);
    var s = Math.min(availW / iw, availH / ih);
    var dw = iw * s;
    var dh = ih * s;
    var dx = (W - dw) / 2;
    var dy = (H - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    // subtle vignette to give depth
    ctx.save();
    var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    return { x: dx, y: dy, w: dw, h: dh };
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function normalizeName(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Map logical names -> your PNG filenames
  var ITEM_SPRITES = {
    "wallet": "assets/items/wallet.png",
    "notebook": "assets/items/notebook.png",
    "phone": "assets/items/phone.png",
    "keys": "assets/items/keys.png",
    "id": "assets/items/ID.png",
    "usb": "assets/items/USB.png",
    "glasses": "assets/items/glasses.png",
    "comb": "assets/items/comb.png",
    "headphones": "assets/items/headphones.png",
    "cigarette": "assets/items/cigarette.png",
    "labello": "assets/items/labello.png",
    "whiskey": "assets/items/whiskey.png",
    "knife": "assets/items/knife.png",
    "gun": "assets/items/gun.png",
    "pistol": "assets/items/gun.png",
    "joint": "assets/items/joint.png"
  };

  function resolveSprite(item) {
    if (!item) return "";
    if (item.src) return item.src;
    if (item.sprite) return item.sprite;

    var n = normalizeName(item.name);
    // common aliases
    if (n.indexOf("pocket") >= 0 && n.indexOf("knife") >= 0) n = "knife";
    if (n.indexOf("pistol") >= 0) n = "pistol";
    if (n.indexOf("gun") >= 0) n = "gun";
    if (n.indexOf("usb") >= 0) n = "usb";

    // exact lookup
    if (ITEM_SPRITES[n]) return ITEM_SPRITES[n];

    // try by first token
    var t = n.split(" ")[0];
    return ITEM_SPRITES[t] || "";
  }

  // Compute a 3x2 layout inside the table rectangle
  function makeSlots(rect) {
    var innerPad = Math.max(10, Math.round(Math.min(rect.w, rect.h) * 0.06));
    var x0 = rect.x + innerPad;
    var y0 = rect.y + innerPad;
    var w = rect.w - innerPad * 2;
    var h = rect.h - innerPad * 2;

    var cols = 3;
    var rows = 2;
    var slots = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = x0 + (c + 0.5) * (w / cols);
        var cy = y0 + (r + 0.5) * (h / rows);
        slots.push({ cx: cx, cy: cy });
      }
    }
    return { slots: slots, innerPad: innerPad, innerW: w, innerH: h };
  }

  async function render(opts) {
    opts = opts || {};
    var canvas = document.getElementById(opts.canvasId || "psTableThumb");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, W, H);

    // background fill
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, W, H);

    var tableRect = null;
    try {
      var bg = await loadImage(opts.tableSrc || DEFAULT_TABLE);
      tableRect = drawContain(ctx, bg, W, H, 10);
    } catch (e) {
      // fallback rect (almost full)
      tableRect = { x: 10, y: 10, w: W - 20, h: H - 20 };
    }

    // items
    var list = (opts.items || []).slice(0, 6);
    var layout = makeSlots(tableRect);
    var slots = layout.slots;

    // Scale rule: based on table inner width, keep items clearly visible
    var baseTargetW = Math.max(56, layout.innerW / 5.2); // bigger than before

    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var src = resolveSprite(it);
      if (!src) continue;

      var s = slots[i] || slots[slots.length - 1];
      var cx = s.cx + randBetween(-layout.innerW * 0.06, layout.innerW * 0.06);
      var cy = s.cy + randBetween(-layout.innerH * 0.06, layout.innerH * 0.06);
      var rot = randBetween(-0.18, 0.18);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        // Per item slight variance
        var targetW = baseTargetW * randBetween(0.92, 1.10);
        // prevent huge objects
        targetW = Math.min(targetW, layout.innerW / 2.4);

        var sc = targetW / iw;
        var dw = iw * sc;
        var dh = ih * sc;

        // Clamp center inside table inner rect
        var minX = tableRect.x + layout.innerPad + dw / 2;
        var maxX = tableRect.x + tableRect.w - layout.innerPad - dw / 2;
        var minY = tableRect.y + layout.innerPad + dh / 2;
        var maxY = tableRect.y + tableRect.h - layout.innerPad - dh / 2;
        if (cx < minX) cx = minX;
        if (cx > maxX) cx = maxX;
        if (cy < minY) cy = minY;
        if (cy > maxY) cy = maxY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // shadow on table
        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 22;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 12;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // skip
      }
    }
  }

  window.VEVA_TABLETOP = window.VEVA_TABLETOP || {};
  window.VEVA_TABLETOP.render = render;
})();
