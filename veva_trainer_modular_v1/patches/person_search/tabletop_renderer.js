// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";

  const imgCache = new Map();

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error("No src"));
      if (imgCache.has(src)) return resolve(imgCache.get(src));

      const img = new Image();
      img.onload = () => { imgCache.set(src, img); resolve(img); };
      img.onerror = () => reject(new Error("Failed to load: " + src));
      img.src = src;
    });
  }

  function drawCover(ctx, img, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const s = Math.max(w / iw, h / ih);
    const dw = iw * s, dh = ih * s;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Default table background provided in this zip:
  const DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Map item names -> sprite paths (you can add/adjust later).
  // Each sprite should be a single PNG with transparency.
  const ITEM_SPRITES = {
    "Phone": "assets/items/phone.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Access email printout": "assets/items/printout.png"
  };

  async function render(opts) {
    opts = opts || {};
    const canvasId = opts.canvasId || "psTableCanvas";
    const tableSrc = opts.tableSrc || DEFAULT_TABLE;
    const items = Array.isArray(opts.items) ? opts.items.slice(0, 6) : [];

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background
    try {
      const bg = await loadImage(tableSrc);
      drawCover(ctx, bg, W, H);
    } catch (e) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    // 3x2 slots
    const slots = [
      { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.30 }, { x: 0.78, y: 0.30 },
      { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.70 }
    ];

    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      const slot = slots[i] || slots[slots.length - 1];

      const src = it.src || it.sprite || ITEM_SPRITES[it.name];
      const cx = slot.x * W + randBetween(-18, 18);
      const cy = slot.y * H + randBetween(-12, 12);
      const rot = randBetween(-0.18, 0.18);
      const scale = randBetween(0.32, 0.42);

      if (!src) {
        // placeholder card when no sprite exists
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        const pw = 220, ph = 90;
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath(); ctx.roundRect(-pw/2, -ph/2, pw, ph, 14); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillRect(-pw/2, -ph/2, pw, ph); ctx.strokeRect(-pw/2, -ph/2, pw, ph);
        }
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(it.name || "Unknown item"), 0, 0);
        ctx.restore();
        continue;
      }

      try {
        const img = await loadImage(src);
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;

        const targetW = W * scale;
        const s = targetW / iw;
        const dw = iw * s;
        const dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e) {
        // skip failing sprite loads
      }
    }
  }

  window.VEVA_TABLETOP = { render: render };
})();
