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

  function drawCover(ctx, img, w, h) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var s = Math.max(w / iw, h / ih);
    var dw = iw * s, dh = ih * s;
    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Pas dit aan naar jouw assets
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Mapping name -> sprite (optioneel; je kunt ook it.src meesturen)
  var ITEM_SPRITES = {
    "Phone": "assets/items/phone.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Access email printout": "assets/items/printout.png"
  };

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = opts.items || [];

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    try {
      var bg = await loadImage(tableSrc);
      drawCover(ctx, bg, W, H);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    var list = items.slice(0, 6);

    // 3x2 slots
    var slots = [
      { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.30 }, { x: 0.78, y: 0.30 },
      { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.70 }
    ];

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var slot = slots[i] || slots[slots.length - 1];

      var src = it.src || it.sprite || ITEM_SPRITES[it.name];

      // positie/rotatie/schaal
      var cx = slot.x * W + randBetween(-18, 18);
      var cy = slot.y * H + randBetween(-12, 12);
      var rot = randBetween(-0.18, 0.18);
      var scale = randBetween(0.32, 0.42);

      if (!src) continue;

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

        // Schaduw
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {
        // skip
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
