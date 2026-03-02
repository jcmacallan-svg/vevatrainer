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
    s.defer = true;
    s.onload = cb || function () {};
    s.onerror = function () { console.warn("Failed to load", s.src); };
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
})();
