// A simple implementation of detecting if a server player is holding a diamond axe
PlayerEvents.tick(event => {
    const { player, player: { persistentData } } = event
    if (!persistentData.HoldingAxe) persistentData.HoldingAxe = 0
    if (player.mainHandItem.id == "minecraft:diamond_axe") {
        persistentData.HoldingAxe = 1
    } else persistentData.HoldingAxe = 0
    player.sendData("myData", { HoldingAxe: persistentData.HoldingAxe })
})