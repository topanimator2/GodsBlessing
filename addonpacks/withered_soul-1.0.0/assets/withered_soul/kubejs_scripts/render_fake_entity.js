// client_scripts/myclient.js
const GameProfile           = Java.loadClass('com.mojang.authlib.GameProfile')
const UUID                  = Java.loadClass('java.util.UUID')
const FakeClientPlayerMaker = Java.loadClass('com.samsthenerd.inline.utils.FakeClientPlayerMaker') // Inline
const Player                = Java.loadClass('net.minecraft.world.entity.player.Player')
let Minecraft = Client.self()
let personalFakes = {}   // id → Player reference

NetworkEvents.dataReceived('fake_entity', e => {
  const tag   = e.data
  const level = Minecraft.getInstance().level

  // remove?
  if (tag.getBoolean('remove')) {
    const fake = personalFakes[tag.getString('uuid')]
    if (fake) {
      fake.discard()                     // drop from level
      delete personalFakes[tag.getString('uuid')]
    }
    return
  }

  // Build or fetch an existing one
  let fake = personalFakes[tag.getString('uuid')]
  if (!fake) {
    const profile = new GameProfile(
      UUID.fromString(tag.getString('uuid')),
      tag.getString('name')
    )

    // Inline gives us a ready-to-go LocalPlayer **without** networking hooks
    fake = FakeClientPlayerMaker.getPlayerEntity(profile) // 1.20.1 NeoForge overload
    level.addFreshEntity(fake)                            // vital!
    fake.setNoAi(true)            // keeps it still, but still renders armour/pose
    personalFakes[tag.getString('uuid')] = fake
  }

  // Update position & rotation if you ever resend
  fake.moveTo(
    tag.getDouble('x'),
    tag.getDouble('y'),
    tag.getDouble('z'),
    fake.getYRot(), fake.getXRot()
  )
})
