EntityEvents.death(event => {
  let OBJECTIVE_ID = 'undead_death'
  let entity = event.getEntity();
  let attacker
  if (attacker = event.getSource().getPlayer()) {
    if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:angel")) {
      let board = attacker.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
      if (attacker) {
        if(entity.isUndead()) {
        let score = board.getOrCreatePlayerScore(attacker.getName().getString(), objective);
        score.add(1)
        }
      }
    }
  }
})