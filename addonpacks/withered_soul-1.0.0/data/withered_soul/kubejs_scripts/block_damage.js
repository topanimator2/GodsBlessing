
EntityEvents.hurt(event => {
    let OBJECTIVE_ID = 'withred_soul.souls'
    let player = event.getEntity();
    let source = event.getSource()
    if (player.getType().toString() === "minecraft:player") {
            if (palladium.abilities.isEnabled(player, "withered_soul:withred", "soul_barrier")) {
                let board = player.getScoreboard();
                let objective = board.getObjective(OBJECTIVE_ID);
                let score = board.getOrCreatePlayerScore(player.getName().getString(), objective);
                if(score.getScore() >= 1) {
                    let typeId = source.type().msgId();
                    if(typeId.match(/magic|spell/)) {
                         score.add(-(event.getDamage()*3))
                         console.log("magic")
                    } else 
                    if (typeId === 'wither'){
                         score.add(event.getDamage())
                    } else {
                        score.add(-event.getDamage())
                    }
                event.cancel()
                } else {
                   player.actuallyHurt(source, event.getDamage())
                }
            }
    }
})