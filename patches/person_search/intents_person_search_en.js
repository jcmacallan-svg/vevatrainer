// patches/person_search/intents_person_search_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }
  add("ps_any_sharp", /\b(sharp objects|anything sharp|knives|blades)\b/i);
  add("ps_empty_pockets", /\b(empty your pockets|take everything out|place (your )?items on (the )?table)\b/i);
  add("ps_remove_cap", /\b(take off|remove).*(cap|hat)\b/i);
  add("ps_remove_jacket", /\b(take off|remove).*(jacket|coat)\b/i);
  add("ps_position_arms", /\b(spread|extend).*(arms).*(palms up|palms facing up)\b/i);
  add("ps_position_legs", /\b(spread).*(legs|feet)\b/i);
  add("ps_search_areas", /\b(armpit|waist|private parts|groin)\b/i);
  add("ps_leg_on_knee", /\b(put|place).*(leg).*(knee)\b/i);
  add("ps_found_something", /\b(i feel|i found|something in your pocket|take it out|remove it)\b/i);
  add("ps_clear", /\b(you are clear|all clear|you can go|proceed)\b/i);
})();
