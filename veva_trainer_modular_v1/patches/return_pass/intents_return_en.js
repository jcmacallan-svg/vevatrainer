// patches/return_pass/intents_return_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }
  add("rp_return_pass", /return.*(pass|badge)/i);
  add("rp_stop", /(stop|come back|wait)/i);
})();
