// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";

  // Minimal tabletop renderer:
  // - draws a wooden table background image
  // - draws up to 6 item PNGs (each item is its own PNG with transparency)
  // - basic 3x2 slot layout, slight rotation, simple shadow

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
    // cover like CSS background-size: cover
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

  // Default background (your provided wooden table)
  const DEFAULT_TABLE = "assets/table/tafelachtergrond.png";

  // Default asset mapping (adjust to your filenames).
  // Expected structure (examples):
  //   assets/items/phone.png, wallet.png, keys.png, notebook.png, ...
  const ITEM_SPRITES = {
    "Phone": "assets/items/phone.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "Access email printout": "assets/items/printout.png"
  };

  async function render({ canvasId, tableSrc, items }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background table
    try {
      const bg = await loadImage(tableSrc || DEFAULT_TABLE);
      drawCover(ctx, bg, W, H);
    } catch (e) {
      // fallback: simple dark fill
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }

    const list = Array.isArray(items) ? items.slice(0, 6) : [];

    // 3x2 slots (percentage positions)
    const slots = [
      { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.30 }, { x: 0.78, y: 0.30 },
      { x: 0.22, y: 0.70 }, { x: 0.50, y: 0.70 }, { x: 0.78, y: 0.70 }
    ];

    for (let i = 0; i < list.length; i++) {
      const it = list[i] || {};
      const slot = slots[i] || slots[slots.length - 1];

      // src priority: item.src/item.sprite -> mapping by name
      const src = it.src || it.sprite || ITEM_SPRITES[it.name];

      const cx = slot.x * W + randBetween(-18, 18);
      const cy = slot.y * H + randBetween(-12, 12);
      const rot = randBetween(-0.18, 0.18); // ~ -10..+10 degrees
      const scale = randBetween(0.32, 0.42); // tweak for your look

      if (!src) continue;

      try {
        const img = await loadImage(src);

        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;

        // Base sizing: scale relative to canvas width
        const targetW = W * scale;
        const s = targetW / iw;
        const dw = iw * s;
        const dh = ih * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Simple shadow to feel "on table"
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e) {
        // ignore load failures
      }
    }
  }

  window.VEVA_TABLETOP = { render };
})();
