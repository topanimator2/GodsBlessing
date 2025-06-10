EntityEvents.death(event => {
  let OBJECTIVE_ID = 'undead_death'
  let entity = event.getEntity();
  let attacker
  if (attacker = event.getSource().getPlayer()) {
    if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:angel")) {
      let board = attacker.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      if (attacker) {
        if(entity.isUndead()) {
        let score = board.getOrCreatePlayerScore(attacker.getName().getString(), objective);
        score.add(1)
        }
      }
    }
  }
})
// server_scripts/gold_values.js
// server_scripts/gold_values.js

// 0️⃣ Universal ingredient extractor
global.getIngredients = function(json) {
  switch (json.type) {
    case 'minecraft:crafting_shapeless':
      return json.ingredients || [];
    case 'minecraft:crafting_shaped': {
      var list = [];
      for (var r = 0; r < json.pattern.length; r++) {
        var row = json.pattern[r];
        for (var c = 0; c < row.length; c++) {
          var ch = row.charAt(c);
          if (ch === ' ') continue;
          var entry = json.key[ch];
          if (!entry) continue;
          if (Array.isArray(entry)) {
            for (var i = 0; i < entry.length; i++) list.push(entry[i]);
          } else list.push(entry);
        }
      }
      return list;
    }
    case 'minecraft:smithing':
    case 'minecraft:stonecutting':
      return json.ingredient ? [json.ingredient]
           : json.input      ? [json.input]
           : [];
    default:
      return json.ingredients || (json.input ? [json.input] : []);
  }
};

// 1️⃣ Use a plain object for lookup
global.goldValues = {};

// 2️⃣ Recipe‐scanning event
ServerEvents.recipes(function(event) {
  function parseJson(r) {
    return JSON.parse(r.json.toString());
  }

  function countRawGold(json) {
    var ings = global.getIngredients(json);
    var sum  = 0;
    for (var i = 0; i < ings.length; i++) {
      var ing = ings[i];
      var id  = ing.item || ing.tag;
      var cnt = ing.count || 1;
      if (id === 'minecraft:gold_ingot') sum += cnt;
    }
    return sum;
  }

  // 2.1 Seed direct gold recipes
  event.forEachRecipe({}, function(r) {
    var json    = parseJson(r);
    var rawGold = countRawGold(json);
    if (rawGold <= 0) return;

    var outputs = [];
    if (json.results) {
      for (var j = 0; j < json.results.length; j++) {
        var o = json.results[j];
        outputs.push({ item: o.item, count: o.count || 1 });
      }
    } else if (json.result) {
      outputs.push({
        item:  json.result.item,
        count: json.result.count || 1
      });
    }

    outputs.forEach(function(o) {
      var cost = rawGold / o.count;
      var prev = global.goldValues[o.item];
      if (prev === undefined || cost < prev) {
        global.goldValues[o.item] = cost;
      }
    });
  });

  // 2.2 Propagate indirectly
  var changed = true;
  while (changed) {
    changed = false;
    event.forEachRecipe({}, function(r) {
      var json  = parseJson(r);
      var ings  = global.getIngredients(json);
      var total = 0;
      for (var i = 0; i < ings.length; i++) {
        var ing = ings[i];
        var id  = ing.item || ing.tag;
        var cnt = ing.count || 1;
        var val = global.goldValues[id];
        if (val === undefined) { total = NaN; break; }
        total += val * cnt;
      }
      if (!isNaN(total) && total > 0) {
        var outs = json.results ||
                   [{ item: json.result.item, count: json.result.count }];
        outs.forEach(function(o) {
          var cost = total / o.count;
          var prev = global.goldValues[o.item];
          if (prev === undefined || cost < prev) {
            global.goldValues[o.item] = cost;
            changed = true;
          }
        });
      }
    });
  }

  // 3️⃣ Log final table
  console.log('=== Gold-value table ===');
  for (var item in global.goldValues) {
    console.log(item + ' requires ' +
                global.goldValues[item] + ' gold_ingots');
  }
});



PlayerEvents.inventoryChanged(e => {
  	let player = e.getPlayer()
    let inv = player.getInventory()
    if(palladium.superpowers.hasSuperpower(player, "withered_soul:angel")) {
    let mainhand = player.getMainHandItem()
    let invItems = []
    for (let slot = 0; slot <= inv.getSlots(); slot++) {
         invItems.push([inv.getItem(slot), slot])
    }
    let goldItems = invItems.filter(i =>
      global.goldValues[i[0].getId()] !== undefined
    );
    goldItems.forEach(i => {
      console.log(i[0].getDisplayName().getString())
      if(!i[0].getTagElement("blessed")) {
        let name = i[0].getDisplayName().getString()
        console.log(name)
      let holyversion = i[0].copy().withName("Holy "+ name.replace("[", "").replace("]", ""))
      let newTag = new $CompoundTag()
      let blessamount = global.goldValues[i[0].getId()] || 1
      newTag.putDouble("bless_amount", blessamount)
      holyversion.addTagElement("blessed", newTag)
      inv.setStackInSlot(i[1], holyversion)
      }
    })
    }
})

EntityEvents.hurt(event => {
  let OBJECTIVE_ID = 'undead_death'
  let entity = event.getEntity();
  let source = event.getSource()
  if (entity.isUndead()) {
    let attacker
    if (attacker = event.getSource().getPlayer()) {

          let inv = attacker.getInventory()
          let invItems = []
    for (let slot = 0; slot <= inv.getSlots(); slot++) {
         invItems.push([inv.getItem(slot), slot])
    }
    let goldblessednumb = 0
        let goldItems = invItems.filter(i =>
      global.goldValues[i[0].getId()] !== undefined
    );
    goldItems.forEach(i => {goldblessednumb + i.getTagElement("blessed").getDouble("bless_amount")})

                let board = player.getScoreboard();
                let objective = board.getObjective(OBJECTIVE_ID);
                let score = board.getOrCreatePlayerScore(player.getName().getString(), objective);
      if(palladium.superpowers.hasSuperpower(attacker, "withered_soul:angel")) {
              let smite = attacker.getMainHandItem().getEnchantments().get("minecraft:smite") || 0
              let smitebonus = smite(2.5)
              let holysmitebonus = smitebonus+(goldblessednumb)/5
              let angelholysmitebonus = 1.5(smitebonus + (goldblessednumb)/5)

              let mainhanddamage
              if(mainhanddamage = attacker.getMainHandItem().getTagElement("blessed").getDouble("bless_amount")) {
                let mainhandangelholysmitebonus = angelholysmitebonus + 1.5(mainhand)
                entity.actuallyHurt(source, mainhandangelholysmitebonus)
              } else {
                entity.actuallyHurt(source, angelholysmitebonus)
              }
      } else {

      }
    }
  }
})