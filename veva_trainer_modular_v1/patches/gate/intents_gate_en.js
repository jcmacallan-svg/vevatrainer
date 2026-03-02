// patches/gate/intents_gate_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }

  // Put more specific “pressing / meta” intents early so they win matches.
  add("pressed_details", /\b(can you (be )?more specific|more details|tell me more|elaborate|what exactly|explain( that)?|be clearer|details please|give me details)\b/i);
  add("why_mood", /\b(why (are you|you('?re)?) (so )?(nervous|anxious|cautious|irritated|upset)|calm down|what('?s)? wrong|why the attitude|why are you being difficult|no need to be rude)\b/i);

  // Search / frisk / threat level (guard announces search, or explains why)
  add("search_reason", /\b(why (are|do) you (search|pat(-|\s)?down|frisk)(ing)?|what is this search for|why is everyone being searched|because of (an )?(increased|elevated|heightened) threat|threat level)\b/i);
  add("search_announce", /\b(you (will|need to) be searched|routine search|security search|we need to search you|pat(-|\s)?down|frisk|screening|bag check|everyone (gets|is) searched)\b/i);

  // Core identity / visit intents (guard questions)
  add("ask_name", /\b(what('?s)? your name|who are you|identify yourself|name please)\b/i);
  add("ask_surname", /\b(last name|surname)\b/i);
  add("spell_last_name", /\b(spell).*(surname|last name)\b/i);

  add("purpose", /\b(reason for (your )?(visit|being here)|what are you doing here|what brings you here|purpose of (your )?(visit|trip))\b/i);

  add("has_appointment", /\b(do you have an appointment|are you expected|is it scheduled)\b/i);

  add("who_meeting", /\b(with whom|who(m)? are you (here )?to see|who is your appointment with|appointment with|who are you meeting)\b/i);
  add("time_meeting", /\b(what time|when).*(appointment|meeting)\b/i);

  // Broader meeting questions last
  add("about_meeting", /\b(what('?s)?).*(appointment|meeting).*(about|for)\b/i);
  add("where_meeting", /\b(where).*(appointment|meeting)\b/i);

  // Optional profile / rules
  add("dob_q", /\b(date of birth|dob|when were you born|birthdate)\b/i);
  add("nat_q", /\b(nationality|citizenship|where are you from)\b/i);
  add("rules_contraband", /\b(drugs|alcohol|weapons).*(not allowed|forbidden|prohibited)\b/i);
})();
