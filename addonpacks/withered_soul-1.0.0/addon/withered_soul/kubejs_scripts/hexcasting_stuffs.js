/*
ForgeEvents.onGenericEvent('net.minecraftforge.event.AttachCapabilitiesEvent', 'at.petrak.hexcasting.forge.cap.ForgeCapabilityHandler', event => {
console.log('suppperss')
})
*/

ItemEvents.modification(event => {
  event.modify('hexcasting:amethyst_dust', item => {
    item.maxStackSize = 2560
  })
})