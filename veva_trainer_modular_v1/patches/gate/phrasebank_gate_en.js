// patches/gate/phrasebank_gate_en.js
(function(){
  window.VEVA_PHRASES = window.VEVA_PHRASES || {};
  const P = window.VEVA_PHRASES;

  function bandFromMood(moodKey){
    if (moodKey === "relaxed") return "open";
    if (moodKey === "neutral") return "cautious";
    if (moodKey === "mixed") return "cautious";
    if (moodKey === "nervous") return "evasive";
    if (moodKey === "irritated") return "evasive";
    return "cautious";
  }

  P.gate = {
    bandFromMood,
    ask_id: { open:["Of course — here’s my ID."], cautious:["Alright. Here you go."], evasive:["Can I show it without handing it over?"] },
    return_id: { open:["Thank you very much."], cautious:["Thank you."], evasive:["Finally."] },
    purpose: { open:["I'm here to see someone."], cautious:["I'm here to see someone."], evasive:["It’s personal.","Why do I need to tell you?"] },
    has_appointment_yes: { open:["Yes — it’s scheduled."], cautious:["Yes."], evasive:["Yes… can we move on?"] },
    about_meeting: { open:["It’s about contractor access today."], cautious:["It’s about access today."], evasive:["It’s private.","I’d rather not say."] },

    who_meeting: {
      open: [
        "I\'m meeting {pocFull}.",
        "I\'m expected by {pocFull}.",
        "My point of contact is {pocFull}.",
        "I\'m here to see {pocFull}.",
      ],
      cautious: [
        "I\'m meeting {pocRank} {pocLast}.",
        "I\'m expected by {pocRank} {pocLast}.",
        "A colleague inside — {pocRank} {pocLast}.",
      ],
      evasive: [
        "Someone inside.",
        "A contact at reception.",
        "I\'d rather not say names out loud.",
      ]
    }
  };
})();
