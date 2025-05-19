EntityEvents.hurt(event => {
  let OBJECTIVE_ID = 'rage'
  let entity = event.getEntity();
    if (palladium.superpowers.hasSuperpower(entity, "withered_soul:berserker")) {
      let board = entity.getScoreboard();
      let objective = board.getObjective(OBJECTIVE_ID);
        let score = board.getOrCreatePlayerScore(entity.getName().getString(), objective);
        score.increment()
    }
})