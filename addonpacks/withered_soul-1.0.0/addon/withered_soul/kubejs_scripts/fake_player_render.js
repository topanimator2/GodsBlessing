// client_scripts/fake_entities_event.js     –  NeoForge 1.20.1 + KubeJS 6.x
// -------------------------------------------------------------------------
// 1 ▸ imports
const Minecraft = Java.loadClass('net.minecraft.client.Minecraft');
const EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');
const Stage = Java.loadClass('net.minecraftforge.client.event.RenderLevelStageEvent$Stage');
const Mth = Java.loadClass('net.minecraft.util.Mth');

global.FAKE = {};

// 4 ▸ hook the proper render-thread event
ForgeEvents.onEvent('net.minecraftforge.client.event.RenderLevelStageEvent', ev => {            // keep render order
    let mc = Minecraft.getInstance();
    let lvl = mc.level; if (!lvl) return;                   // world not ready
    let cam = ev.camera.getPosition();                       // Vec3
    let buf = mc.renderBuffers().bufferSource();
    let pose = ev.poseStack;
    let dt = ev.partialTick;
    let LocalUser = mc.getUser()
    let localname = LocalUser.getName()


    let localplayer = lvl.players.find(p => p.username === localname);
    if (!localplayer) return;
    let Data = localplayer.getPersistentData()
    if (Data.contains("StandpointTeleportationLocation")) {
        let Location = Data.getCompound("StandpointTeleportationLocation")
        let name = Location.getString("name")
        console.log(Location)
        if (localname === name) {
            console.log(Location)
            let x = Location.getDouble("x")
            let y = Location.getDouble("y")
            let z = Location.getDouble("z")
            let yRot = Location.getFloat("yRot")
            mc.entityRenderDispatcher.render(
                localplayer,
                x - cam.x,
                y - cam.y,
                z - cam.z,
                yRot,
                dt, pose, buf,
                mc.entityRenderDispatcher.getPackedLightCoords(live, dt)
            );
        }
    }


    return;
}
)
