\
/* patches/person_search/tabletop_renderer.js */
(function(){
  "use strict";

  var imgCache = {};
  function loadImage(src){
    return new Promise(function(resolve, reject){
      if(!src) return reject(new Error("No src"));
      if(imgCache[src]) return resolve(imgCache[src]);
      var img = new Image();
      img.onload = function(){ imgCache[src]=img; resolve(img); };
      img.onerror = function(){ reject(new Error("Failed to load: "+src)); };
      img.src = src;
    });
  }

  function fitCanvasToCssSize(canvas, ctx){
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var cssW = Math.max(1, Math.round(rect.width));
    var cssH = Math.max(1, Math.round(rect.height));
    var need = canvas.width !== Math.round(cssW*dpr) || canvas.height !== Math.round(cssH*dpr);
    if(need){
      canvas.width = Math.round(cssW*dpr);
      canvas.height = Math.round(cssH*dpr);
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {W: cssW, H: cssH};
  }

  function drawContain(ctx, img, W, H, pad){
    pad = pad || 14;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var availW = Math.max(1, W - pad*2);
    var availH = Math.max(1, H - pad*2);

    var s = Math.min(availW/iw, availH/ih);
    var dw = iw*s, dh = ih*s;
    var dx = (W - dw)/2;
    var dy = (H - dh)/2;

    ctx.drawImage(img, dx, dy, dw, dh);

    ctx.save();
    var g = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.65);
    g.addColorStop(0,"rgba(0,0,0,0)");
    g.addColorStop(1,"rgba(0,0,0,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    return {x: dx, y: dy, w: dw, h: dh};
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function randBetween(a,b){ return a + Math.random()*(b-a); }

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
    "whiskey": "assets/items/whiskey.png",

    "Phone": "assets/items/phone.png",
    "Wallet": "assets/items/wallet.png",
    "Keys": "assets/items/keys.png",
    "Notebook": "assets/items/notebook.png",
    "ID": "assets/items/ID.png",
    "Cigarette": "assets/items/cigarette.png",
    "Glasses": "assets/items/glasses.png",
    "Knife": "assets/items/knife.png",
    "Gun": "assets/items/gun.png",
    "Whiskey": "assets/items/whiskey.png",
    "USB": "assets/items/USB.png",
    "Labello": "assets/items/labello.png",
    "Comb": "assets/items/comb.png",
    "Headphones": "assets/items/headphones.png",
    "Joint": "assets/items/joint.png"
  };

  function makeSlots(rect){
    var padX = rect.w * 0.10;
    var padY = rect.h * 0.12;
    var x0 = rect.x + padX;
    var y0 = rect.y + padY;
    var w = rect.w - padX*2;
    var h = rect.h - padY*2;

    var cols = 3, rows = 2;
    var slots = [];
    for(var r=0;r<rows;r++){
      for(var c=0;c<cols;c++){
        slots.push({
          x: x0 + (c+0.5)*(w/cols),
          y: y0 + (r+0.5)*(h/rows),
          cellW: w/cols,
          cellH: h/rows
        });
      }
    }
    return slots;
  }

  async function renderToCanvas(canvasId, tableSrc, items){
    var canvas = document.getElementById(canvasId);
    if(!canvas) return;

    var ctx = canvas.getContext("2d");
    if(!ctx) return;

    var size = fitCanvasToCssSize(canvas, ctx);
    var W = size.W, H = size.H;

    ctx.clearRect(0,0,W,H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    var rect = null;
    try{
      var bg = await loadImage(tableSrc || DEFAULT_TABLE);
      rect = drawContain(ctx, bg, W, H, 14);
    }catch(e){
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0,0,W,H);
      rect = {x: 0, y: 0, w: W, h: H};
    }

    var list = Array.isArray(items) ? items.slice(0,6) : [];
    var slots = makeSlots(rect);

    for(var i=0;i<list.length;i++){
      var it = list[i] || {};
      var name = it.name || it.key || it.id || "";
      var lower = String(name).toLowerCase();
      var src = it.src || it.sprite || ITEM_SPRITES[name] || ITEM_SPRITES[lower];
      if(!src) continue;

      var slot = slots[i] || slots[slots.length-1];

      var targetW = slot.cellW * 0.55;
      var targetH = slot.cellH * 0.55;

      var cx = slot.x + randBetween(-slot.cellW*0.08, slot.cellW*0.08);
      var cy = slot.y + randBetween(-slot.cellH*0.08, slot.cellH*0.08);
      var rot = randBetween(-0.18, 0.18);

      cx = clamp(cx, rect.x + rect.w*0.12, rect.x + rect.w*0.88);
      cy = clamp(cy, rect.y + rect.h*0.16, rect.y + rect.h*0.86);

      try{
        var img = await loadImage(src);
        var iw = img.naturalWidth || img.width;
        var ih = img.naturalHeight || img.height;

        var s = Math.min(targetW/iw, targetH/ih);
        var dw = iw*s, dh = ih*s;

        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(rot);

        ctx.shadowColor = "rgba(0,0,0,0.33)";
        ctx.shadowBlur = 22;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 14;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
        ctx.restore();
      }catch(e2){}
    }
  }

  function openModal(){
    var m = document.getElementById("psTableModal");
    if(!m) return;
    m.hidden = false;
  }
  function closeModal(){
    var m = document.getElementById("psTableModal");
    if(!m) return;
    m.hidden = true;
  }
  function bindUIOnce(){
    if(bindUIOnce._did) return;
    bindUIOnce._did = true;

    var thumb = document.getElementById("psTableThumb");
    if(thumb){
      thumb.addEventListener("click", function(){ openModal(); });
      thumb.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openModal(); }
      });
    }

    var modal = document.getElementById("psTableModal");
    if(modal){
      modal.addEventListener("click", function(e){
        var t = e.target;
        if(t && t.getAttribute && t.getAttribute("data-close")==="1") closeModal();
      });
    }

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeModal();
    });
  }

  window.VEVA_TABLETOP = {
    render: async function(opts){
      opts = opts || {};
      bindUIOnce();

      var tableSrc = opts.tableSrc || DEFAULT_TABLE;
      var items = opts.items || [];

      await renderToCanvas(opts.canvasId || "psTableCanvas", tableSrc, items);

      var modal = document.getElementById("psTableModal");
      if(modal && modal.hidden === false){
        await renderToCanvas("psTableCanvasModal", tableSrc, items);
      }
    },
    openModal: openModal,
    closeModal: closeModal
  };
})();
