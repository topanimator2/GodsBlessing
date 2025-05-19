// ==========================================
// Chrono-Scythe • smooth spin on throw/return
// For NeoForge 1.20.1  –  KubeJS 6 server_scripts
// ==========================================

//  id , flySpd , return? , returnSpd , dmg , 1stImpact , stick? , model , scale , cooldown , range , sounds
const spinItems = [
  ["withered_soul:chrono_scythe", 0.8, "return", 2, 11, "none", "none",
   "dropped_model", 0.20, 2.5, 15, {
     throwsound:["minecraft:item.armor.equip_chain",0.5,0.7],
     flyingsound:["minecraft:particle.soul_escape",1,0.7],
     hitsound:["minecraft:block.anvil.place",0.5,0.7],
     optionalentityhitsound:["born_in_chaos_v1:dark_warlblade_atak",0.5,0.7]
  }]
];

// --- constants --------------------------------------------------
const THROWN_HIT = 0.7, PLAYER_HIT = 0.7, MOB_HIT = 1.2;
const TELEPORT_DURATION = 5;          // ≤59  — movement tween:contentReference[oaicite:7]{index=7}
const INTERP_DURATION   = 3;          // spin tween:contentReference[oaicite:8]{index=8}
const DEG_STEP          = 10;         // add ° each tick  (36 fps-ish)

// quaternion helper (Y-axis)
const yawQuat = deg => {
  const h = deg * Math.PI / 360;
  return [0, Math.sin(h), 0, Math.cos(h)];
};

// --- helper for sphere collision --------------------------------
function coll(a,b,ha,hb){
  const dx=a.getX()-b.getX(), dy=a.getY()-b.getY(), dz=a.getZ()-b.getZ();
  return Math.hypot(dx,dy,dz) < ha+hb;
}

// --- summon on right-click -------------------------------------
spinItems.forEach(it=>{
  ItemEvents.rightClicked(it[0], ev=>{
    const p   = ev.entity;
    const dir = p.getLookAngle();
    const dst = [p.getX()+dir.x()*it[10],
                 p.getY()+dir.y()*it[10],
                 p.getZ()+dir.z()*it[10]];

    const cmd =
      `/execute in ${p.level.dimension} run summon minecraft:item_display `+
      `${p.x} ${p.y+1} ${p.z} {`+
        `item:{id:"${it[0]}",Count:1},`+
        // identity quaternions + scale
        `transformation:{left_rotation:[0,0,0,1],right_rotation:[0,0,0,1],`+
        `scale:[${it[8]},${it[8]},${it[8]}]},`+
        `teleport_duration:${TELEPORT_DURATION},`+               // position lerp
        `interpolation_duration:${INTERP_DURATION},`+           // model lerp
        `start_interpolation:0,`+                               // begin next tick:contentReference[oaicite:9]{index=9}
        `KubeJSPersistentData:{destination:[${dst}],`+
        `thrower:"${p.getUuid()}",state:"flying",rotation:0}`+
      `}`;

    ev.server.runCommandSilent(cmd);
    ev.server.runCommandSilent(
      `/playsound ${it[11].throwsound[0]} master @a ${p.x} ${p.y+1} ${p.z} ${it[11].throwsound[1]} ${it[11].throwsound[2]}`
    );
    p.addItemCooldown(p.getMainHandItem(), 20 * it[9]);
  });
});

// --- tick: spin, fly, collide ----------------------------------
LevelEvents.tick(ev=>{
  ev.level.getEntities()
    .filter(e=>e.nbt?.KubeJSPersistentData?.destination)
    .forEach(ent=>{
      spinItems.forEach(it=>{
        if(ent.nbt.item.id !== it[0]) return;
        const d = ent.nbt.KubeJSPersistentData;

        // 1.  smooth spin (quaternion)
        let rot = (Number(d.rotation)||0) + DEG_STEP;
        if (rot >= 360) rot -= 360;
        d.rotation = rot;

        const tf = ent.nbt.transformation ?? {
          left_rotation:[0,0,0,1],
          right_rotation:[0,0,0,1],
          scale:[1,1,1],
          translation:[0,0,0]
        };
        tf.right_rotation = yawQuat(rot);        // rotate model only

        ent.nbt.transformation        = tf;
        ent.nbt.start_interpolation   = 0;       // restart tween every tick:contentReference[oaicite:10]{index=10}
        ent.nbt.interpolation_duration= INTERP_DURATION;

        // 2.  move towards target
        const pos={x:ent.getX(),y:ent.getY(),z:ent.getZ()};
        let tgt=null;

        if(d.state==="flying"){
          ev.server.runCommandSilent(
            `/playsound ${it[11].flyingsound[0]} master @a ${pos.x} ${pos.y+1} ${pos.z} ${it[11].flyingsound[1]} ${it[11].flyingsound[2]}`
          );
          tgt={x:d.destination[0],y:d.destination[1],z:d.destination[2]};
        }else if(d.state==="returning"){
          const thr=ev.level.getPlayers().find(pl=>pl.getUuid()===d.thrower);
          if(!thr) return;
          tgt={x:thr.getX(),y:thr.getY()+1,z:thr.getZ()};
        }

        if(tgt){
          const dx=tgt.x-pos.x, dy=tgt.y-pos.y, dz=tgt.z-pos.z, dist=Math.hypot(dx,dy,dz);
          const spd=(d.state==="flying")?it[1]:it[3];
          ent.setPosition(pos.x+dx/dist*spd,pos.y+dy/dist*spd,pos.z+dz/dist*spd);
          if(d.state==="flying" && dist<1 && it[2]==="return") d.state="returning";
        }

        // 3.  kill if it returns to thrower
        if(d.state!=="flying"){
          if(ev.level.getPlayers().some(pl=>coll(ent,pl,THROWN_HIT,PLAYER_HIT))){
            ent.kill(); return;
          }
        }

        ent.setNbt(ent.nbt);      // push edits once
      });
    });
});
