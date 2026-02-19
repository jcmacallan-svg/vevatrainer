// patches/shared/logger.js
(function(){
  const CFG = window.CONFIG || {};
  const ENDPOINT = CFG.logEndpoint || "";
  const BATCH_EVERY = Number(CFG.logBatchEvery || 1);
  const buf = [];
  let counter = 0;

  function nowIso(){ return new Date().toISOString(); }

  async function flush(){
    if (!ENDPOINT || !buf.length) { buf.length = 0; return; }
    const payload = { events: buf.splice(0, buf.length) };
    try{
      await fetch(ENDPOINT, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload), keepalive:true });
    }catch(e){
      try{
        const k = "veva.offlineLog";
        const prev = JSON.parse(localStorage.getItem(k) || "[]");
        prev.push(payload);
        localStorage.setItem(k, JSON.stringify(prev).slice(0, 2_000_000));
      }catch{}
      console.warn("Logging failed:", e);
    }
  }

  window.VEVA_LOG = async function(event){
    try{
      buf.push({ t: nowIso(), ...event });
      counter++;
      if (counter % BATCH_EVERY === 0) await flush();
    }catch(e){ console.warn("VEVA_LOG error", e); }
  };
  window.VEVA_LOG_FLUSH = flush;
})();
