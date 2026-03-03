VEVA Tabletop patch (patch-only)

Deze zip bevat ALLEEN patch-files (geen index.html / styles.css), zodat je niet per ongeluk je app overschrijft.

Plaats de bestanden in je project op dezelfde paden:
- patches/person_search/tabletop_renderer.js
- patches/person_search/tabletop_ui.js

Boot.js:
Voeg 2 loads toe in de person_search chain, NA visuals_person_search.js en VOOR flow_person_search.js:
  load("patches/person_search/visuals_person_search.js", function(){
    load("patches/person_search/tabletop_renderer.js", function(){
      load("patches/person_search/tabletop_ui.js", function(){
        load("patches/person_search/flow_person_search.js", function(){

Als je al een hook in app.js hebt die VEVA_TABLETOP.render aanroept voor het thumbnail canvas, dan blijft dat werken.
De UI patch injecteert zelf:
- thumbnail canvas (psTableThumb) + hint rechtsboven
- modal canvas (psTableBig) die alleen opent na klik
- verbergt de oude item-cards (#psCards)

