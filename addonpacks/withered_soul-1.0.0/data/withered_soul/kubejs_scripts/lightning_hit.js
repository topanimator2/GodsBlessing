EntityEvents.hurt(event => {
  let OBJECTIVE_ID = 'lightning_affinity'
  let entity = event.getEntity();
  let attacker
  if (attacker = event.getSource().getPlayer()) {
    if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:phantom")) {
      let board = attacker.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      if (attacker) {
        let score = board.getOrCreatePlayerScore(attacker.getName().getString(), objective);
        if (score.getScore() >= 9 && attacker.getLevel().isRaining()) {
          entity.server.runCommandSilent(`execute in ${entity.getLevel().getDimension()} run summon minecraft:lightning_bolt ${entity.x} ${entity.y} ${entity.z}`)
        }
      }
    }
  }
})