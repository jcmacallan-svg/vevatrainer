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

    var need = (canvas.width !== Math.round(cssW * dpr)) || (canvas.height !== Math.round(cssH * dpr));
    if (need) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { W: cssW, H: cssH };
  }

  function randBetween(min, max) { return min + Math.random() * (max - min); }

  function drawContain(ctx, img, w, h, pad) {
    pad = (pad == null) ? 14 : pad;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;

    var availW = Math.max(1, w - pad * 2);
    var availH = Math.max(1, h - pad * 2);

    var s = Math.min(availW / iw, availH / ih);
    var dw = iw * s, dh = ih * s;
    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    ctx.save();
    var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.65);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  var DEFAULT_TABLE = "assets/table/tafelachtergrond.png";
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
    "whiskey": "assets/items/whiskey.png"
  };

  function normalizeName(name) { return String(name || "").trim().toLowerCase(); }

  function resolveSprite(item) {
    if (!item) return "";
    if (item.src) return item.src;
    if (item.sprite) return item.sprite;
    var k = normalizeName(item.name);
    if (ITEM_SPRITES[k]) return ITEM_SPRITES[k];
    if (k === "id card" || k === "id-card") return ITEM_SPRITES["id"];
    return "";
  }

  function getTableSafeRect(W, H) {
    var pad = 18;
    var x = pad, y = pad, w = W - pad * 2, h = H - pad * 2;
    var inset = 18;
    return { x: x + inset, y: y + inset, w: w - inset * 2, h: h - inset * 2 };
  }

  function layoutSlots(rect, max) {
    var slots = [];
    var cols = 3, rows = 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        slots.push({
          cx: rect.x + rect.w * ((c + 0.5) / cols),
          cy: rect.y + rect.h * ((r + 0.5) / rows)
        });
      }
    }
    return slots.slice(0, max);
  }

  async function drawScene(ctx, W, H, tableSrc, items, scaleFactor) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);

    try {
      var bg = await loadImage(tableSrc || DEFAULT_TABLE);
      drawContain(ctx, bg, W, H, 14);
    } catch (e) {}

    var list = Array.isArray(items) ? items.slice(0, 6) : [];
    var safe = getTableSafeRect(W, H);
    var slots = layoutSlots(safe, 6);

    var baseTarget = Math.min(safe.w / 3, safe.h / 2) * (scaleFactor || 0.60);

    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var src = resolveSprite(it);
      if (!src) continue;

      var slot = slots[i] || slots[slots.length - 1];
      var cx = slot.cx + randBetween(-safe.w * 0.06, safe.w * 0.06);
      var cy = slot.cy + randBetween(-safe.h * 0.05, safe.h * 0.05);
      var rot = randBetween(-0.18, 0.18);

      try {
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        var targetW = baseTarget;
        var aspect = iw / Math.max(1, ih);
        if (aspect > 2.2) targetW *= 0.85;
        if (aspect < 0.6) targetW *= 0.90;

        var s = targetW / iw;
        var dw = iw * s;
        var dh = ih * s;

        cx = Math.max(safe.x + dw * 0.55, Math.min(safe.x + safe.w - dw * 0.55, cx));
        cy = Math.max(safe.y + dh * 0.55, Math.min(safe.y + safe.h - dh * 0.55, cy));

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.shadowColor = "rgba(0,0,0,0.30)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e2) {}
    }
  }

  var bound = false;

  function ensureModal() {
    var existing = document.getElementById("psTableModal");
    if (existing) return existing;

    var modal = document.createElement("div");
    modal.id = "psTableModal";
    modal.className = "psTableModal";
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";

    modal.innerHTML = [
      '<div class="psTableModalBackdrop" data-ps-close="1"></div>',
      '<div class="psTableModalDialog" role="dialog" aria-modal="true" aria-label="Tabletop view">',
      '  <div class="psTableModalHeader">',
      '    <div class="psTableModalTitle">Tabletop view</div>',
      '    <button class="psTableModalClose" type="button" aria-label="Close" data-ps-close="1">×</button>',
      '  </div>',
      '  <div class="psTableModalBody">',
      '    <canvas id="psTableCanvasModal" class="psTableCanvasModal"></canvas>',
      '  </div>',
      '</div>'
    ].join("");

    document.body.appendChild(modal);
    return modal;
  }

  function hideModal() {
    var modal = document.getElementById("psTableModal");
    if (!modal) return;
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
  }

  function showModal() {
    var modal = ensureModal();
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "block";
  }

  function bindOnce() {
    if (bound) return;
    bound = true;

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t) return;
      if (t.getAttribute && t.getAttribute("data-ps-close") === "1") hideModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideModal();
    });

    try { hideModal(); } catch (e) {}
  }

  async function render(opts) {
    bindOnce();

    opts = opts || {};
    var thumbId = opts.canvasId || "psTableCanvas";
    var tableSrc = opts.tableSrc || DEFAULT_TABLE;
    var items = opts.items || [];

    var thumb = document.getElementById(thumbId);
    if (thumb) {
      var tctx = thumb.getContext("2d");
      if (tctx) {
        var ts = fitCanvasToCssSize(thumb, tctx);
        await drawScene(tctx, ts.W, ts.H, tableSrc, items, 0.62);
      }
    }

    var clickEl = thumb;
    var wrap = thumb && thumb.parentElement;
    if (wrap && wrap.classList && wrap.classList.contains("psTableWrap")) clickEl = wrap;

    if (clickEl && !clickEl.__psBound) {
      clickEl.__psBound = true;
      clickEl.addEventListener("click", async function () {
        showModal();
        var canvas = document.getElementById("psTableCanvasModal");
        if (!canvas) return;
        var ctx = canvas.getContext("2d");
        if (!ctx) return;
        var s = fitCanvasToCssSize(canvas, ctx);
        await drawScene(ctx, s.W, s.H, tableSrc, items, 0.74);
      });
    }
  }

  window.VEVA_TABLETOP = window.VEVA_TABLETOP || {};
  window.VEVA_TABLETOP.render = render;
  window.VEVA_TABLETOP.hideModal = hideModal;
})();
