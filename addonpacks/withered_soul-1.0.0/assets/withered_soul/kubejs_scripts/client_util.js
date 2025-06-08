
    let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    let ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')

NetworkEvents.dataReceived('render_particle', event => { 
    let data = event.data
    let location = data.getCompound("location")
    let lx = location.getDouble("x")
    let ly = location.getDouble("y")
    let lz = location.getDouble("z")
    let direction = data.getCompound("direction")
    let dx = direction.getDouble("x")
    let dy = direction.getDouble("y")
    let dz = direction.getDouble("z")

    let particleName = data.getString("particle")
    let speed = data.getDouble("speed")
    let count = data.getInt("count")

    let particleRL = new ResourceLocation(particleName)
    let particleType = ForgeRegistries.PARTICLE_TYPES.getValue(particleRL)

    if (!particleType) {
        console.log("Unknown particle: " + particleName)
        return
    }

    event.player.getLevel().spawnParticles(
        particleType, true,
        lx, ly, lz,
        dx, dy, dz,
        count, speed
    )
})
