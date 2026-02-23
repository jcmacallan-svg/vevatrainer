// phrasebank.js (optional stub)
window.PS_PATCH = window.PS_PATCH || {
  bandFromMoodKey: function(k){
    // relaxed/neutral => open/cautious; nervous/irritated => cautious/evasive
    if (k === "relaxed") return "open";
    if (k === "neutral") return "cautious";
    if (k === "mixed") return "cautious";
    if (k === "nervous") return "evasive";
    if (k === "irritated") return "evasive";
    return "cautious";
  },
  QA: {}
};