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
    ask_id: { open:["Of course — here’s my ID."], cautious:["Uhm well I guess so. Here you go."], evasive:["Do you really need to see it?"] },
    return_id: { open:["Thank you very much."], cautious:["I hope there is nothing wrong, thank you."], evasive:["Thanks"] },
    purpose: { open:["I'm here to see someone."], cautious:["I'm here to see someone."], evasive:["Do you need to know?.","Why do I need to tell you?"] },
    has_appointment_yes: { open:["Yes — it’s scheduled."], cautious:["Yes."], evasive:["Yes… can we hurry up!"] },
    about_meeting: { open:["I have a complaint","I was told to come over repairs."], cautious:["Uhm.. I am not certain I think they wanted me to come over to take a look at something."], evasive:["It’s private.","I’d rather not say."] },

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
