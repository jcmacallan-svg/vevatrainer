// boot.js
window.BUILD = { version: "8.0.5-modular+v1_7_20", name: "VEVA Ingang/Uitgang Trainer", date: "2026-03-02" };

(function () {
  // Safety stub for legacy cached patches
  if (typeof window.applyChecklistLabels !== 'function') window.applyChecklistLabels = function(){ return null; };
  const qp = new URLSearchParams(location.search);
  const v = qp.get("v") || String(Date.now());
  window.__ASSET_VER__ = v;

  function load(src, cb) {
    const s = document.createElement("script");
    s.src = src + "?v=" + encodeURIComponent(v);
    // NOTE: dynamically injected scripts don't reliably honor `defer` across browsers.
    // Keep ordering via callback chaining and force sync-like behavior.
    s.async = false;
    s.onload = cb || function () {};
    s.onerror = function () {
      // If a patch file is missing on GitHub Pages, the old loader would stall forever.
      // Continue boot so the app still loads, and show a small on-screen warning.
      try {
        console.warn("Failed to load", s.src);
        const id = "vevaBootWarn";
        let bar = document.getElementById(id);
        if (!bar) {
          bar = document.createElement("div");
          bar.id = id;
          bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;"+
            "background:rgba(180,60,60,0.92);border:1px solid rgba(255,255,255,0.18);"+
            "color:#fff;padding:10px 12px;border-radius:12px;font:12px/1.35 system-ui, -apple-system, Segoe UI, Roboto, Arial;"+
            "box-shadow:0 12px 40px rgba(0,0,0,0.45);";
          document.body.appendChild(bar);
        }
        const msg = document.createElement("div");
        msg.textContent = "⚠️ Failed to load: " + src + " (app will continue).";
        bar.appendChild(msg);
      } catch (e) {}
      // IMPORTANT: continue boot chain.
      (cb || function(){})();
    };
    document.head.appendChild(s);
  }

  load("config.js", function () {
    load("patches/shared/logger.js", function(){
      load("patches/shared/intents_shared_en.js", function () {
        load("patches/shared/phrasebank_shared_en.js", function () {

          load("patches/gate/intents_gate_en.js", function () {
            load("patches/gate/phrasebank_gate_en.js", function () {
              load("patches/gate/flow_gate.js", function(){

                load("patches/person_search/intents_person_search_en.js", function(){
                  load("patches/person_search/phrasebank_person_search_en.js", function(){
                    load("patches/person_search/visuals_person_search.js", function(){
                      load("patches/person_search/tabletop_renderer.js", function(){
                        load("patches/person_search/item_pills_ui.js", function(){
                          load("patches/person_search/flow_person_search.js", function(){

                        load("patches/sign_in/intents_signin_en.js", function(){
                          load("patches/sign_in/phrasebank_signin_en.js", function(){
                            load("patches/sign_in/flow_signin.js", function(){

                              load("patches/return_pass/intents_return_en.js", function(){
                                load("patches/return_pass/phrasebank_return_en.js", function(){
                                  load("patches/return_pass/flow_return.js", function(){
                                    load("app.js");
                                  });
                                });
                              });

                            });
                          });
                        });

                          });
                        });
                      });
                    });
                  });
                });

              });
            });
          });

        });
      });
    });
  });
})();
