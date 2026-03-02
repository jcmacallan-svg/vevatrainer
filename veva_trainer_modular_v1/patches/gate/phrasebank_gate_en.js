// patches/gate/phrasebank_gate_en.js
(function () {
  window.VEVA_PHRASES = window.VEVA_PHRASES || {};
  const P = window.VEVA_PHRASES;

  /**
   * Map "mood" -> response "band".
   * Bands are about how cooperative/verbose the phrasing is.
   */
  function bandFromMood(moodKey) {
    if (moodKey === "relaxed") return "open";
    if (moodKey === "neutral") return "cautious";
    if (moodKey === "mixed") return "cautious";
    if (moodKey === "nervous") return "evasive";
    if (moodKey === "irritated") return "evasive";
    return "cautious";
  }

  /**
   * After being asked "why are you nervous/cautious/etc?" and answering,
   * the character typically relaxes a bit — except when truly irritated.
   * This is a lightweight helper your dialogue logic can optionally apply.
   */
  function nextMoodAfterWhy(moodKey) {
    if (moodKey === "nervous") return "neutral";
    if (moodKey === "mixed") return "neutral";
    if (moodKey === "neutral") return "relaxed";
    if (moodKey === "relaxed") return "relaxed";
    if (moodKey === "irritated") return "irritated"; // stays prickly
    return "neutral";
  }

  /**
   * Optional: when the guard keeps pressing and the character is irritated,
   * responses get shorter/snubbier.
   * Your logic can pick "pressed_details" -> "pressed_details_2" -> "pressed_details_3"
   * depending on how many times they are pressed.
   */
  function snubLevelFromPressCount(pressCount) {
    if (pressCount >= 3) return 3;
    if (pressCount === 2) return 2;
    return 1;
  }

  P.gate = {
    bandFromMood,
    nextMoodAfterWhy,
    snubLevelFromPressCount,

    // --- ID / entry mechanics -------------------------------------------------
    ask_id: {
      open: [
        "Sure — here you go.",
        "Of course. Here’s my ID.",
        "No problem — one second.",
        "Absolutely. It’s right here.",
        "Yep, got it.",
      ],
      cautious: [
        "Alright. Here you go.",
        "Sure. One moment.",
        "Yes — here’s my ID.",
        "Okay. Here.",
        "Right — here you are.",
      ],
      evasive: [
        "Can I show it without handing it over?",
        "I’d prefer to keep hold of it — you can see it here.",
        "Sure — I’ll hold it up for you.",
        "I can show it, yeah. I just don’t want it to leave my sight.",
        "Here — take a look.",
      ],
    },

    return_id: {
      open: [
        "Thanks — appreciate it.",
        "Thank you very much.",
        "Great, thanks.",
        "Perfect — thank you.",
        "Cheers. Thanks.",
      ],
      cautious: ["Thank you.", "Thanks.", "Alright, thanks.", "Got it. धन्यवाद— sorry, habit. Thanks.", "Okay. Thank you."],
      evasive: [
        "Thanks.",
        "Finally. Thanks.",
        "Yeah. Thanks.",
        "Alright.",
        "Mm. Thanks.",
      ],
    },

    sign_in: {
      open: [
        "Sure — where do you need me to sign?",
        "No problem. Just point me to the log.",
        "Of course — I can sign in now.",
        "Yep. Name and time, right?",
      ],
      cautious: [
        "Okay. Where do I sign?",
        "Sure.",
        "Alright — the logbook?",
        "Fine. Let me know what you need.",
      ],
      evasive: [
        "Do you need full details or just name and time?",
        "Can I do initials and time?",
        "I can sign, sure — what exactly do you need on the form?",
        "Alright. Just tell me what fields you require.",
      ],
    },

    // --- Purpose / appointment ------------------------------------------------
    purpose: {
      open: [
        "I’m here to see someone inside.",
        "I’m here for a quick visit — checking in with my contact.",
        "I’m here for a scheduled visit with someone upstairs.",
        "I’m here to meet my point of contact and get sorted.",
      ],
      cautious: [
        "I’m here to see someone.",
        "I’m here for a meeting.",
        "I’m here to check in with my contact.",
        "I’m here on site business.",
      ],
      evasive: [
        "It’s a work thing.",
        "It’s personal.",
        "I’m just here to check in.",
        "I’m here to get access sorted.",
        "Do I need to go into that here?",
      ],
    },

    has_appointment_yes: {
      open: [
        "Yes — it’s scheduled.",
        "Yeah, I’m expected.",
        "I’ve got it arranged, yes.",
        "Yes, it’s on the calendar.",
        "Yes — I’m booked in.",
      ],
      cautious: ["Yes.", "Yes, I’m expected.", "That’s right.", "Yes — it’s arranged.", "Correct."],
      evasive: [
        "Yes… can we move on?",
        "Yes, I’m expected.",
        "Yeah — it’s sorted.",
        "Yes, I was told to come down and check in.",
        "Yes. I’m just trying to get inside on time.",
      ],
    },

    has_appointment_no: {
      open: [
        "Not a formal appointment — I’m here to check in with my contact.",
        "Not exactly; I was told to come by and they’d meet me at reception.",
        "No calendar invite, but they’re expecting me.",
        "Not a scheduled slot, but my contact said to come in and ask for them.",
      ],
      cautious: [
        "Not a formal appointment.",
        "No, but I was told to check in at reception.",
        "No — I’m expected, just not on the calendar.",
        "Not officially. My contact said to come now.",
      ],
      evasive: [
        "Not a formal one.",
        "No. I was told to check in here.",
        "No, but it’s arranged.",
        "No appointment — I’m just supposed to get signed in.",
      ],
    },

    // --- Meeting details (fixed to be plausible; no "appointment today" weirdness) ---
    about_meeting: {
      open: [
        "It’s a quick check-in about site access and today’s work.",
        "It’s about getting my visitor badge and going up to my contact.",
        "It’s a short coordination meeting — just confirming access and next steps.",
        "It’s for an on-site visit — paperwork, briefing, and then I’m escorted up.",
        "It’s about a routine handover and confirming what needs doing today.",
      ],
      cautious: [
        "It’s about access and getting checked in.",
        "It’s a quick on-site check-in.",
        "It’s for visitor access and a brief chat with my contact.",
        "It’s a short coordination meeting.",
        "It’s just to confirm details and get escorted up.",
      ],
      evasive: [
        "It’s just a routine check-in.",
        "It’s admin and access stuff.",
        "It’s not sensitive — I just don’t want to discuss details out here.",
        "I’m here to check in and be escorted. That’s all.",
        "It’s for a quick handover. I’d rather keep it brief here.",
      ],
    },

    who_meeting: {
      open: [
        "I’m meeting {pocFull}.",
        "I’m expected by {pocFull}.",
        "My point of contact is {pocFull}.",
        "I’m here to see {pocFull}.",
        "I’m checking in with {pocFull} at reception.",
      ],
      cautious: [
        "I’m meeting {pocRank} {pocLast}.",
        "I’m expected by {pocRank} {pocLast}.",
        "A colleague inside — {pocRank} {pocLast}.",
        "I’m checking in for {pocRank} {pocLast}.",
        "It’s with {pocRank} {pocLast}, yes.",
      ],
      evasive: [
        "Someone inside.",
        "A contact at reception.",
        "I’d rather not say names out loud.",
        "My contact’s inside — reception can call them.",
        "I’m expected; if you ring up, they’ll confirm.",
      ],
    },

    meeting_time: {
      open: [
        "We said around {meetingTime}.",
        "They asked me to arrive for {meetingTime}.",
        "It’s for {meetingTime}, give or take.",
        "I was told to come in at {meetingTime}.",
      ],
      cautious: ["Around {meetingTime}.", "{meetingTime}.", "I was told {meetingTime}.", "Roughly {meetingTime}."],
      evasive: [
        "It’s now-ish. I’m checking in as instructed.",
        "I was told to come by reception and they’d take it from there.",
        "I’m expected — the timing should be on their side.",
      ],
    },

    meeting_location: {
      open: [
        "Reception first, then I’m headed up to {meetingPlace}.",
        "I’m supposed to check in here and then go to {meetingPlace}.",
        "They said to meet at {meetingPlace} after I get a badge.",
      ],
      cautious: [
        "I’m checking in at reception, then {meetingPlace}.",
        "{meetingPlace}, after I’m signed in.",
        "Reception, then upstairs.",
      ],
      evasive: [
        "Reception will direct me.",
        "I’m supposed to be escorted from here.",
        "I was told to check in here first.",
      ],
    },

    // --- “Pressed for details” (more plausible elaboration options) -----------
    pressed_details: {
      open: [
        "It’s pretty straightforward — I’m here to check in, get a visitor badge, and my contact will escort me to where we’re meeting.",
        "I can explain: I’m a visitor today, checking in with {pocFull}. After the logbook and badge, they’ll come down and take me up.",
        "Sure. I’m expected upstairs; this is just the standard check-in. Once you call my contact, they’ll confirm and I’ll wait in reception.",
      ],
      cautious: [
        "It’s a routine check-in: sign in, badge, then my contact confirms and escorts me.",
        "I’m here to check in with my contact and follow the visitor process.",
        "It’s standard — call my point of contact and they’ll confirm.",
      ],
      evasive: [
        "It’s just a normal visitor check-in. If you call my contact, they’ll confirm.",
        "I’m not trying to be difficult — I just don’t want to discuss more in the lobby.",
        "Reception can verify it. I’m expected and I’ll wait here.",
      ],
    },

    // Snubbier follow-ups if repeatedly pressed (especially when irritated)
    pressed_details_2: {
      open: [
        "If it helps, I also have the details here — name, contact, and arrival time. I just need to be checked in the usual way.",
        "No problem — here’s the info you need: I’m meeting {pocFull}, arriving around {meetingTime}, and I’ll wait until they collect me.",
      ],
      cautious: [
        "I’ve told you what I can: visitor check-in, contact confirms, then escort.",
        "I’m here to check in with {pocRank} {pocLast}. You can call and confirm.",
      ],
      evasive: [
        "I’ve answered that.",
        "Please just call my contact.",
        "I’m not discussing it further out here.",
      ],
    },

    pressed_details_3: {
      open: [
        "I don’t mind clarifying, but I’d rather keep details private — the contact can confirm it in one call.",
      ],
      cautious: ["Please call my contact. That’s the fastest way to confirm."],
      evasive: ["Call them. Or I’ll leave."],
    },

    // --- “Why are you nervous/cautious/irritated?” ----------------------------
    why_mood: {
      open: [
        "Oh — nothing major. I’m just trying to be on time, that’s all.",
        "Sorry, didn’t mean to come off that way. Long morning — I’m fine.",
        "All good. I’m just a bit rushed today.",
        "No issue — I appreciate you doing your job. I’m okay.",
      ],
      cautious: [
        "Just a bit rushed, that’s all.",
        "Nothing personal — I’m fine.",
        "I’m okay. Just trying to get this sorted quickly.",
        "Sorry. Busy day.",
      ],
      evasive: [
        "I’m fine.",
        "Just tired.",
        "It’s been a day.",
        "Nothing to do with you. Can we continue?",
        "I don’t want to get into it.",
      ],
    },

    // If the guard responds well and the character calms down (optional line)
    acknowledge_and_relax: {
      open: [
        "Thanks — I appreciate it.",
        "Yeah, sorry about that. Thanks for your help.",
        "Alright. Appreciate you sorting it.",
      ],
      cautious: ["Thanks.", "Okay, thank you.", "Alright."],
      evasive: ["Fine.", "Thanks.", "Yeah."],
    },

    // --- Small talk / procedural questions -----------------------------------
    belongings: {
      open: [
        "No problem — I don’t have anything restricted. Just my phone and keys.",
        "Sure. I’ve only got the basics — phone, keys, wallet.",
        "Nothing unusual — just a small bag and my phone.",
      ],
      cautious: ["Just the basics.", "Phone, keys, wallet.", "A small bag, that’s it."],
      evasive: [
        "Nothing you need to worry about.",
        "Just personal items.",
        "Just my phone and keys.",
        "Do you need a full list?",
      ],
    },

    prohibited_items_no: {
      open: [
        "No, nothing like that.",
        "No — nothing prohibited.",
        "No. Just normal personal stuff.",
      ],
      cautious: ["No.", "No, nothing prohibited.", "No."],
      evasive: ["No.", "Nothing like that.", "No — can we move on?"],
    },

    waiting: {
      open: [
        "No problem — I can wait here.",
        "Sure. I’ll wait in reception.",
        "Absolutely — I’ll stand over there.",
      ],
      cautious: ["Okay, I’ll wait here.", "Alright.", "Sure."],
      evasive: ["Fine.", "Okay.", "Yeah."],
    },

    thanks_guard: {
      open: ["Thanks for your help.", "Appreciate it.", "Thank you — I know it’s procedure."],
      cautious: ["Thanks.", "Thank you.", "Okay, thanks."],
      evasive: ["Yeah.", "Thanks.", "Mm."],
    },
  };
})();
