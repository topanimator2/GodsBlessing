EntityEvents.hurt(event => {
  let entity = event.getEntity();
  let attacker
  if (attacker = event.getSource().getPlayer()) {
    if (palladium.superpowers.hasSuperpower(attacker, "withered_soul:destruction")) {
      if (attacker) {
          entity.setRemainingFireTicks(40)
      }
    }
  }
})