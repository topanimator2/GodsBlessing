let spinItems = [
  ["withered_soul:chrono_scythe", 0.8, "return", 2, 11, "none", "none" /*<= clash // stick_in_ground*/, "dropped_model" /*<= dropped_model // basic_model*/, 0.2, 2.5, 15 /*<= Range*/,{
    throwsound:["minecraft:item.armor.equip_chain",0.5, 0.7],
    flyingsound:["minecraft:particle.soul_escape",1, 0.7],
    hitsound:["minecraft:block.anvil.place",0.5, 0.7],
    optionalentityhitsound:["born_in_chaos_v1:dark_warlblade_atak",0.5, 0.7]
  }]
];

// Define hitbox radii (in blocks)w
const thrownHitboxRadius = 0.7;
const playerHitboxRadius = 0.7;
const mobHitboxRadius = 1.2; // Adjust as needed

// Helper function to check collision between two entities based on their positions.
function isColliding(entityA, entityB, hitboxA, hitboxB) {
  let dx = entityA.getX() - entityB.getX();
  let dy = entityA.getY() - entityB.getY();
  let dz = entityA.getZ() - entityB.getZ();
  let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance < (hitboxA + hitboxB);
}

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
    let destY = pos.y + look.y() * item[10];
    let destZ = pos.z + look.z() * item[10];
    let throwerUuid = player.getUuid();
    // Summon the item_display with persistent data.
    // (The transformation values can be adjusted per model.)
    let command;
    if(item[7] === "dropped_model") {
      command = `/execute in ${player.getLevel().dimension} run summon minecraft:item_display ${player.getX()} ${player.getY()+1} ${player.getZ()} {item:{id:"${item[0]}",Count:1},transformation:{left_rotation:[0f,1f,1f,0f],right_rotation:[0f,1f,0f,1f],scale:[${item[8]}f,${item[8]}f,${item[8]}f],translation:[0f,0f,0f]},KubeJSPersistentData:{destination:[${destX}f,${destY}f,${destZ}f],thrower:"${throwerUuid}",state:"flying",rotation:0}}`;
    } else if(item[7] === "basic_model") {
      command = `/execute in ${player.getLevel().dimension} run summon minecraft:item_display ${player.getX()} ${player.getY()+1} ${player.getZ()} {item:{id:"${item[0]}",Count:1},transformation:{left_rotation:[0f,1f,1f,0f],right_rotation:[0f,1f,0f,0f],scale:[${item[8]}f,${item[8]}f,${item[8]}f],translation:[0f,0f,0f]},KubeJSPersistentData:{destination:[${destX}f,${destY}f,${destZ}f],thrower:"${throwerUuid}",state:"flying",rotation:0}}`;
    }
    event.server.runCommandSilent(`/playsound ${item[11].throwsound[0]} master @a ${player.getX()} ${player.getY()+1} ${player.getZ()} ${item[11].throwsound[1]} ${item[11].throwsound[2]}`)
    event.server.runCommandSilent(command);
    player.addItemCooldown(player.getMainHandItem(), 20*item[9]);
  });
});

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
        
        // --- Rotation Update ---
        let rotation = Number(data.rotation) || 0;
        rotation = (rotation + 30) % 360;
        data.rotation = rotation;
        if(data.state !== "stuck") {
          entity.setRotation(rotation, 0);
        }
        
        // --- Movement Update ---
        // Use precise coordinates.
        let pos = { x: entity.getX(), y: entity.getY(), z: entity.getZ() };
        let target;
        if (data.state === "flying") {
          event.server.runCommandSilent(`/playsound ${item[11].flyingsound[0]} master @a ${entity.getX()} ${entity.getY()+1} ${entity.getZ()} ${item[11].flyingsound[1]} ${item[11].flyingsound[2]}`)
          target = { x: data.destination[0], y: data.destination[1], z: data.destination[2] };
        } else if (data.state === "returning") {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          if (!thrower) return;
          target = { x: thrower.getX(), y: thrower.getY()+1, z: thrower.getZ() };
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
        if (data.state === "flying") {
          // Check block collision: use Math.floor on each coordinate.
          let blockAtPos = entity.getLevel().getBlock(
            Math.floor(pos.x),
            Math.floor(pos.y +0.12),
            Math.floor(pos.z)
          );
          // If colliding with a solid block:
          if (blockAtPos && blockAtPos.id !== "minecraft:air") {
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
          return e.getUuid() !== thrower.getUuid() && e !== entity && e.getType()!== "minecraft:item";
        });
        mobs.forEach(mob => {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          if (isColliding(entity, mob, thrownHitboxRadius*10, mobHitboxRadius)) {
            if(data.state !== "stuck") {
            event.server.runCommandSilent(`/damage ${mob.getUuid()} ${item[4]} minecraft:player_attack by ${thrower.getUuid()}`);
            if(item[11].optionalentityhitsound) {
              event.server.runCommandSilent(`/playsound ${item[11].optionalentityhitsound[0]} master @a ${mob.getX()} ${mob.getY()+1} ${mob.getZ()} ${item[11].optionalentityhitsound[1]} ${item[11].optionalentityhitsound[2]}`)
            } else {
              event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${mob.getX()} ${mob.getY()+1} ${mob.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
           }
            }
            if (data.state === "flying" && item[5] === "first_impact" && item[6] !== "stick_in_ground") {
              data.state = "returning";
              entity.setNbt(entity.nbt);
            }
          }
        });
            } else if (item[2] === "return") {
              event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${entity.getX()} ${entity.getY()+1} ${entity.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
              data.state = "returning";
            }
            entity.setNbt(entity.nbt);
          }
          // Also, if nearly at destination, switch state to returning (if not stick_in_ground).
          if (data.state === "flying" && item[2] === "return" && dist < 1.0) {
            data.state = "returning";
            entity.setNbt(entity.nbt);
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
        } else if (data.state === "stuck") {
          // In the stuck state, the entity does not update its position.
          // It remains at its collision point.
        }
        
        // --- Simulated Hitbox for Mobs ---
        let mobs = event.level.getEntities().filter(e => {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          return e.getUuid() !== thrower.getUuid() && e !== entity && e.getType()!== "minecraft:item";
        });
        mobs.forEach(mob => {
          let players = event.level.getPlayers();
          let thrower = players.find(p => p.getUuid() === data.thrower);
          if (isColliding(entity, mob, thrownHitboxRadius, mobHitboxRadius)) {
            if(data.state !== "stuck") {
            event.server.runCommandSilent(`/damage ${mob.getUuid()} ${item[4]} minecraft:player_attack by ${thrower.getUuid()}`);
            if(item[11].optionalentityhitsound) {
              event.server.runCommandSilent(`/playsound ${item[11].optionalentityhitsound[0]} master @a ${mob.getX()} ${mob.getY()+1} ${mob.getZ()} ${item[11].optionalentityhitsound[1]} ${item[11].optionalentityhitsound[2]}`)
            } else {
              event.server.runCommandSilent(`/playsound ${item[11].hitsound[0]} master @a ${mob.getX()} ${mob.getY()+1} ${mob.getZ()} ${item[11].hitsound[1]} ${item[11].hitsound[2]}`)
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
          let collision = players.some(p => isColliding(entity, p, thrownHitboxRadius, playerHitboxRadius));
          if (collision) {
            entity.kill();
            return;
          }
        }
        
        entity.setNbt(entity.nbt);
      }
    });
  });
});