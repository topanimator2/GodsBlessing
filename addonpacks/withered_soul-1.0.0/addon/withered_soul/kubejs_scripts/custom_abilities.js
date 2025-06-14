let $CompoundTag = Java.loadClass(`net.minecraft.nbt.CompoundTag`)
function spawnHoverOrb(level, target, itemId, hoverHeight, followSpeed, fallSpeed, damage, owner) {
  // raw coords
  let x = target.getX();
  let y = target.getY();
  let z = target.getZ();
  // your direct dimension string
  let dim = level.dimension;

  // 1) Summon the item_display _without_ KubeJSPersistentData
  let summonSNBT = `{`
    + `item:{id:"${itemId}",Count:1b},`
    + `interpolation_duration:10,`
    + `transformation:{`
    + `left_rotation:[0.16f,0f,-0.73f,0.928f],`
    + `right_rotation:[-0.278f,-0.306f,0.861f,-0.296f],`
    + `scale:[1.2f,1.2f,1.2f],`
    + `translation:[0f,0f,0f]`
    + `}`
    + `}`;
  level.server.runCommandSilent(
    `execute in ${dim} run summon minecraft:item_display `
    + `${x} ${(y + hoverHeight)} ${z} `
    + summonSNBT
  );

  // 2) Immediately tag the _nearest_ item_display at that spot with your persistent data
  //    so you never have to fiddle with Java NBT APIs in JS.
  let pdSNBT = `{`
    + `KubeJSPersistentData:{`
    + `target:"${target.getUuid().toString()}",`
    + `state:"hover",`
    + `hoverHeight:${hoverHeight}d,`
    + `followSpeed:${followSpeed}d,`
    + `fallSpeed:${fallSpeed}d,`
    + `damage:${damage}d,`
 + `owner:${owner}`
    + `}`
    + `}`;
  level.server.runCommandSilent(
    `execute in ${dim} positioned ${x} ${(y + hoverHeight)} ${z} `
    + `run data merge entity @e[type=minecraft:item_display,limit=1,sort=nearest] `
    + pdSNBT
  );
}

