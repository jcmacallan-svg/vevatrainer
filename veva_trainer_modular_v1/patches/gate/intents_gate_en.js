// patches/gate/intents_gate_en.js
(function(){
  window.VEVA_INTENTS = window.VEVA_INTENTS || [];
  function add(key, rx){ window.VEVA_INTENTS.push({ key, rx }); }

  add("ask_name", /\b(what('?s)? your name|who are you|identify yourself|name please)\b/i);
  add("ask_surname", /\b(last name|surname)\b/i);
  add("purpose", /\b(reason for (your )?(visit|being here)|what are you doing here|what brings you here|purpose of (your )?(visit|trip))\b/i);
  add("has_appointment", /\b(do you have an appointment|are you expected|is it scheduled)\b/i);
  add("who_meeting", /\b(with whom|who(m)? are you (here )?to see|who is your appointment with|appointment with|who are you meeting)\b/i);
  add("time_meeting", /\b(what time|when).*(appointment|meeting)\b/i);
  add("about_meeting", /\b(what('?s)?).*(appointment|meeting).*(about|for)\b/i);
  add("where_meeting", /\b(where).*(appointment|meeting)\b/i);

  add("dob_q", /\b(date of birth|dob|when were you born|birthdate)\b/i);
  add("nat_q", /\b(nationality|citizenship|where are you from)\b/i);
  add("spell_last_name", /\b(spell).*(surname|last name)\b/i);

  add("rules_contraband", /\b(drugs|alcohol|weapons).*(not allowed|forbidden|prohibited)\b/i);
  add("search_announce", /\b(you will be searched|routine search|security search)\b/i);
})();
