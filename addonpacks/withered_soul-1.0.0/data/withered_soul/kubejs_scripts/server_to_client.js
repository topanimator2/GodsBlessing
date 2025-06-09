let $CompoundTag = Java.loadClass(`net.minecraft.nbt.CompoundTag`)

PlayerEvents.tick(event => {
    let player = event.player
    let Data = player.getPersistentData()
    if (!Data) {
        Data = new $CompoundTag()
    }
    let dimension = player.getLevel().dimension
    if (Data.contains("StandpointTeleportationLocation")) {
        let Location = Data.getCompound("StandpointTeleportationLocation")
        if (dimension === Location.getString("dimension")) {
            let x = Location.getDouble("x")
            let y = Location.getDouble("y")
            let z = Location.getDouble("z")
            let renderpackage = global.packageRenderParticleData("minecraft:soul_fire_flame", x, y, z, 0.1, 0.5, 0.1, 4, 0.001)
            player.sendData("render_particle", renderpackage)
        }
    }
    let playerwithstandpoints = player.getLevel().getPlayers().filter(player => player.getPersistentData().contains("StandpointTeleportationLocation"))
    if (playerwithstandpoints) {
        if (Data.contains("StandpointTeleportationLocation")) {
            let filteredPlayers = playerwithstandpoints.filter(player2 => player2 !== player);
            playerwithstandpoints = filteredPlayers
        }
        playerwithstandpoints.forEach(playerstandpoint => {
            let playerstandpointdata = playerstandpoint.getPersistentData()
            let Location = playerstandpointdata.getCompound("StandpointTeleportationLocation")
            if (dimension === Location.getString("dimension")) {
                let x = Location.getDouble("x")
                let y = Location.getDouble("y")
                let z = Location.getDouble("z")

                if (player.getDistance(x, y, z) <= 3) {
                    let mainrenderpackage = global.packageRenderParticleData("minecraft:flame", x, y, z, 0.1, 0.1, 0.1, 4, 0.001)

                    let circle = global.getCirclePositions({ x: x, y: y, z: z }, 3, 0.15);
                    circle.forEach(pos => {
                        let circlepackage = global.packageRenderParticleData("minecraft:small_flame", pos.x, pos.y, pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                        player.sendData("render_particle", circlepackage)
                    })
                    player.sendData("render_particle", mainrenderpackage)
                }
            }
        });
    }

})

EntityEvents.hurt(event => {
    let player = event.getEntity();
    if (player.getType().toString() === "minecraft:player") {
        let dimension = player.getLevel().dimension
        let Data = player.getPersistentData()
        if (Data.contains("StandpointTeleportationLocation")) {
                let Location = Data.getCompound("StandpointTeleportationLocation")
                if (dimension === Location.getString("dimension")) {
                let x = Location.getDouble("x")
                let y = Location.getDouble("y")
                let z = Location.getDouble("z")
                let line = global.generateLineWithTiming({ x: player.blockPosition().x, y: player.blockPosition().y + 1.5, z: player.blockPosition().z }, { x: x, y: y, z: z }, 0.3, 0.1)
                line.filter(pos => !(player.getDistance(pos.pos.x, pos.pos.y - 1.5, pos.pos.z) <= event.getDamage() * 3)).forEach(pos => {
                    player.getServer().scheduleInTicks(pos.time, () => {
                        let pospackage = global.packageRenderParticleData("minecraft:soul_fire_flame", pos.pos.x, pos.pos.y, pos.pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                        player.sendData("render_particle", pospackage)
                    })
                })
            }
        }
        let playerwithstandpoints = player.getLevel().getPlayers().filter(player => player.getPersistentData().contains("StandpointTeleportationLocation"))
        if (playerwithstandpoints) {
            if (Data.contains("StandpointTeleportationLocation")) {
                let filteredPlayers = playerwithstandpoints.filter(player2 => player2 !== player);
                playerwithstandpoints = filteredPlayers
            }
            playerwithstandpoints.forEach(playerstandpoint => {
                let playerstandpointdata = playerstandpoint.getPersistentData()
                let Location = playerstandpointdata.getCompound("StandpointTeleportationLocation")
                if (dimension === Location.getString("dimension")) {
                    let x = Location.getDouble("x")
                    let y = Location.getDouble("y")
                    let z = Location.getDouble("z")

                    let line = global.generateLineWithTiming({ x: player.blockPosition().x, y: player.blockPosition().y + 1.5, z: player.blockPosition().z }, { x: x, y: y, z: z }, 0.3, 0.1)
                    line.filter(pos => player.getDistance(pos.pos.x, pos.pos.y - 1.5, pos.pos.z) <= event.getDamage() * 5).forEach(pos => {
                        player.getServer().scheduleInTicks(pos.time, () => {
                            let pospackage = global.packageRenderParticleData("minecraft:small_flame", pos.pos.x, pos.pos.y, pos.pos.z, 0.01, 0.02, 0.01, 1, 0.00001)
                            player.sendData("render_particle", pospackage)
                        })
                    })
                }
            })
        }
    }
})