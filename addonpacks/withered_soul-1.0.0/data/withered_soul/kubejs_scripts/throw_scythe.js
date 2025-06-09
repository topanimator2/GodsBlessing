let spinItems = [
  ["withered_soul:chrono_scythe", 0.8, "return", 2, 13, "none", "none" /*<= clash // stick_in_ground*/, "dropped_model" /*<= dropped_model // basic_model*/, 0.8, 2.5, 15 /*<= Range*/, 
   {
    throwsound: ["minecraft:item.armor.equip_chain", 0.5, 0.7],
    flyingsound: ["minecraft:particle.soul_escape", 1, 0.7],
    hitsound: ["minecraft:block.anvil.place", 0.5, 0.7],
    optionalentityhitsound: ["born_in_chaos_v1:dark_warlblade_atak", 0.5, 0.7],
    boundingbox: [ 
       -1.5, -0.3, -1.5,
        1.5, 0.4, 1.5
      ]
    }
  ]
];
let $AABB = Java.loadClass(`net.minecraft.world.phys.AABB`)
let $CompoundTag = Java.loadClass(`net.minecraft.nbt.CompoundTag`)
let $DamageSource = Java.loadClass('net.minecraft.world.damagesource.DamageSource')
let $DamageSources = Java.loadClass('net.minecraft.world.damagesource.DamageSources')
// Define hitbox radii (in blocks)w

// Helper function to check collision between two entities based on their positions.
function isColliding(entityA, entityB, hitboxA, hitboxB) {
  let dx = entityA.getX() - entityB.getX();
  let dy = entityA.getY() - entityB.getY();
  let dz = entityA.getZ() - entityB.getZ();
  let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance < (hitboxA + hitboxB);
}
const HALF_SECONDS = 0.5;
const SECONDS = HALF_SECONDS * 2;          // change to 1, 0.5, 5 … whatever you need
const INTERVAL = SECONDS * 20;          // ticks between MAIN calls
const HALF = Math.floor(INTERVAL / 2); // ticks between MAIN and HALF
// Right-click: Summon an item_display with a destination, thrower UUID, state, and initial rotation.
// Right-click: Summon an item_display with a destination, thrower UUID, state, and initial rotation.
spinItems.forEach(item => {
  ItemEvents.rightClicked(item[0], event => {
    let player = event.entity;
    let look = player.getLookAngle(); // Returns a vector with x(), y(), z()
    // Use precise positions:
    let pos = { x: player.getX(), y: player.getY(), z: player.getZ() };
    // Calculate destination 12 blocks ahead (adjust multiplier as desired)
    let destX = pos.x + look.x() * item[10];
    let destY = pos.y+1.45 + look.y() * item[10];
    let destZ = pos.z + look.z() * item[10];
    let throwerUuid = player.getUuid();
    let modifiers = player.getMainHandItem().getAttributeModifiers('mainhand').get('generic.attack_damage');
  let attackDamage = item[4]

if (modifiers) {
  modifiers.forEach(modifier => {
    attackDamage += modifier.amount;
  });
}
    // Summon the item_display with persistent data.
    // (The transformation values can be adjusted per model.)
    let command;
    if (item[7] === "dropped_model") {
      command = `/execute in ${player.getLevel().dimension} run summon minecraft:item_display ${player.getX()} ${player.getY() + 1} ${player.getZ()} {item:{id:"${item[0]}",Count:1,tag:${player.getMainHandItem().nbt}},interpolation_duration:${INTERVAL},transformation:{left_rotation:[0f,-0.377f,0f,0.926f],right_rotation:[0f,0f,0.709f,0.706f],scale:[${item[8]}f,${item[8]}f,${item[8]}f],translation:[0f,0f,0f]},KubeJSPersistentData:{destination:[${destX}f,${destY}f,${destZ}f],attackdamage:${attackDamage},thrower:"${throwerUuid}",state:"flying",rotation:0}}`;
    }
    event.server.runCommandSilent(`/playsound ${item[11].throwsound[0]} master @a ${player.getX()} ${player.getY() + 1} ${player.getZ()} ${item[11].throwsound[1]} ${item[11].throwsound[2]}`)
    event.server.runCommandSilent(command);
    let mainhand = player.getMainHandItem()
    let newCount = mainhand.getCount() - 1;
    if (newCount <= 0) {
      player.setMainHandItem(Item.of("minecraft:air"));
    } else {
      mainhand.setCount(newCount);
      player.setMainHandItem(mainhand);
    }  
    let thrownEntities = event.level.getEntities().filter(e => {
      return e.nbt != null &&
        e.nbt.KubeJSPersistentData != null &&
        e.nbt.KubeJSPersistentData.destination != null;
    });

    thrownEntities.forEach(entity => {
      //     event.server.runCommandSilent(`execute as ${entity.getUuid()} run data merge entity @s ` +
      //     `{start_interpolation:0,transformation:{left_rotation:[0f,0.918f,0f,0.397f]}}`)
    })
  });
});

