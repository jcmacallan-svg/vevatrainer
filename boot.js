// boot.js
window.BUILD = { version: "7.4.15", name: "VEVA Ingang/Uitgang Trainer", date: "2026-02-23" };

(function () {
  var qp = new URLSearchParams(location.search);
  var v = qp.get("v") || String(Date.now());
  window.__ASSET_VER__ = v;

  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + "?v=" + encodeURIComponent(v);
    s.defer = true;
    s.onload = cb || function () {};
    s.onerror = function () { console.warn("Failed to load", s.src); (cb||function(){})(); };
    document.head.appendChild(s);
  }

  // These files are optional in THIS zip. If you already have richer versions, keep yours.
  load("config.js", function () {
    load("phrasebank.js", function(){
      load("intents_patch_en.js", function () {
        load("app.js", function () {
          load("checklist_patch.js", function(){
            load("v7_4_12_patch_v2.js");
          });
        });
      });
    });
  });
})();