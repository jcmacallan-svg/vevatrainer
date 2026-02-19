// patches/shared/intents_shared_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }

  add("greet", /\b(hello|hi|good morning|good afternoon|good evening)\b/i);
  add("help_open", /\b(how can i help|how may i help|can i help you|what can i do for you)\b/i);

  add("press_for_answer", /\b(i need an answer|answer my question|you must answer|otherwise entry will be denied|no answer no entry)\b/i);
  add("contact_supervisor", /\b(i( will|'ll)? (contact|call|talk to|speak to) (my )?supervisor|let me talk to (my )?supervisor)\b/i);

  add("go_person_search", /\b(go to|walk to|proceed to).*(person search|search area)\b/i);
  add("go_sign_in", /\b(go to|walk to|proceed to).*(sign(-|\s)?in|reception)\b/i);

  add("ask_id", /\b(can i see|show me|may i see).*(id|identification|passport)\b/i);
  add("return_id", /\b(return|here'?s).*(id|passport)\b/i);

  add("deny", /\b(deny|refuse).*(entry|access)\b/i);
})();
