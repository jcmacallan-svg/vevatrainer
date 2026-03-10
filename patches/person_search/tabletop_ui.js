// patches/person_search/tabletop_ui.js
(function(){
  "use strict";

  function injectStyle(){
    if (document.getElementById('psTabletopStyle')) return;
    var s = document.createElement('style');
    s.id = 'psTabletopStyle';
    s.textContent = "\
.psTableThumbWrap{position:relative; width:100%; max-width:760px; margin:10px auto 6px; border-radius:14px; border:1px solid var(--border); overflow:hidden; background:rgba(255,255,255,0.03); cursor:pointer;}\
.psTableThumb{display:block; width:100%; height:190px;}\
.psTableHint{position:absolute; top:10px; right:10px; padding:6px 10px; border-radius:999px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.16); color:rgba(255,255,255,0.92); font-size:12px; letter-spacing:0.2px; display:flex; gap:6px; align-items:center; user-select:none;}\
.psTableHint .mag{font-size:13px; opacity:0.95;}\
#psTableModal{position:fixed; inset:0; z-index:9999; display:none;}\
#psTableModal[aria-hidden='false']{display:block;}\
.psTableModalBackdrop{position:absolute; inset:0; background:rgba(0,0,0,0.72);}\
.psTableModalCard{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:min(1100px,92vw); height:min(720px,84vh); border-radius:16px; border:1px solid rgba(255,255,255,0.14); background:rgba(10,14,20,0.92); box-shadow:0 18px 60px rgba(0,0,0,0.55); overflow:hidden;}\
.psTableBig{width:100%; height:100%; display:block;}\
.psTableModalTop{position:absolute; top:10px; left:12px; right:12px; display:flex; justify-content:space-between; align-items:center; pointer-events:none;}\
.psTableModalTop .tip{pointer-events:none; padding:6px 10px; border-radius:999px; background:rgba(0,0,0,0.42); border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.9); font-size:12px;}\
.psTableModalTop .closeBtn{pointer-events:auto; border:none; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.92); border-radius:999px; padding:6px 10px; cursor:pointer;}\
/* hide old item cards */\
#psCards{display:none !important;}\
";
    document.head.appendChild(s);
  }

  function ensureUI(){
    injectStyle();

    var panel = document.getElementById('personSearchPanel');
    if (!panel) return;

    // Update subtext
    var sub = panel.querySelector('.cardSub');
    if (sub) sub.textContent = 'You see the following items on the table:';

    var body = panel.querySelector('.cardBody');
    if (!body) return;

    // Insert thumbnail once
    if (!document.getElementById('psTableThumb')){
      var wrap = document.createElement('div');
      wrap.className = 'psTableThumbWrap';
      wrap.id = 'psTableThumbWrap';
      wrap.setAttribute('title','Click to enlarge');

      var c = document.createElement('canvas');
      c.className = 'psTableThumb';
      c.id = 'psTableThumb';
      wrap.appendChild(c);

      var hint = document.createElement('div');
      hint.className = 'psTableHint';
      hint.innerHTML = '<span class="mag">🔍＋</span><span>Click to enlarge</span>';
      wrap.appendChild(hint);

      // place after psOutfit
      var outfit = document.getElementById('psOutfit');
      if (outfit && outfit.parentNode === body){
        body.insertBefore(wrap, outfit.nextSibling);
      } else {
        body.insertBefore(wrap, body.firstChild);
      }

      wrap.addEventListener('click', function(){
        openModal();
      });
    }

    // Modal once
    if (!document.getElementById('psTableModal')){
      var modal = document.createElement('div');
      modal.id = 'psTableModal';
      modal.setAttribute('aria-hidden','true');

      var backdrop = document.createElement('div');
      backdrop.className = 'psTableModalBackdrop';
      modal.appendChild(backdrop);

      var card = document.createElement('div');
      card.className = 'psTableModalCard';

      var top = document.createElement('div');
      top.className = 'psTableModalTop';
      top.innerHTML = '<div class="tip">Click outside or press Esc to close</div>';

      var btn = document.createElement('button');
      btn.className = 'closeBtn';
      btn.type = 'button';
      btn.textContent = 'Close';
      top.appendChild(btn);

      card.appendChild(top);

      var big = document.createElement('canvas');
      big.className = 'psTableBig';
      big.id = 'psTableBig';
      card.appendChild(big);

      modal.appendChild(card);
      document.body.appendChild(modal);

      function close(){ closeModal(); }
      backdrop.addEventListener('click', close);
      btn.addEventListener('click', close);
      window.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
    }
  }

  function openModal(){
    var modal = document.getElementById('psTableModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden','false');
    // render big view on open
    try{
      var ps = (window.state && window.state.ps) ? window.state.ps : null;
      if (ps && window.VEVA_TABLETOP && window.VEVA_TABLETOP.render){
        window.VEVA_TABLETOP.render({
          canvasId: 'psTableBig',
          tableSrc: 'assets/table/tafelachtergrond.png',
          items: (ps.items || []).slice(0,6)
        });
      }
    }catch(e){}
  }

  function closeModal(){
    var modal = document.getElementById('psTableModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
  }

  // Run after DOM ready
  function boot(){
    ensureUI();
    // also re-ensure when panel becomes visible
    var obs = new MutationObserver(function(){ ensureUI(); });
    obs.observe(document.body, { subtree:true, childList:true, attributes:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
