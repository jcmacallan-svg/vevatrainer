// patches/person_search/phrasebank_person_search_en.js
(function(){
  window.VEVA_PHRASES = window.VEVA_PHRASES || {};
  const P = window.VEVA_PHRASES;

  P.person_search = {
    arrival: {
      nervous: [
        "Um — is this the person search area?",
        "Okay… I’m here for the person search.",
        "Alright — I’m at the person search area."
      ],
      mixed: [
        "Okay — I’m here for the person search.",
        "Alright, this is the person search area, right?",
        "Got it — person search area."
      ],
      neutral: [
        "You arrive at the person search area.",
        "You step into the person search area.",
        "You enter the person search area."
      ],
      relaxed: [
        "You arrive at the person search area.",
        "You head into the person search area.",
        "You walk into the person search area."
      ],
      irritated: [
        "You arrive at the person search area.",
        "You step into the person search area.",
        "You enter the person search area."
      ]
    },

    comply: {
      nervous: ["Okay…", "Alright…", "Um — okay."],
      mixed: ["Okay.", "Alright.", "Sure."],
      neutral: ["Okay.", "Alright.", "Understood.", "Got it."],
      relaxed: ["Sure.", "No problem.", "Alright.", "Okay."],
      irritated: ["Fine.", "Okay.", "Yeah.", "Alright."]
    },

    sharp_q: {
      nervous: [
        "No— no, nothing sharp.",
        "No, I don’t have anything sharp…",
        "No, nothing sharp on me."
      ],
      mixed: [
        "No, nothing sharp.",
        "No — I don’t have anything sharp.",
        "No, not that I’m aware of."
      ],
      neutral: [
        "No, nothing sharp.",
        "No, I don’t have anything sharp.",
        "No — nothing sharp on me.",
        "No, I’m not carrying anything sharp."
      ],
      relaxed: [
        "Nope — nothing sharp.",
        "No, nothing like that.",
        "No, I’m not carrying anything sharp."
      ],
      irritated: [
        "No.",
        "No, nothing sharp.",
        "No — I don’t have anything sharp."
      ]
    },

    pockets_ack: {
      nervous: [
        "Okay — I’ll empty my pockets…",
        "Sure — one second, I’m doing it now.",
        "Okay, okay — I’ll take everything out."
      ],
      mixed: [
        "Okay — I’ll empty my pockets.",
        "Sure. One moment.",
        "Alright — I’ll take everything out now."
      ],
      neutral: [
        "Okay — I’ll empty my pockets.",
        "Sure.",
        "Alright — I’ll take everything out now.",
        "Okay, one moment — emptying my pockets."
      ],
      relaxed: [
        "Sure — emptying them now.",
        "No problem — here you go.",
        "Alright, I’ll empty my pockets."
      ],
      irritated: [
        "Okay — I’m doing it.",
        "Yeah, fine.",
        "Alright, here."
      ]
    },

    cap_ack: {
      nervous: [
        "Oh — okay, I’ll take it off.",
        "Sure… one moment.",
        "Okay, taking it off now."
      ],
      mixed: [
        "Okay, I’ll take it off.",
        "Sure — one moment.",
        "Alright — taking it off now."
      ],
      neutral: [
        "Okay, I’ll take it off.",
        "Sure — one moment.",
        "Alright — taking it off now.",
        "Okay, I’ll remove my cap."
      ],
      relaxed: [
        "Sure thing — off it comes.",
        "No problem — here you go.",
        "Alright, taking it off."
      ],
      irritated: [
        "Okay.",
        "Yeah — one moment.",
        "Fine. Taking it off."
      ]
    },

    jacket_ack: {
      nervous: [
        "Okay — I’ll remove it…",
        "Sure — one second.",
        "Alright, I’m taking it off."
      ],
      mixed: [
        "Alright, I’ll remove it.",
        "Okay.",
        "Sure — I’ll take my jacket off."
      ],
      neutral: [
        "Alright, I’ll remove it.",
        "Okay.",
        "Sure — I’ll take my jacket off.",
        "Okay, removing it now."
      ],
      relaxed: [
        "Sure — taking it off now.",
        "No problem.",
        "Alright, jacket off."
      ],
      irritated: [
        "Okay.",
        "Fine.",
        "Yeah — removing it."
      ]
    },

    found_reply: {
      nervous: [
        "Oh— sorry. Here it is.",
        "I… I forgot I had that. Here.",
        "Sorry — I didn’t realize. Here you go."
      ],
      mixed: [
        "Oh — sorry. Here it is.",
        "Right — I forgot about that. Here.",
        "My bad. Here."
      ],
      neutral: [
        "Oh — sorry. Here it is.",
        "I forgot about that. Here.",
        "Sorry about that — here it is.",
        "Ah, right — here you go."
      ],
      relaxed: [
        "Oh — yep, there it is. Here you go.",
        "Whoops — forgot that was there. Here.",
        "Sure — here you are."
      ],
      irritated: [
        "Yeah, okay — here.",
        "Fine. Here it is.",
        "Alright, take it."
      ]
    },

    // -------------------------
    // NEW KEYS (flow / commands)
    // -------------------------
    remove_items_request: {
      nervous: [
        "Could you please… empty your pockets into the tray?",
        "Please place your pocket items in the tray, okay?"
      ],
      mixed: [
        "Please empty your pockets into the tray.",
        "Could you place everything from your pockets in the tray?"
      ],
      neutral: [
        "Please remove any items from your pockets and place them in the tray.",
        "Could you empty your pockets into the tray, please?",
        "Please place everything from your pockets into the tray."
      ],
      relaxed: [
        "Just pop everything from your pockets into the tray, please.",
        "Whenever you’re ready, empty your pockets into the tray."
      ],
      irritated: [
        "Empty your pockets into the tray.",
        "Everything out of your pockets — into the tray."
      ]
    },

    cooperate_firm: {
      nervous: [
        "Okay — I’ll do whatever you need.",
        "Yes — I’m cooperating."
      ],
      mixed: [
        "Okay — I’ll follow your instructions.",
        "Alright, I’ll cooperate."
      ],
      neutral: [
        "Please cooperate and follow my instructions.",
        "Keep your hands visible and follow directions."
      ],
      relaxed: [
        "Just follow my instructions and we’ll be done quickly.",
        "Hands visible, and we’ll keep it moving."
      ],
      irritated: [
        "Follow instructions.",
        "Hands visible. Don’t reach for anything."
      ]
    },

    // -------------------------
    // NEW KEYS (denials)
    // -------------------------
    deny_drugs: {
      nervous: [
        "No — I don’t have any drugs.",
        "No, absolutely not…"
      ],
      mixed: [
        "No, I don’t have any drugs.",
        "No — nothing like that."
      ],
      neutral: [
        "No, I don’t have any drugs.",
        "No — I’m not carrying drugs.",
        "No, nothing like that on me."
      ],
      relaxed: [
        "Nope — no drugs.",
        "No, nothing like that."
      ],
      irritated: [
        "No.",
        "No — I don’t have drugs."
      ]
    },

    deny_alcohol: {
      nervous: [
        "No — I don’t have any alcohol.",
        "No, I’m not carrying alcohol…"
      ],
      mixed: [
        "No, I don’t have any alcohol.",
        "No — nothing alcoholic."
      ],
      neutral: [
        "No, I don’t have any alcohol.",
        "No — I’m not carrying alcohol.",
        "No, nothing alcoholic."
      ],
      relaxed: [
        "Nope — no alcohol.",
        "No, nothing like that."
      ],
      irritated: [
        "No.",
        "No — I don’t have alcohol."
      ]
    },

    deny_sharp: {
      nervous: [
        "No — no blades, nothing sharp.",
        "No, nothing sharp on me…"
      ],
      mixed: [
        "No — nothing sharp.",
        "No, no blades or anything."
      ],
      neutral: [
        "No, I’m not carrying anything sharp.",
        "No — no blades or sharp objects.",
        "No, nothing sharp."
      ],
      relaxed: [
        "Nope — nothing sharp.",
        "No, nothing like that."
      ],
      irritated: [
        "No.",
        "No — nothing sharp."
      ]
    },

    // -------------------------
    // NEW KEYS (finds)
    // -------------------------
    sharp_found: {
      nervous: [
        "Oh — I didn’t realize that was there.",
        "Wait — that’s mine, but I forgot about it."
      ],
      mixed: [
        "Oh — I forgot about that.",
        "Right — I didn’t realize I still had it."
      ],
      neutral: [
        "It looks like there’s a sharp object here.",
        "I’ve found a sharp item. Please don’t touch it.",
        "There’s a sharp object in your belongings."
      ],
      relaxed: [
        "Looks like there’s a sharp item here — don’t touch it, please.",
        "I’m seeing a sharp object here. Hands visible, please."
      ],
      irritated: [
        "Sharp object.",
        "There’s a blade here. Don’t touch it."
      ]
    },

    alcohol_found: {
      nervous: [
        "Oh — I didn’t mean to bring that in.",
        "Sorry — I forgot that was in my bag."
      ],
      mixed: [
        "Oh — I forgot I had that.",
        "Right — that’s alcohol. Sorry."
      ],
      neutral: [
        "I’ve found alcohol in your belongings.",
        "This appears to be alcohol — it isn’t permitted.",
        "There’s alcohol here. We can’t allow that through."
      ],
      relaxed: [
        "That looks like alcohol — we can’t take that inside.",
        "Alcohol isn’t allowed through — we’ll need to deal with that."
      ],
      irritated: [
        "Alcohol. Not allowed.",
        "You can’t bring this in."
      ]
    },

    drugs_found: {
      nervous: [
        "I… I don’t know how that got there.",
        "Wait — what? That’s not mine."
      ],
      mixed: [
        "I don’t know what that is.",
        "That shouldn’t be there."
      ],
      neutral: [
        "I’ve found suspected drugs in your belongings.",
        "This looks like an illegal substance. Please step aside with me.",
        "I’m seeing suspected drugs — we need to escalate this."
      ],
      relaxed: [
        "I’m seeing suspected drugs here — we need to step aside and sort this out.",
        "Okay — we’re going to escalate this. Please come with me."
      ],
      irritated: [
        "Suspected drugs. Step aside.",
        "We’re escalating this. Now."
      ]
    },

    // -------------------------
    // NEW KEYS (actions)
    // -------------------------
    surrender_request: {
      nervous: [
        "Okay — where should I put it?",
        "Uh — should I place it in the tray?"
      ],
      mixed: [
        "Okay — I’ll put it in the tray.",
        "Alright — placing it down."
      ],
      neutral: [
        "Please place it in the tray.",
        "Set it down here — don’t pass it hand-to-hand.",
        "Place it on the table and step back."
      ],
      relaxed: [
        "Just set it in the tray for me, please.",
        "Place it down right here and step back a bit."
      ],
      irritated: [
        "Put it in the tray.",
        "Set it down. Step back."
      ]
    },

    disposal_or_return_options: {
      nervous: [
        "Okay — can I take it back to my car?",
        "Alright — I can throw it away if needed."
      ],
      mixed: [
        "Okay — I’ll take it back outside.",
        "Alright, I can dispose of it."
      ],
      neutral: [
        "You can dispose of it here or return it to your vehicle.",
        "You’ll need to discard it or take it back outside.",
        "You can surrender it for disposal, or take it away and come back."
      ],
      relaxed: [
        "You can toss it here, or take it back to your car and come back in.",
        "Either dispose of it or return it outside — up to you."
      ],
      irritated: [
        "Dispose of it or take it back outside.",
        "You’re not bringing it in."
      ]
    },

    escalate_notice: {
      nervous: [
        "Okay… what happens now?",
        "Am I in trouble?"
      ],
      mixed: [
        "Alright — what’s the next step?",
        "Okay — I’ll wait."
      ],
      neutral: [
        "I’m going to call a supervisor to assist.",
        "We need to escalate this — please wait here.",
        "I’ll need to involve a supervisor. Stay with me."
      ],
      relaxed: [
        "I’m going to get a supervisor to help us sort this out.",
        "We’ll escalate this properly — just wait here with me."
      ],
      irritated: [
        "Supervisor.",
        "We’re escalating this. Wait here."
      ]
    }
  };
})();
