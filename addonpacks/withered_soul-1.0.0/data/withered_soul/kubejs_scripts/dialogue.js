PlayerEvents.tick(event => {
    const player = event.player;
    if(player.getPersistentData().contains("DialogueSpeaker"))
    {
        if(player.getPersistentData().DialogueSpeaker[0] === 'robot_assistant') {
            global.printDialogueOverlay(player, ['robot_assistant', "Robot Assistant"]);
        }
    }
    else
    {
        event.player.paint({'*': {remove: true}})
    }
})