StartupEvents.registry("palladium:abilities", event => {

	event.create("godsblessing:toggle_tp_standpoint")
		.icon(palladium.createItemIcon('minecraft:red_carpet'))
		.documentationDescription('First use: Sets a tp point in nbt. Second use: tp`s to tp point. reset')
		.addProperty("maxdistance", "float", 0.0, "Max Distance for teleport.")
		.firstTick((entity, entry, holder, enabled) => {
			if (enabled) {
				let maxdistance = entry.getPropertyByName('maxdistance');
				let Data = entity.getPersistentData()
				if (!Data) {
					Data = new $CompoundTag()
				}
				if (Data.contains("StandpointTeleportationLocation")) {
					global.BeginDialogue(entity, 'robot_assistant', 'Reconnecting to host...');
					let Location = Data.getCompound("StandpointTeleportationLocation")
					/*
					let linetrans = global.generateLineWithTiming({x:entity.blockPosition().x,y:entity.blockPosition().y+1.5,z:entity.blockPosition().z}, {x:Location.getDouble("x"), y:Location.getDouble("y"), z:Location.getDouble("z")}, 0.1, 0.05)
					let rottrans = global.generateYawPitchTransition({yaw:entity.getRotationVector().y, pitch:entity.getRotationVector().x}, {yaw:Location.getDouble("yRot"), pitch:Location.getDouble("xRot")},0.005, true)

					let syncedtrans = global.syncTransitionsByTime(linetrans, [rottrans])
					syncedtrans.forEach(frame => {
						entity.getServer().scheduleInTicks(frame[0].time, () => { 
							let camerapackage = global.packageMoveCameraData(frame[0].pos.x,frame[0].pos.y,frame[0].pos.z, frame[1].pitch,frame[1].yaw)
							entity.sendData("move_camera", camerapackage)
						})
					});
					*/
					entity.teleportTo(Location.getString("dimension"), Location.getDouble("x"), Location.getDouble("y"), Location.getDouble("z"), Location.getDouble("yRot"), Location.getDouble("xRot"))
					Data.remove("StandpointTeleportationLocation")
				} else {
					if (entity.getPersistentData()) {
						global.BeginDialogue(entity, 'robot_assistant', 'No relative data found. Setting Null Point...');
						let vec = new $CompoundTag()
						vec.putString("name", entity.getDisplayName().getString())
						vec.putString("dimension", entity.getLevel().dimension)
						vec.putFloat("yRot", entity.getRotationVector().y)
						vec.putFloat("xRot", entity.getRotationVector().x)
						vec.putDouble("x", entity.blockPosition().x)
						vec.putDouble("y", entity.blockPosition().y)
						vec.putDouble("z", entity.blockPosition().z)
						Data.put("StandpointTeleportationLocation", vec)
					}
				}
				entity.mergeNbt(entity.getNbt().put("KubeJSPersistentData", Data))
			} else {
				global.BeginDialogue(entity, 'robot_assistant', "Greetings explorer, it seems you have acquired my assistance.");
			}
		})
	
	event.create("godsblessing:circle_effect")
	.addProperty("radius", "double", 5, "the radius.")
	.addProperty("spawn_animation", "bool", false, "spawn animation.")
	.addProperty("all_players", "bool", true, "show to all player.")
	.addProperty("particle", "string", "minecraft:small_flame", "the particle.")
	.addProperty("loop", "bool", true, "If the circle keeps looping.")
	.addProperty("force_up", "double", 0, "the force upwards.")
	.firstTick((entity, entry, holder, enabled) => {
		let radius = entry.getPropertyByName('radius');
		let spawn_animation = entry.getPropertyByName('spawn_animation');
		let all_players = entry.getPropertyByName('all_players');
		let particle = entry.getPropertyByName('particle');
		let force_up = entry.getPropertyByName('force_up');
		if(enabled) {
		let circle = global.getCirclePositions(entity.blockPosition(), radius, 0.15);
		entity.getLevel().getPlayers().forEach(player => {
			if (player.getDistance(entity.blockPosition()) <= radius) {
						circle.forEach(circlepos => {
							if(all_players) {
								player.sendData(`render_particle`, global.packageRenderParticleData(particle, circlepos.x,circlepos.y,circlepos.z, 0.1, force_up, 0.1, 2, 0.1 ))
							} else {
								entity.sendData(`render_particle`, global.packageRenderParticleData(particle, circlepos.x,circlepos.y,circlepos.z, 0.1, force_up, 0.1, 2, 0.1 ))
							}
						});
			}
		})
	}
	})
	.tick((entity, entry, holder, enabled) => { 
		let radius = entry.getPropertyByName('radius');
		let spawn_animation = entry.getPropertyByName('spawn_animation');
		let all_players = entry.getPropertyByName('all_players');

		let circle = global.getCirclePositions(entity.blockPosition, radius, 0.15);
		entity.getLevel().getPlayers().forEach(player => {
			if (player.getDistance(entity.blockPosition) <= radius) {
						circle.forEach(circlepos => {
							if(all_players) {
								player.sendData(`render_particle`, global.packageRenderParticleData(particle, circlepos.x,circlepos.y,circlepos.z, 0.1, force_up, 0.1, 2, 0.1 ))
							} else {
								entity.sendData(`render_particle`, global.packageRenderParticleData(particle, circlepos.x,circlepos.y,circlepos.z, 0.1, force_up, 0.1, 2, 0.1 ))
							}
						});
			}
		})
	})

	event.create("godsblessing:think_act_redo")
		.addProperty("name", "string", "think_act_redo", "id.")
		.icon(palladium.createItemIcon('minecraft:wither_skull'))
		.documentationDescription('Speed up, Record, Rewind, Play.')
		.firstTick((entity, entry, holder, enabled) => {
			if(enabled) {
				let id = entry.getPropertyByName('name');
				entity.getLevel().runCommand(`mocap recordings remove ${id}`)
				entity.getLevel().runCommandSilent(`effect give ${entity.getUuid()} minecraft:haste infinite 5 true`)
				entity.getLevel().runCommandSilent(`effect give ${entity.getUuid()} minecraft:speed infinite 5 true`)
				entity.getLevel().runCommandSilent(`effect give ${entity.getUuid()} caverns_and_chasms:rewind infinite 1 true`)
				entity.getLevel().runCommand(`mocap recording start ${entity.getDisplayName().getString()}`)
			}
		})
		.lastTick((entity, entry, holder, enabled) => { 
			if(enabled) {
				let id = entry.getPropertyByName('name');
				entity.getLevel().runCommandSilent(`effect clear ${entity.getUuid()} minecraft:haste`)
				entity.getLevel().runCommandSilent(`effect clear ${entity.getUuid()} minecraft:speed`)
				entity.getLevel().runCommandSilent(`effect clear ${entity.getUuid()} caverns_and_chasms:rewind`)
				entity.getLevel().runCommand(`mocap recording stop`) 
				entity.getLevel().runCommand(`mocap recording save ${id}`) 
				entity.getLevel().runCommand(`mocap playing start ${id}`)
			}
		})

	event.create("godsblessing:soul_barrier")
		.icon(palladium.createItemIcon('minecraft:wither_skull'))
		.documentationDescription('Blocks damage, takes souls doing so.')

		event.create("godsblessing:holy_touch")
		.icon(palladium.createItemIcon('minecraft:gold_ingot'))
		.documentationDescription('Everything Gold becomes holy.')	
		.firstTick((entity, entry, holder, enabled)=> {
			if(enabled) {
				let mainhand = entity.getMainHandItem()
				if(mainhand.getId() === "minecraft:gold_ingot") {
      if (!mainhand.getTagElement("blessed")) {
        let name = mainhand.getDisplayName().getString()
        let holyversion = mainhand.copy().withName("Holy " + name.replace("[", "").replace("]", ""))
        let newTag = new $CompoundTag()
        let blessamount =  1
        newTag.putDouble("bless_amount", blessamount)
        holyversion.addTagElement("blessed", newTag)
        entity.setMainHandItem(holyversion)
      }
				}
			}
		})
			
		event.create("godsblessing:smite")
		.icon(palladium.createItemIcon('minecraft:iron_sword'))
		.documentationDescription('Entity you are looking at.')	
		.firstTick((entity, entry, holder, enabled)=> {
			if(enabled) {
				let raycast = entity.rayTrace(100, true)
				if(raycast?.entity) {
					  spawnHoverOrb(
    					entity.getLevel(),
    					raycast.entity,
    					'minecraft:iron_sword',
    					3.0,   // hoverHeight
    					0.2,   // followSpeed
    					0.5,   // fallSpeed
   						 0.05,     // damage
						 entity.getUuid()
 			 	);
			//	raycast.entity.runCommandSilent(`function magiccircle30:_/create`)
			//	raycast.entity.runCommandSilent(`function magiccircle30:a/magic_circle_spawning_1/play_loop`)
				}
			}
		})
			.lastTick((entity, entry, holder, enabled) => {
					let entities = entity.getLevel().getEntities()
					entities.forEach(e => {
						let pd = e.getPersistentData();
						if (e.getType() === 'minecraft:item_display'
							&& pd
							&& pd.contains('target')
							&& pd.contains('state')
							&& pd.contains(`followSpeed`)
						) {
							entity.server.runCommandSilent(`execute as ${e.getUuid()} run data modify entity @s KubeJSPersistentData.state set value "fall"`)
							
							//entity.runCommandSilent(`function magiccircle30:_/delete`)
						}
					})
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
		if (tags[i].equals(tag)) {
			return true;
		}
	}
	return false;
}