function alignQuat(qPrev, qNext) {
  // q = [x, y, z, w]  (left or right_rotation order)
  const dot = qPrev[0] * qNext[0] + qPrev[1] * qNext[1] +
    qPrev[2] * qNext[2] + qPrev[3] * qNext[3];
  return dot < 0 ? qNext.map(n => -n) : qNext;
}
const Q90 = [0, 0.7071, 0, 0.7071];
const Q180 = [0, 1.0000, 0, 0.0000];
const Q270 = [0, 0.7071, 0, -0.7071];

const TWEEN_TICKS = 1;          // run every tick
const DEG_PER_TICK = -300;
// Tick handler: Update thrown item movement, spin, state transitions, and hitbox collisions.
LevelEvents.tick(event => {
  // Process each thrown entity that has our custom persistent data.
  let thrownEntities = event.level.getEntities().filter(e => {
    return e.nbt != null &&
      e.nbt.KubeJSPersistentData != null &&
      e.nbt.KubeJSPersistentData.destination != null;
  });

  thrownEntities.forEach(entity => {
    spinItems.forEach(item => {
      if (entity.nbt.item.id === item[0]) {
        let data = entity.nbt.KubeJSPersistentData;
        let yaw = data.rotation;
        yaw = (yaw && yaw.getAsDouble)          // NumericTag → primitive
          ? yaw.getAsDouble()               // 1.20+: getAsDouble()  :contentReference[oaicite:1]{index=1}
          : Number(yaw);                    // string → number (or NaN)

        if (Number.isNaN(yaw)) yaw = 0;         // final safety net  :contentReference[oaicite:2]{index=2}

        /* 2️⃣  advance & wrap */
        yaw = (yaw + DEG_PER_TICK) % 360;
        data.rotation = yaw;                    // store back as NUMBER

        /* 3️⃣  build quaternion  */
        let rad = yaw * (3.14159265359 /*PI, because Math.PI does not work */) / 180;        // now always numeric
        let sin = Math.sin(rad / 2);
        let cos = Math.cos(rad / 2);
        /* 4️⃣  send tween – duration & start EVERY tick  */
        event.server.runCommandSilent(
          `execute as ${entity.getUuid()} run data merge entity @s ` +
          `{start_interpolation:0,interpolation_duration:${TWEEN_TICKS},` +  // -1 = restart next frame  :contentReference[oaicite:3]{index=3}
          `transformation:{left_rotation:[0f,${sin.toFixed(5)}f,0f,${cos.toFixed(5)}f]}}`
        );

      }
    })
  })
})

