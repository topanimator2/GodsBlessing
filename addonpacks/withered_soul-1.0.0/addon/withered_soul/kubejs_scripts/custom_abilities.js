let $CompoundTag = Java.loadClass(`net.minecraft.nbt.CompoundTag`)

StartupEvents.registry("palladium:abilities", event => {

	event.create("godsblessing:toggle_tp_standpoint")
		.icon(palladium.createItemIcon('minecraft:red_carpet'))
		.documentationDescription('First use: Sets a tp point in nbt. Second use: tp`s to tp point. reset')
		.addProperty("maxdistance", "float", 0.0, "Max Distance for teleport.")
		.firstTick((entity, entry, holder, enabled) => {
			if (enabled) {
			const maxdistance = entry.getPropertyByName('maxdistance');
			let Data = entity.getPersistentData()
				if(Data.contains("StandpointTeleportationLocation")) {
					global.BeginDialogue(entity, 'robot_assistant', 'Reconnecting to host...');
					let Location = Data.getCompound("StandpointTeleportationLocation")
					entity.teleportTo(Location.getString("dimension"), Location.getDouble("x"),Location.getDouble("y"),Location.getDouble("z"), Location.getDouble("xRot"), Location.getDouble("yRot"))
					Data.remove("StandpointTeleportationLocation")
				} else {
					if(entity.getPersistentData()) {
						global.BeginDialogue(entity, 'robot_assistant', 'No relative data found. Setting Null Point...');
						let vec = new $CompoundTag()
						vec.putString("dimension", entity.getLevel().dimension)
						vec.putFloat("yRot", entity.getRotationVector().y)
						vec.putFloat("xRot", entity.getRotationVector().x)
						vec.putDouble("x", entity.blockPosition().x)
						vec.putDouble("y", entity.blockPosition().y)
						vec.putDouble("z", entity.blockPosition().z)
						Data.put("StandpointTeleportationLocation",vec)
					}
				}
				entity.mergeNbt(entity.getNbt().put("KubeJSPersistentData",Data))
			} else {
				global.BeginDialogue(entity, 'robot_assistant', "Greetings explorer, it seems you have acquired my assistance.");
			}
		})
    event.create("palladium:entity_damage")
	
		// Preset icon, can also be changed individually in the power json
			.icon(palladium.createItemIcon('palladium:vibranium_circuit'))

        // Documentation description
			.documentationDescription('Does damage to what the executer is looking at.')

        // Adding a configurable property for the condition that can be changed in the power json
        .addProperty("damage", "float", 0.0, "The amount of damage the ability does")
		.addProperty('damage_type', 'string', 'minecraft:player_attack', 'The type of damage that is done')
		.addProperty('effect', 'string', 'null', 'The effect that is give to the entity if used')
		.addProperty('fire_seconds', 'float', 0.0, 'How many seconds the entity should be on fire')
		.addProperty('potion_seconds', 'integer', 0, 'How many seconds the entity should have the effect')
		.addProperty('potion_amplifier', 'integer', 0, 'What level the effect is')
		.addProperty("hide_particles", 'boolean', false, "If potion particles should be visable")
        .addProperty("range", "float", 0.0, "The amount of range the ability has")
		.addProperty('at', 'string', 'null', 'Where the damage is(by and from will not work if this is not null)')
		.addProperty('by', 'string', '@s', 'What entity is doing the damage')
		.addProperty('from', 'string', '@s', 'What entity is the damage from')
		.addProperty('command_as_entity', 'string', 'null', 'Excute a command from the entity if used')
		.addProperty('excluded_tag', 'string', 'damage_excluded_tag', 'Tag that will be excluded from damage if used')
		
		// Handler for what happens during EVERY tick of the ability being active, make sure to check the 'enabled' parameter
		.tick((entity, entry, holder, enabled) => {
			if (enabled) {
				const damage = entry.getPropertyByName('damage');
				const damage_type = entry.getPropertyByName('damage_type');
				const effect = entry.getPropertyByName('effect');
				const fire_seconds = entry.getPropertyByName('fire_seconds');
				const potion_seconds = entry.getPropertyByName('potion_seconds');
				const potion_amplifier = entry.getPropertyByName('potion_amplifier');
				const hide_particles = entry.getPropertyByName('hide_particles');
				const range = entry.getPropertyByName('range');
				const at = entry.getPropertyByName('at');
				const by = entry.getPropertyByName('by');
				const from = entry.getPropertyByName('from');
				const command_as_entity = entry.getPropertyByName('command_as_entity');
				const excluded_tag = entry.getPropertyByName('excluded_tag');

				let target = entity.rayTrace(range).entity;
				if (enabled && target !== null && !containsTag(target.getTags().toArray(), excluded_tag) && at == null) {
					let target = entity.rayTrace(range).entity
					entity.runCommandSilent(`execute as ${target.uuid} at ${target.uuid} run ${command_as_entity}`)
					entity.runCommandSilent(`damage ${target.uuid} ${damage} ${damage_type} by ${by} from ${from}`)
					target.setSecondsOnFire(fire_seconds)
						if (hide_particles == true && effect !== 'null') {
							target.potionEffects.add(effect, potion_seconds, potion_amplifier, true, false)
						}
						if (hide_particles == false && effect !== 'null') {
							target.potionEffects.add(effect, potion_seconds, potion_amplifier, false, true)
						}
				}
				if (enabled && target !== null && !containsTag(target.getTags().toArray(), excluded_tag) && at !== null) {
					let target = entity.rayTrace(range).entity
					entity.runCommandSilent(`execute as ${target.uuid} at ${target.uuid} run ${command_as_entity}`)
					entity.runCommandSilent(`damage ${target.uuid} ${damage} ${damage_type} at ${at}`)
					target.setSecondsOnFire(fire_seconds)
						if (hide_particles == true && effect !== 'null') {
							target.potionEffects.add(effect, potion_seconds, potion_amplifier, true, false)
						}
						if (hide_particles == false && effect !== 'null') {
							target.potionEffects.add(effect, potion_seconds, potion_amplifier, false, true)
						}
				}
			}
	})
});

function containsTag(tags, tag) {
    for (let i = 0; i < tags.length; i++) {
        if(tags[i].equals(tag)) {
            return true;
        }
    }
    return false;
}