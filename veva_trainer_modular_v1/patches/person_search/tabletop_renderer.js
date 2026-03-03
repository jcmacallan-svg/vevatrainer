// patches/person_search/tabletop_renderer.js
(function () {
  "use strict";
  var imgCache = {};
  function loadImage(src){return new Promise(function(res,rej){if(!src)return rej(new Error("No src"));if(imgCache[src])return res(imgCache[src]);var i=new Image();i.onload=function(){imgCache[src]=i;res(i);};i.onerror=function(){rej(new Error("Failed to load: "+src));};i.src=src;});}
  function fitCanvasToCssSize(c,ctx){var dpr=window.devicePixelRatio||1;var r=c.getBoundingClientRect();var w=Math.max(1,Math.round(r.width));var h=Math.max(1,Math.round(r.height));var nw=Math.round(w*dpr), nh=Math.round(h*dpr);if(c.width!==nw||c.height!==nh){c.width=nw;c.height=nh;}ctx.setTransform(dpr,0,0,dpr,0,0);return {W:w,H:h};}
  function randBetween(a,b){return a+Math.random()*(b-a);}
  function drawContain(ctx,img,w,h,pad){
    pad=pad||18;
    var iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
    var aw=Math.max(1,w-pad*2), ah=Math.max(1,h-pad*2);
    var s=Math.min(aw/iw, ah/ih);
    var dw=iw*s, dh=ih*s;
    var dx=(w-dw)/2, dy=(h-dh)/2;
    ctx.drawImage(img,dx,dy,dw,dh);
    ctx.save();
    var g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.25,w/2,h/2,Math.max(w,h)*0.62);
    g.addColorStop(0,"rgba(0,0,0,0)");
    g.addColorStop(1,"rgba(0,0,0,0.22)");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.restore();
    return {x:dx,y:dy,w:dw,h:dh};
  }
  var DEFAULT_TABLE="assets/table/tafelachtergrond.png";
  var ITEM_SPRITES={
    "Cigarette":"assets/items/cigarette.png",
    "Comb":"assets/items/comb.png",
    "Glasses":"assets/items/glasses.png",
    "Gun":"assets/items/gun.png",
    "Headphones":"assets/items/headphones.png",
    "ID":"assets/items/ID.png",
    "Joint":"assets/items/joint.png",
    "Keys":"assets/items/keys.png",
    "Small pocket knife":"assets/items/knife.png",
    "Knife":"assets/items/knife.png",
    "Labello":"assets/items/labello.png",
    "Notebook":"assets/items/notebook.png",
    "Phone":"assets/items/phone.png",
    "USB":"assets/items/USB.png",
    "Wallet":"assets/items/wallet.png",
    "Whiskey":"assets/items/whiskey.png"
  };
  function normalizeName(n){if(!n)return"";var s=String(n);if(s.toLowerCase().indexOf("twelve gun")>=0)return"";return s;}
  function slotsInRect(r){return[
    {x:r.x+r.w*0.22,y:r.y+r.h*0.32},{x:r.x+r.w*0.50,y:r.y+r.h*0.32},{x:r.x+r.w*0.78,y:r.y+r.h*0.32},
    {x:r.x+r.w*0.22,y:r.y+r.h*0.70},{x:r.x+r.w*0.50,y:r.y+r.h*0.70},{x:r.x+r.w*0.78,y:r.y+r.h*0.70}
  ];}
  async function renderToCanvas(canvas,items,opts){
    opts=opts||{};
    var ctx=canvas.getContext("2d"); if(!ctx) return;
    var sz=fitCanvasToCssSize(canvas,ctx); var W=sz.W,H=sz.H;
    ctx.clearRect(0,0,W,H);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
    var bgRect={x:0,y:0,w:W,h:H};
    try{var bg=await loadImage(opts.tableSrc||DEFAULT_TABLE);bgRect=drawContain(ctx,bg,W,H,opts.pad||18)||bgRect;}catch(e){ctx.fillStyle="#0b1220";ctx.fillRect(0,0,W,H);}
    var list=(items||[]).slice(0,6); var slots=slotsInRect(bgRect);
    var baseScale=opts.baseScale||0.19, jitterX=opts.jitterX||(bgRect.w*0.03), jitterY=opts.jitterY||(bgRect.h*0.03);
    for(var i=0;i<list.length;i++){
      var it=list[i]||{}; var nm=normalizeName(it.name); if(!nm) continue;
      var src=it.src||it.sprite||ITEM_SPRITES[nm]; if(!src) continue;
      var s0=slots[i]||slots[slots.length-1];
      var cx=s0.x+randBetween(-jitterX,jitterX), cy=s0.y+randBetween(-jitterY,jitterY), rot=randBetween(-0.18,0.18);
      try{
        var img=await loadImage(src);
        var iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
        var targetW=bgRect.w*baseScale;
        var factor=1.0, low=nm.toLowerCase();
        if(low.indexOf("headphones")>=0) factor=0.85;
        if(low.indexOf("gun")>=0) factor=0.95;
        if(low.indexOf("knife")>=0) factor=1.05;
        var sc=(targetW/iw)*factor, dw=iw*sc, dh=ih*sc;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot);
        ctx.shadowColor="rgba(0,0,0,0.33)"; ctx.shadowBlur=opts.shadowBlur||22; ctx.shadowOffsetX=opts.shadowOffsetX||10; ctx.shadowOffsetY=opts.shadowOffsetY||14;
        ctx.drawImage(img,-dw/2,-dh/2,dw,dh);
        ctx.restore();
      }catch(e2){}
    }
  }

  var modalEl=null, modalCanvas=null, lastItems=[], lastTableSrc=DEFAULT_TABLE;

  function ensureModal(){
    if(modalEl) return;
    modalEl=document.createElement("div");
    modalEl.id="psTableModal";
    modalEl.setAttribute("hidden","hidden");
    modalEl.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;z-index:9999;";
    var card=document.createElement("div");
    card.style.cssText="width:min(1100px,92vw);height:min(720px,78vh);background:rgba(15,20,30,0.92);border:1px solid rgba(255,255,255,0.12);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.45);position:relative;padding:14px;display:flex;flex-direction:column;";
    var title=document.createElement("div");
    title.textContent="Tabletop view";
    title.style.cssText="color:rgba(255,255,255,0.92);font:600 14px system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:2px 0 10px 2px;";
    card.appendChild(title);
    var closeBtn=document.createElement("button");
    closeBtn.type="button"; closeBtn.textContent="×"; closeBtn.setAttribute("aria-label","Close");
    closeBtn.style.cssText="position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);font:700 20px/32px system-ui,-apple-system,Segoe UI,Roboto,Arial;cursor:pointer;";
    closeBtn.onclick=closeModal;
    card.appendChild(closeBtn);
    modalCanvas=document.createElement("canvas");
    modalCanvas.id="psTableCanvasModal";
    modalCanvas.style.cssText="width:100%;height:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.03);display:block;flex:1;";
    card.appendChild(modalCanvas);
    modalEl.appendChild(card);
    document.body.appendChild(modalEl);
    modalEl.addEventListener("click",function(e){if(e.target===modalEl) closeModal();});
    document.addEventListener("keydown",function(e){if(e.key==="Escape") closeModal();});
  }

  function openModal(){
    ensureModal();
    modalEl.removeAttribute("hidden");
    setTimeout(function(){
      renderToCanvas(modalCanvas,lastItems,{tableSrc:lastTableSrc,pad:18,baseScale:0.23,shadowBlur:26,shadowOffsetX:12,shadowOffsetY:18});
    },0);
  }
  function closeModal(){ if(!modalEl) return; modalEl.setAttribute("hidden","hidden"); }

  function ensureHintOverlay(wrap){
    if(!wrap) return;
    if(wrap.querySelector(".psEnlargeHint")) return;
    wrap.style.position="relative";
    var hint=document.createElement("div");
    hint.className="psEnlargeHint";
    hint.style.cssText="position:absolute;top:8px;right:10px;display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.92);font:600 12px system-ui,-apple-system,Segoe UI,Roboto,Arial;pointer-events:none;";
    hint.innerHTML='<span style="font-size:13px;line-height:1">[+]</span><span>Click to enlarge</span>';
    wrap.appendChild(hint);
  }

  async function render(opts){
    opts=opts||{};
    var canvas=document.getElementById(opts.canvasId||"psTableCanvas");
    if(!canvas) return;

    lastItems=(opts.items||[]).slice(0,6);
    lastTableSrc=opts.tableSrc||DEFAULT_TABLE;

    ensureHintOverlay(canvas.parentElement);

    if(!canvas.__veva_ps_clickBound){
      canvas.__veva_ps_clickBound=true;
      canvas.style.cursor="zoom-in";
      canvas.addEventListener("click",function(){ openModal(); });
    }

    await renderToCanvas(canvas,lastItems,{tableSrc:lastTableSrc,pad:18,baseScale:0.19,shadowBlur:20,shadowOffsetX:10,shadowOffsetY:14});
  }

  window.VEVA_TABLETOP={ render: render, close: closeModal };
})();