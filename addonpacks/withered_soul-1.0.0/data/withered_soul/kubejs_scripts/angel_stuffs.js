EntityEvents.death(event => {
  let OBJECTIVE_ID = 'undead_death'
  let entity = event.getEntity();
  let attacker
  if (attacker = event.getSource().getPlayer()) {
    if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:angel") || palladium.superpowers.hasSuperpower(attacker, "withered_soul:arch_angel")) {
      let board = attacker.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      if (attacker) {
        if (entity.isUndead()) {
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
global.getIngredients = function (json) {
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
        : json.input ? [json.input]
          : [];
    default:
      return json.ingredients || (json.input ? [json.input] : []);
  }
};

// 1️⃣ Use a plain object for lookup
global.goldValues = {};

// 2️⃣ Recipe‐scanning event
ServerEvents.recipes(function (event) {
  function parseJson(r) {
    return JSON.parse(r.json.toString());
  }

  function countRawGold(json) {
    var ings = global.getIngredients(json);
    var sum = 0;
    for (var i = 0; i < ings.length; i++) {
      var ing = ings[i];
      var id = ing.item || ing.tag;
      var cnt = ing.count || 1;
      if (id === 'minecraft:gold_ingot') sum += cnt;
    }
    return sum;
  }

  // 2.1 Seed direct gold recipes
  event.forEachRecipe({}, function (r) {
    var json = parseJson(r);
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
        item: json.result.item,
        count: json.result.count || 1
      });
    }

    outputs.forEach(function (o) {
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
    event.forEachRecipe({}, function (r) {
      var json = parseJson(r);
      var ings = global.getIngredients(json);
      var total = 0;
      for (var i = 0; i < ings.length; i++) {
        var ing = ings[i];
        var id = ing.item || ing.tag;
        var cnt = ing.count || 1;
        var val = global.goldValues[id];
        if (val === undefined) { total = NaN; break; }
        total += val * cnt;
      }
      if (!isNaN(total) && total > 0) {
        var outs = json.results ||
          [{ item: json.result.item, count: json.result.count }];
        outs.forEach(function (o) {
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


/*
PlayerEvents.inventoryChanged(e => {
  let player = e.getPlayer()
  let inv = player.getInventory()
  if (palladium.superpowers.hasSuperpower(player, "withered_soul:angel")) {
    let mainhand = player.getMainHandItem()
    let invItems = []
    for (let slot = 0; slot <= inv.getSlots(); slot++) {
      invItems.push([inv.getItem(slot), slot])
    }
    let goldItems = invItems.filter(i =>
      global.goldValues[i[0].getId()] !== undefined
    );
    goldItems.forEach(i => {
      if (!i[0].getTagElement("blessed")) {
        let name = i[0].getDisplayName().getString()
        let holyversion = i[0].copy().withName("Holy " + name.replace("[", "").replace("]", ""))
        let newTag = new $CompoundTag()
        let blessamount = global.goldValues[i[0].getId()] || 1
        newTag.putDouble("bless_amount", blessamount)
        holyversion.addTagElement("blessed", newTag)
        inv.setStackInSlot(i[1], holyversion)
      }
    })
  }
})
  */

EntityEvents.hurt(event => {
  let OBJECTIVE_ID = 'undead_death'
  let entity = event.getEntity();
  let source = event.getSource()
    let attacker
    if (attacker = source.getPlayer()) {

      let inv = attacker.getInventory()
      let invItems = []
      for (let slot = 0; slot <= inv.getSlots(); slot++) {
        invItems.push([inv.getItem(slot), slot])
      }
      let goldblessednumb = 0
      let goldItems = invItems.filter(i =>
        global.goldValues[i[0].getId()] !== undefined
      );
      goldItems.forEach(i => { goldblessednumb + i[0].getTagElement("blessed").getDouble("bless_amount") })

      let board = attacker.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      let score = board.getOrCreatePlayerScore(attacker.getName().getString(), objective);
      if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:angel") && entity.isUndead()) {
        let smite = attacker.getMainHandItem().getEnchantments().get("minecraft:smite") || 0
        let smitebonus = 2.5 * smite
        let holysmitebonus = smitebonus + (goldblessednumb) / 5
        let angelholysmitebonus = event.getDamage() + 0.5 * (smitebonus + (score.getScore() / 3) + (goldblessednumb) / 5)

        let mainhand = attacker.getMainHandItem() || 0
        if (global.goldValues[mainhand.getId()] !== undefined) {
          let mainhanddamage = global.goldValues[mainhand.getId()]
          let mainhandangelholysmitebonus = angelholysmitebonus + 1.5 * (mainhanddamage)


          let parts = Math.ceil(mainhandangelholysmitebonus / 30);
          for (let part = 1; part <= parts; part++) {
            // How many items remain before this part?
            let alreadyHandled = (part - 1) * 30;
            let remaining = mainhandangelholysmitebonus - alreadyHandled;

            // This part’s size is 30, except the last part may be smaller
            let size = remaining >= 30 ? 30 : remaining;

            if (mainhandangelholysmitebonus < 30) {
              entity.server.runCommandSilent(`damage ${entity.getUuid()} ${mainhandangelholysmitebonus / 2 || 0} minecraft:player_attack`)
            } else {
              attacker.getServer().scheduleInTicks(40 * part, () => {
                entity.server.runCommandSilent(`damage ${entity.getUuid()} ${size / part} minecraft:player_attack`)

                //  entity.actuallyHurt(source, mainhandangelholysmitebonus)
                let circle = global.getCirclePositions(entity.blockPosition(), 1.5, 0.4);
                circle.forEach(pos => {
                  let circlepackage = global.packageRenderParticleData("born_in_chaos_v1:stunstars", pos.x, pos.y, pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                  attacker.sendData("render_particle", circlepackage)
                })
                attacker.getLevel().getEntities()
                  .filter(e1 => e1.getDistance(entity.blockPosition()) <= 1.5)
                  .filter(e2 => e2 !== entity)
                  .forEach(e3 => {
                    attacker.server.runCommandSilent(`damage ${e3.getUuid()} ${(size / part) / 2} minecraft:player_attack by ${attacker.getUuid()}`)
                  })
              })
            }
          }
        } else {
          attacker.getServer().scheduleInTicks(10, () => {
            attacker.server.runCommandSilent(`damage ${entity.getUuid()} ${angelholysmitebonus} minecraft:player_attack`)
          })
        }
      } else 
        if(palladium.superpowers.hasSuperpower(attacker, "withered_soul:arch_angel")) {
                  let smite = attacker.getMainHandItem().getEnchantments().get("minecraft:smite") || 0
        let smitebonus = 2.5 * smite
        let holysmitebonus = smitebonus + (goldblessednumb) / 5
        let multiplier = 1.2
        if(entity.isUndead()) { multiplier = 2}
        let angelholysmitebonus = event.getDamage() + multiplier * (smitebonus + (score.getScore() / 3) + (goldblessednumb) / 5)

        let mainhand = attacker.getMainHandItem() || 0
        if (global.goldValues[mainhand.getId()] !== undefined) {
          let mainhanddamage = global.goldValues[mainhand.getId()]
          let mainhandangelholysmitebonus = angelholysmitebonus + 1.5 * (mainhanddamage)


          let parts = Math.ceil(mainhandangelholysmitebonus / 50);
          for (let part = 1; part <= parts; part++) {
            // How many items remain before this part?
            let alreadyHandled = (part - 1) * 50;
            let remaining = mainhandangelholysmitebonus - alreadyHandled;

            // This part’s size is 30, except the last part may be smaller
            let size = remaining >= 50 ? 30 : remaining;

            if (mainhandangelholysmitebonus < 50) {
              entity.server.runCommandSilent(`damage ${entity.getUuid()} ${mainhandangelholysmitebonus / 2 || 0} minecraft:player_attack`)
            } else {
              attacker.getServer().scheduleInTicks(60 * part, () => {
                entity.server.runCommandSilent(`damage ${entity.getUuid()} ${size / part} minecraft:player_attack`)

                //  entity.actuallyHurt(source, mainhandangelholysmitebonus)
                let circle = global.getCirclePositions(entity.blockPosition(), 1.5, 0.4);
                circle.forEach(pos => {
                  let circlepackage = global.packageRenderParticleData("born_in_chaos_v1:stunstars", pos.x, pos.y, pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                  attacker.sendData("render_particle", circlepackage)
                })
                attacker.getLevel().getEntities()
                  .filter(e1 => e1.getDistance(entity.blockPosition()) <= 1.5)
                  .filter(e2 => e2 !== entity)
                  .forEach(e3 => {
                    attacker.server.runCommandSilent(`damage ${e3.getUuid()} ${(size / part) / 2} minecraft:player_attack by ${attacker.getUuid()}`)
                  })
              })
            }
          }
        }
    }}
})

// kubejs/server_scripts/hoverOrb.js

// === SPAWN FUNCTION ===
function spawnHoverOrb(level, target, itemId, hoverHeight, followSpeed, fallSpeed, damage, owner) {
  // raw coords
  let x = target.getX();
  let y = target.getY();
  let z = target.getZ();
  // your direct dimension string
  let dim = level.dimension;

  // 1) Summon the item_display _without_ KubeJSPersistentData
  let summonSNBT = `{`
    + `item:{id:"${itemId}",Count:1b},`
    + `interpolation_duration:10,`
    + `transformation:{`
    + `left_rotation:[0.16f,0f,-0.73f,0.928f],`
    + `right_rotation:[-0.278f,-0.306f,0.861f,-0.296f],`
    + `scale:[1.2f,1.2f,1.2f],`
    + `translation:[0f,0f,0f]`
    + `}`
    + `}`;
  level.server.runCommandSilent(
    `execute in ${dim} run summon minecraft:item_display `
    + `${x} ${(y + hoverHeight)} ${z} `
    + summonSNBT
  );

  // 2) Immediately tag the _nearest_ item_display at that spot with your persistent data
  //    so you never have to fiddle with Java NBT APIs in JS.
  let pdSNBT = `{`
    + `KubeJSPersistentData:{`
    + `target:"${target.getUuid().toString()}",`
    + `state:"hover",`
    + `hoverHeight:${hoverHeight}d,`
    + `followSpeed:${followSpeed}d,`
    + `fallSpeed:${fallSpeed}d,`
    + `damage:${damage}d,`
    + `owner:${owner}`
    + `}`
    + `}`;
  level.server.runCommandSilent(
    `execute in ${dim} positioned ${x} ${(y + hoverHeight)} ${z} `
    + `run data merge entity @e[type=minecraft:item_display,limit=1,sort=nearest] `
    + pdSNBT
  );
}

// === RIGHT-CLICK TO SPAWN ===
ItemEvents.rightClicked('minecraft:diamond', function (event) {
  let hit = event.entity.rayTrace(20, true);
  if (!hit || !hit.entity) return;
  spawnHoverOrb(
    event.level,
    hit.entity,
    'minecraft:iron_sword',
    3.0,   // hoverHeight
    0.2,   // followSpeed
    0.5,   // fallSpeed
    0.05,      // damage
    event.entity.getUuid()
  );
});

// === SERVER TICK (uses getPersistentData()) ===
LevelEvents.tick(function (event) {
  let level = event.level
  let orbs = level.getEntities()
  orbs.forEach(orb => {
    try {
      let pd = orb.getPersistentData();
      if (orb.getType() === 'minecraft:item_display'
        && pd
        && pd.contains('target')
        && pd.contains('state')
        && pd.contains(`followSpeed`)
      ) {
        let state = pd.getString('state');
        let hoverH = pd.getDouble('hoverHeight');
        let followSpd = pd.getDouble('followSpeed');
        let fallSpd = pd.getDouble('fallSpeed');
        let dmg = pd.getDouble('damage');
        let targetUUID = pd.getString('target');
        let owner = event.level.getPlayerByUUID(pd.getString('owner'))
          let OBJECTIVE_ID = 'undead_death'
        let board = owner.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      let score = board.getOrCreatePlayerScore(owner.getName().getString(), objective);
        // find your living target
        let target = level.getEntities().find(function (e) {
          return e.getUuid().toString() === targetUUID && e.isAlive();
        });
        if (!target) return orb.kill();
        if(target.isUndead()) {
          dmg = dmg*2
        }
        // safe position fetch
        let pos = orb.position();
        if (!pos) return orb.kill();

        if (state === 'hover') {
          // current orb coords
          let ox = orb.getX();
          let oy = orb.getY();
          let oz = orb.getZ();

          // where we want it
          let desiredY = target.getY() + hoverH;

          // lerp each axis
          let newX = ox + (target.getX() - ox) * followSpd;
          let newY = oy + (desiredY - oy) * followSpd;
          let newZ = oz + (target.getZ() - oz) * followSpd;

          orb.setPosition(newX, newY, newZ);
        }
        else
          if (state === 'fall') {
            // 1) Get each axis from the orb itself
            let ox = orb.getX();
            let oy = orb.getY();
            let oz = orb.getZ();
/*
            // 2) Compute the new Y
            let newY = oy - fallSpd;

            // 3) Move it
            orb.setPosition(ox, newY, oz);
*/  
          event.server.runCommandSilent(
          `execute as ${orb.getUuid()} run data merge entity @s ` +
          `{start_interpolation:0,interpolation_duration:20,` +  // -1 = restart next frame  :contentReference[oaicite:3]{index=3}
          `transformation:{translation:[${ target.getX() -ox}f,${(target.getY() -oy)  +5}f,${target.getZ() -oz}f]}}`
        );
            // 4) Check ground collision
           /* let bx = Math.floor(ox),
              by = Math.floor(newY),
              bz = Math.floor(oz);
            let block = level.getBlock(bx, by, bz);
            
            if (block && block.getBlockState().isSolid()) {
            */
           
           level.server.scheduleInTicks(20, () => { 
            let pos = { x: orb.getX(), y: orb.getY(), z: orb.getZ() };
            let blockAtPos = orb.getLevel().getBlock(
            Math.floor(pos.x),
            Math.floor(pos.y+5),
            Math.floor(pos.z)
          );
            if (blockAtPos.getBlockState().isSolid()) {
              orb.kill();
            } else 
            if(!blockAtPos.getBlockState().isSolid()){
                      event.server.runCommandSilent(
          `execute as ${orb.getUuid()} run data merge entity @s ` +
          `{start_interpolation:0,interpolation_duration:10,` +  // -1 = restart next frame  :contentReference[oaicite:3]{index=3}
          `transformation:{translation:[${ target.getX() -ox}f,${target.getY() -oy}f,${target.getZ() -oz}f]}}`
        );
      }
          })
             level.server.scheduleInTicks(30, () => {
                let circle = global.getCirclePositions(target.blockPosition(), 1.5, 0.4);
                circle.forEach(pos => {
                  let circlepackage = global.packageRenderParticleData("born_in_chaos_v1:stunstars", pos.x, pos.y, pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                  owner.sendData("render_particle", circlepackage)
                })
                owner.getLevel().getEntities()
                  .filter(e1 => e1.getDistance(target.blockPosition()) <= 1.5)
                  .filter(e2 => e2 !== target)
                  .filter(e2 => e2 !== owner)
                  .forEach(e3 => {
                    owner.server.runCommandSilent(`damage ${e3.getUuid()} ${dmg*score.getScore()} minecraft:player_attack by ${owner.getUuid()}`)
                  })
            event.server.runCommandSilent(
                'damage ' + target.getUuid() + ' ' + dmg*score.getScore() + ' minecraft:magic'
             );
                             //  entity.actuallyHurt(source, mainhandangelholysmitebonus
              orb.kill();
             })
          //  }
          }

      }
    } catch (orb) {
      let pd = orb.getPersistentData();
      console.error(`Tick handler NPE at state=${pd?.getString('state')}`, e);
    }
  });
});

// === MAKE ANY ORB FALL ===
function makeOrbFall(orb) {
  let pd = orb.getPersistentData();
  pd.putString('state', 'fall');
  orb.mergeNbt(orb.getNbt().put('KubeJSPersistentData', pd));
}

const ProxyArray    = Java.loadClass('io.github.douira.glsl_transformer.ast.data.ProxyArrayList');
// Fires on every craft, for every output

ItemEvents.crafted(/.*/, event => {
  // Wrap the Java list of ItemStacks in a JS‐array proxy
 let stacks = []
  stacks = event.inventory.getItems()
  let totalBless = 0;

  // Sum all bless_amount from each input slot
  for (let i = 0; i < stacks.length; i++) {
    let stack = stacks[i];
    let tag   = stack.getTagElement('blessed');
    if (tag) {
      totalBless += tag.getDouble('bless_amount');
    }
    console.log(stack)
  }

  // If no inputs were blessed, do nothing
  if (totalBless <= 0) return;

  // Otherwise, attach the combined bless_amount to the output
  const result = event.getItem();
  const newTag = new $CompoundTag();
  newTag.putDouble('bless_amount', totalBless);
  result.addTagElement('blessed', newTag);
  event.getPlayer().give(result)
});
