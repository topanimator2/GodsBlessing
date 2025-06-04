// A simple implementation of detecting if a server player is holding a diamond axe
PlayerEvents.tick(event => {
    const { player, player: { persistentData } } = event
    let Data = event.player.getPersistentData()
    if (Data.contains("StandpointTeleportationLocation")) {
    player.sendData("myData")
    }
})