LevelEvents.tick(event => {
  // Process each thrown entity that has our custom persistent data.
  let thrownEntities = event.level.getEntities().filter(e => {
    return e.nbt != null &&
      e.nbt.KubeJSPersistentData != null &&
      e.nbt.KubeJSPersistentData.destination != null;
  });

  thrownEntities.forEach(entity => {
    spinItems.forEach(item => {
      if (entity.nbt.item.id === item[0]) {
        let BoundingBox = new $AABB(item[11].boundingbox)
        let data = entity.nbt.KubeJSPersistentData;
          entity.setBoundingBox(BoundingBox.move(entity.getBlockX(),entity.getBlockY(),entity.getBlockZ()))
          event.server.schedule(2, () => {entity.setBoundingBox(BoundingBox.move(entity.getBlockX(),entity.getBlockY(),entity.getBlockZ()))})
          //Send Data To Client
          let players = event.level.getPlayers();
          players.forEach(player => {
            let data = ConvertAABBAndEntityToTag(item[11].boundingbox, entity)
            player.sendData('entity_hitboxes', data)
          
          })
        // --- Movement Update ---
        // Use precise coordinates.
        let pos = { x: entity.getX(), y: entity.getY(), z: entity.getZ() };
        let target;
        let player = event.level.getPlayerByUUID(data.thrower)
        if(data.state === "flying" && !((player.getOffHandItem() && player.getMainHandItem()) === "minecraft:air")) {
          event.server.runCommandSilent(`/playsound ${item[11].flyingsound[0]} master @a ${entity.getX()} ${entity.getY() + 1} ${entity.getZ()} ${item[11].flyingsound[1]+2} ${item[11].flyingsound[2]}`)
              let look = player.getLookAngle(); // Returns a vector with x(), y(), z()
               // Use precise positions:
              let ppos = { x: player.getX(), y: player.getY(), z: player.getZ() };
          let destX = ppos.x + look.x() * item[10];
          let destY = ppos.y+1.5 + look.y() * item[10];
          let destZ = ppos.z + look.z() * item[10];
          event.server.runCommandSilent(
          `execute as ${entity.getUuid()} run data merge entity @s ` +
          `{KubeJSPersistentData:{destination:[${destX}f,${destY}f,${destZ}f]}}`
        );}
        if (data.state === "flying") {
          event.server.runCommandSilent(`/playsound ${item[11].flyingsound[0]} master @a ${entity.getX()} ${entity.getY() + 1} ${entity.getZ()} ${item[11].flyingsound[1]} ${item[11].flyingsound[2]}`)
          target = { x: data.destination[0], y: data.destination[1], z: data.destination[2] };
        } else if (data.state === "returning") {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          if (!thrower) return;
          target = { x: thrower.getX(), y: thrower.getY() + 1, z: thrower.getZ() };
        }

        // Compute distance vector (only if target exists)
        let dx, dy, dz, dist;
        if (target) {
          dx = target.x - pos.x;
          dy = target.y - pos.y;
          dz = target.z - pos.z;
          dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        // --- State Transition ---
        if (data.state === "flying" && target) {
          // Check block collision: use Math.floor on each coordinate.
          
          let blockAtPos = entity.getLevel().getBlock(
            Math.floor(pos.x),
            Math.floor(pos.y + 0.12),
            Math.floor(pos.z)
          );
          // If colliding with a solid block:
          if (blockAtPos && blockAtPos.getBlockState().isSolid()) {
            // For items meant to stick in ground:
            if (item[6] === "stick_in_ground") {
              data.state = "stuck";
            } else
              if (item[6] === "clash") {
                event.server.runCommandSilent(`/particle minecraft:smoke ${entity.getX()} ${entity.getY()} ${entity.getZ()} 1 1 1 1 100 normal`);
                // --- Simulated Hitbox for Mobs ---
                let mobs = event.level.getEntities().filter(e => {
                  let players = event.level.getPlayers();
                  let thrower = players.find(p => p.getUuid() === data.thrower);
                  return e.getUuid() !== thrower.getUuid() && e !== entity && e.getType() !== "minecraft:item";
                });
                mobs.forEach(mob => {
                  let players = event.level.getPlayers();
                  let thrower = players.find(p => p.getUuid() === data.thrower);
                  if ((entity.getBoundingBox()*10).intersects(mob.getBoundingBox)) {
                    if (data.state !== "stuck") {
                      event.server.runCommandSilent(`/damage ${mob.getUuid()} ${item[4]} minecraft:player_attack by ${thrower.getUuid()}`);
                      if (item[11].optionalentityhitsound) {
                        event.server.runCommandSilent(`/playsound ${item[11].optionalentityhitsound[0]} master @a ${mob.getX()} ${mob.getY() + 1} ${mob.getZ()} ${item[11].optionalentityhitsound[1]} ${item[11].optionalentityhitsound[2]}`)
                      } else {
                        event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${mob.getX()} ${mob.getY() + 1} ${mob.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
                      }
                    }
                    if (data.state === "flying" && item[5] === "first_impact" && item[6] !== "stick_in_ground") {
                      data.state = "returning";
                      entity.setNbt(entity.nbt);
                    }
                  }
                });
              } else if (item[2] === "return") {
                event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${entity.getX()} ${entity.getY() + 1} ${entity.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
                data.state = "returning";
                entity.setNbt(entity.nbt);
              }
            entity.setNbt(entity.nbt);
          }
          // Also, if nearly at destination, switch state to returning (if not stick_in_ground).
          if(!((player.getOffHandItem() && player.getMainHandItem()) === "minecraft:air")) {
          if (data.state === "flying" && item[2] === "return" && dist < 5) {
            data.state = "returning";
            entity.setNbt(entity.nbt);
          }
          } else {
          if (data.state === "flying" && item[2] === "return" && dist < 1.0) {
            data.state = "returning";
            entity.setNbt(entity.nbt);
          }
        }
        }

        // --- Movement Calculation ---
        // Only update movement if state is "flying" or "returning".
        if (data.state === "flying" || data.state === "returning") {
          let speed = (data.state === "flying") ? item[1] : item[3];
          let ndx = dx / dist;
          let ndy = dy / dist;
          let ndz = dz / dist;
          let newX = pos.x + ndx * speed;
          let newY = pos.y + ndy * speed;
          let newZ = pos.z + ndz * speed;
          entity.setPosition(newX, newY, newZ);
          entity.setBoundingBox(BoundingBox.move(newX,newY,newZ))
          //Send Data To Client
          let players = event.level.getPlayers();
          players.forEach(player => {
            let data = ConvertAABBAndEntityToTag(item[11].boundingbox, entity)
            player.sendData('entity_hitboxes', data)
          
          })
        } else if (data.state === "stuck") {
          // In the stuck state, the entity does not update its position.
          // It remains at its collision point.
        } else {
                      //Send Data To Client
          let players = event.level.getPlayers();
          players.forEach(player => {
            let data = ConvertAABBAndEntityToTag(item[11].boundingbox, entity)
            player.sendData('entity_hitboxes', data)
          
          })
        }


        // --- Simulated Hitbox for Mobs ---
        let mobs = event.level.getEntities().filter(e => {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          return e.getUuid() !== thrower.getUuid() && e !== entity && (e.isLiving());
        });
        mobs.forEach(mob => {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          if (entity.getBoundingBox().intersects(mob.getBoundingBox())) {
            if (data.state !== "stuck") {
              let registryAccess = event.server.registryAccess()
              let asItem = Item.of(item[0]).withNBT(entity.nbt.item.tag)
              let player = event.level.getPlayerByUUID(thrower.getUuid())
              let sharpness = asItem.getEnchantments().get("minecraft:sharpness")
              let attackbonus = 1+((sharpness-1)/2)
              event.server.runCommandSilent(`/damage ${mob.getUuid()} ${entity.getNbt().KubeJSPersistentData.attackdamage + attackbonus} minecraft:player_attack by ${player.getUuid()}`)
              let fireaspect = asItem.getEnchantments().get("minecraft:fire_aspect")
                mob.setRemainingFireTicks(80*fireaspect)
              
              /*let damageSource = $DamageSources(registryAccess).playerAttack(player) 
              mob.actuallyHurt(damageSource, entity.getNbt().KubeJSPersistentData.attackdamage)
              mob.markHurt()*/
              if (item[11].optionalentityhitsound) {
                event.server.runCommandSilent(`/playsound ${item[11].optionalentityhitsound[0]} master @a ${mob.getX()} ${mob.getY() + 1} ${mob.getZ()} ${item[11].optionalentityhitsound[1]} ${item[11].optionalentityhitsound[2]}`)
              } else {
                event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${mob.getX()} ${mob.getY() + 1} ${mob.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
              }
            }
            if (data.state === "flying" && item[5] === "first_impact" && item[6] !== "stick_in_ground") {
              data.state = "returning";
              entity.setNbt(entity.nbt);
            }
          }
        });

        // --- Simulated Hitbox for Player Retrieval ---
        // In both returning and stuck states, if the thrown item collides with its thrower, remove it.
        if (data.state === "returning" || data.state === "stuck") {
          let players = event.level.getPlayers();
          players.filter(p => p.getUuid().toString() === data.thrower).forEach(p => {
          let enbt = entity.getNbt()
          let inbt = enbt.item
            let collision = p.getBoundingBox().intersects(entity.getBoundingBox())
          if (collision) {
            event.server.runCommandSilent(`give ${p.getDisplayName().getString()} ${inbt.id}${inbt.tag} ${inbt.Count}`)
            entity.kill();
            return;
          }
          });
        }
        entity.setNbt(entity.nbt);
      }
    });
  });
});

function ConvertAABBAndEntityToTag(AABBasList, entity) {
let Tag = new $CompoundTag()
Tag.putDouble("minx", AABBasList[0])
Tag.putDouble("miny", AABBasList[1])
Tag.putDouble("minz", AABBasList[2])

Tag.putDouble("maxx", AABBasList[3])
Tag.putDouble("maxy", AABBasList[4])
Tag.putDouble("maxz", AABBasList[5])
Tag.putUUID("entityUUId", entity.getUuid())
return Tag
}