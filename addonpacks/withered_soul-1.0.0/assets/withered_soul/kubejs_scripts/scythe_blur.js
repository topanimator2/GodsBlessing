/*
// kubejs/client_scripts/entityMotionBlur.js
const BLUR_ID = 'minecraft:shaders/post/motion_blur.json';
let shaderLoaded = false;
const effectId  = new ResourceLocation(BLUR_ID);
const $PostPass = Java.loadClass('net.minecraft.client.renderer.PostPass');

  const mc = Client.self();
ClientEvents.tick(event => {
  // find the spinning Item Display entity closest to camera
  let target = event.level.entities.find(e =>
      e.type.toString() === 'minecraft:item_display' && e.isAlive());

  if (target) {
    // compute 2-D motion in screen-space
    let vx = target.xOld - target.getX();
    let vy = target.yOld - target.getY();
    let speed = Math.hypot(vx, vy);

    // load shader if not active
    if (!shaderLoaded) {
      mc.gameRenderer.loadEffect(effectId);
      shaderLoaded = true;
    }
  } else if (shaderLoaded) {          // entity gone → turn off
    mc.gameRenderer.shutdownEffect();
    shaderLoaded = false;
  }
})
*/