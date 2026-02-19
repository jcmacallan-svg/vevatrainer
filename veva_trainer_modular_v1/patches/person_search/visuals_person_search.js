// patches/person_search/visuals_person_search.js
(function(){
  window.VEVA_PS_VISUALS = {
    makeOutfit(){
      return {
        cap: Math.random() < 0.5,
        jacket: Math.random() < 0.5,
        bag: Math.random() < 0.55,
        style: Math.random() < 0.5 ? "casual" : "workwear"
      };
    },
    makeItems(){
      const illegalChance = 0.20;
      const hasIllegal = Math.random() < illegalChance;

      const legalPool = [
        { name:"Wallet", where:"right pocket", kind:"legal" },
        { name:"Keys", where:"left pocket", kind:"legal" },
        { name:"Phone", where:"jacket pocket", kind:"legal" },
        { name:"Access email printout", where:"bag", kind:"legal" },
        { name:"Notebook", where:"bag", kind:"legal" }
      ];
      const illegalPool = [
        { name:"Small pocket knife", where:"right pocket", kind:"illegal" },
        { name:"Cannabis (small bag)", where:"left pocket", kind:"illegal" }
      ];

      const items = [];
      const n = 3 + Math.floor(Math.random()*3);
      for (let i=0;i<n;i++) items.push(legalPool[Math.floor(Math.random()*legalPool.length)]);
      if (hasIllegal) items.push(illegalPool[Math.floor(Math.random()*illegalPool.length)]);

      const seen = new Set(); const uniq = [];
      for (const it of items){
        const k = it.name + "|" + it.where;
        if (seen.has(k)) continue;
        seen.add(k);
        uniq.push(it);
      }
      return { items: uniq, hasIllegal };
    }
  };
})();
