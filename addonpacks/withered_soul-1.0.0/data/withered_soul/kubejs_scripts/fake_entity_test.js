let $CompoundTag = Java.loadClass(`net.minecraft.nbt.CompoundTag`)

ItemEvents.rightClicked("minecraft:stick", event => { 
    let entity = event.getPlayer()
						let vec = new $CompoundTag()
						vec.putString("dimension", entity.getLevel().dimension)
						vec.putFloat("yRot", entity.getRotationVector().y)
						vec.putFloat("xRot", entity.getRotationVector().x)
						vec.putDouble("x", entity.blockPosition().x)
						vec.putDouble("y", entity.blockPosition().y)
						vec.putDouble("z", entity.blockPosition().z)
                        vec.putString("id", entity.getType())
						
						let clientdata = new $CompoundTag()
                        clientdata.putBoolean("remove", false)
                        clientdata.putString("id", "nullpoint")
                        clientdata.put("entityInfo", vec)
                        entity.sendData("fake_entity", clientdata)
})