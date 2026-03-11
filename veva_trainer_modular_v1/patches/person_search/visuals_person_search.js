// patches/person_search/visuals_person_search.js
(function(){
  // Visual helpers for Person Search
  // - Outfit stays simple (cap/jacket/bag + style)
  // - Items: max 6 total
  // - ~20% chance of 1 illegal item
  //   Illegal items (per your definition): knife, pistol, twelve-gun, joint, whisky
  window.VEVA_PS_VISUALS = {
    makeOutfit(rng){
      rng = rng || Math.random;
      return {
        cap: rng() < 0.5,
        jacket: rng() < 0.5,
        bag: rng() < 0.55,
        style: rng() < 0.5 ? "casual" : "workwear"
      };
    },

    makeItems(rng){
      rng = rng || Math.random;
      var illegalChance = 0.20;
      var hasIllegal = rng() < illegalChance;

      // Put your PNG files in: assets/items/<filename>.png
      // Name strings should match your renderer mapping.
      var legalPool = [
        { name:"Wallet", where:"right pocket", kind:"legal" },
        { name:"Keys", where:"left pocket", kind:"legal" },
        { name:"Phone", where:"jacket pocket", kind:"legal" },
        { name:"Notebook", where:"bag", kind:"legal" },
        { name:"ID", where:"wallet", kind:"legal" },
        { name:"USB", where:"bag", kind:"legal" },
        { name:"Glasses", where:"jacket pocket", kind:"legal" },
        { name:"Headphones", where:"bag", kind:"legal" },
        { name:"Comb", where:"right pocket", kind:"legal" },
        { name:"Labello", where:"left pocket", kind:"legal" },
        { name:"Cigarette", where:"right pocket", kind:"legal" }
      ];

      // Illegal/contraband pool (per your definition)
      var illegalPool = [
        { name:"Knife", where:"right pocket", kind:"illegal" },
        { name:"Gun", where:"waistband", kind:"illegal" },      // pistol
        { name:"Twelve gun", where:"bag", kind:"illegal" },     // shotgun-like; maps to gun.png unless you add a dedicated sprite
        { name:"Joint", where:"left pocket", kind:"illegal" },
        { name:"Whisky", where:"bag", kind:"illegal" }
      ];

      function pickOne(arr){
        return arr[Math.floor(rng()*arr.length)];
      }

      function uniqByName(items){
        var seen = {};
        var out = [];
        for (var i=0;i<items.length;i++){
          var k = items[i].name;
          if (seen[k]) continue;
          seen[k]=1;
          out.push(items[i]);
        }
        return out;
      }

      // max 6 total: pick 3–5 legal, plus optional 1 illegal
      var nLegal = 3 + Math.floor(rng()*3); // 3..5
      var items = [];
      // sample legal without replacement
      var pool = legalPool.slice();
      for (var i=0;i<nLegal && pool.length;i++){
        var idx = Math.floor(rng()*pool.length);
        items.push(pool.splice(idx,1)[0]);
      }

      if (hasIllegal){
        items.push(pickOne(illegalPool));
      }

      items = uniqByName(items);

      // hard cap 6 (if you later expand pools)
      if (items.length > 6) items = items.slice(0,6);

      return { items: items, hasIllegal: hasIllegal };
    }
  };
})();