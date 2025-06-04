// client_scripts/fake_entities_event.js     –  NeoForge 1.20.1 + KubeJS 6.x
// -------------------------------------------------------------------------
// 1 ▸ imports
const Minecraft   = Java.loadClass('net.minecraft.client.Minecraft');
const EntityType  = Java.loadClass('net.minecraft.world.entity.EntityType');
const Stage       = Java.loadClass('net.minecraftforge.client.event.RenderLevelStageEvent$Stage');
const Mth         = Java.loadClass('net.minecraft.util.Mth');

global.FAKE = {};

// 4 ▸ hook the proper render-thread event
ForgeEvents.onEvent('net.minecraftforge.client.event.RenderLevelStageEvent', ev => {            // keep render order
  let mc   = Minecraft.getInstance();
  let lvl  = mc.level;  if (!lvl) return;                   // world not ready
  let cam  = ev.camera.getPosition();                       // Vec3
  let buf  = mc.renderBuffers().bufferSource();
  let pose = ev.poseStack;
  let dt   = ev.partialTick;

for (let key in global.FAKE) {
   let info = global.FAKE[key]
   console.log(info)
    let id = info.getString("id")

    // A ─ fake PLAYER illusion
    if (id === 'minecraft:player') {
      let live = lvl.players.find(p => p.username === info.getString("name"));
      if (!live) return;                                      // not tab-listed yet
      mc.entityRenderDispatcher.render(
        live,
        info.getDouble("x") - cam.x,
        info.getDouble("y") - cam.y,
        info.getDouble("z") - cam.z,
        info.getFloat("yRot"),
        dt, pose, buf,
        mc.entityRenderDispatcher.getPackedLightCoords(live, dt)
      );
      return;
    }
/*
    // B ─ any *other* entity: spawn once, let vanilla handle rendering
    if (!info.__spawned) {
      let opt = EntityType.byString(id);                    // Optional<EntityType>
      if (opt.isEmpty()) return;                              // bad ID from server
      let mob = opt.get().create(lvl);  if (!mob) return;
      mob.moveTo(
        info.getDouble('x'), info.getDouble('y'), info.getDouble('z'),
        info.getFloat('yRot'), info.getFloat('xRot')
      );
      lvl.addFreshEntity(mob);
      info.__spawned = true;                                  // mark so we don’t dupe
    }*/
}
  })
