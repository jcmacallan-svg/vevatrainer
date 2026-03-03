// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";

  // Hard guarantee: modal never opens automatically.
  // Opens ONLY after user clicks the thumbnail canvas.

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
    // draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { W: cssW, H: cssH };
  }

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
  }

  function randBetween(min, max) { return min + Math.random() * (max - min); }


  function isBannedItemName(name){
    if (!name) return false;
    return (/twelve\s*gun/i).test(String(name));
  }
  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";
  var ITEM_SPRITES = {
    "Wallet": "assets/items/wallet.png",
    "Notebook": "assets/items/notebook.png",
    "Phone": "assets/items/phone.png",
    "Keys": "assets/items/keys.png",
    "Joint": "assets/items/joint.png",
    "Cigarette": "assets/items/cigarette.png",
    "Comb": "assets/items/comb.png",
    "Glasses": "assets/items/glasses.png",
    "Headphones": "assets/items/headphones.png",
    "ID": "assets/items/ID.png",
    "USB": "assets/items/USB.png",
    "Labello": "assets/items/labello.png",
    "Knife": "assets/items/knife.png",
    "Gun": "assets/items/gun.png",
    "Whiskey": "assets/items/whiskey.png",
    "Small pocket knife": "assets/items/knife.png",
    "Pistol": "assets/items/gun.png"
  };

  function ensureModal() {
    var existing = document.getElementById("psTableModal");
    if (existing) return existing;

    var modal = document.createElement("div");
    modal.id = "psTableModal";
    modal.className = "psTableModal";
    modal.setAttribute("hidden", "hidden");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML =
      '<div class="psTableModalBackdrop" data-close="1"></div>' +
      '<div class="psTableModalPanel" role="dialog" aria-modal="true">' +
        '<button class="psTableModalClose" type="button" aria-label="Close" data-close="1">✕</button>' +
        '<canvas id="psTableCanvasLarge" class="psTableCanvasLarge"></canvas>' +
      '</div>';

    document.body.appendChild(modal);

    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("hidden", "hidden");
    }

    modal._close = close;

    modal.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    // Force closed on creation
    close();
    return modal;
  }

  function forceCloseModal() {
    var modal = document.getElementById("psTableModal");
    if (!modal) return;
    if (modal._close) modal._close();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("hidden", "hidden");
  }

  function openModal() {
    var modal = ensureModal();
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("open");
  }

  function getTableBounds(W, H) {
    var padX = Math.round(W * 0.10);
    var padY = Math.round(H * 0.14);
    return { x: padX, y: padY, w: W - padX * 2, h: H - padY * 2 };
  }

  async function drawScene(ctx, W, H, tableSrc, items, opts) {
    opts = opts || {};
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, W, H);

    try {
      var bg = await loadImage(tableSrc || DEFAULT_TABLE);
      drawContain(ctx, bg, W, H, 18);
    } catch (e) {}

    var list = (items || []).slice(0, 6);
    var bounds = getTableBounds(W, H);

    var cols = 3, rows = 2;
    var slotW = bounds.w / cols;
    var slotH = bounds.h / rows;

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var src = it.src || it.sprite || ITEM_SPRITES[it.name];
      if (!src) continue;

      var col = i % cols;
      var row = Math.floor(i / cols);

      var cx = bounds.x + (col + 0.5) * slotW + randBetween(-slotW * 0.08, slotW * 0.08);
      var cy = bounds.y + (row + 0.5) * slotH + randBetween(-slotH * 0.08, slotH * 0.08);

      var rot = randBetween(-0.18, 0.18);
      var targetW = Math.min(slotW, slotH) * (opts.itemScale || 0.85);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {}
    }
  }

  function ensureHintOverlay(container) {
    if (!container) return;
    var existing = container.querySelector(".psEnlargeHint");
    if (existing) return existing;

    var hint = document.createElement("div");
    hint.className = "psEnlargeHint";
    hint.innerHTML = '<span class="psEnlargeIcon">🔍➕</span><span class="psEnlargeText">Click to enlarge</span>';
    container.appendChild(hint);
    return hint;
  }

  async function render(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = opts.items || [];

    // Critical: never open modal during navigation/render
    forceCloseModal();

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // hint overlay
    if (canvas.parentElement) ensureHintOverlay(canvas.parentElement);

    // bind click once
    if (!canvas._psClickBound) {
      canvas._psClickBound = true;
      canvas.style.cursor = "zoom-in";
      canvas.addEventListener("click", function () {
        openModal(); // ONLY here
        var large = document.getElementById("psTableCanvasLarge");
        if (!large) return;
        var ctxL = large.getContext("2d");
        var sizeL = fitCanvasToCssSize(large, ctxL);
        drawScene(ctxL, sizeL.W, sizeL.H, tableSrc, items, { itemScale: 0.95 });
      });
    }

    var ctx = canvas.getContext("2d");
    var size = fitCanvasToCssSize(canvas, ctx);
    await drawScene(ctx, size.W, size.H, tableSrc, items, { itemScale: 0.85 });
  }

  window.VEVA_TABLETOP = window.VEVA_TABLETOP || {};
  window.VEVA_TABLETOP.render = render;
  window.VEVA_TABLETOP.close = forceCloseModal;

  // Safety: close any leftover modal on script load
  try { forceCloseModal(); } catch (e) {}
})();
