// patches/sign_in/intents_signin_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }
  add("si_wear_visible", /badge.*(visible|show)/i);
  add("si_return_pass", /return.*(pass|badge)/i);
  add("si_alarm", /(alarm|assembly|rally point)/i);
  add("si_close", /(close|closing|16:00|four)/i);
})();
