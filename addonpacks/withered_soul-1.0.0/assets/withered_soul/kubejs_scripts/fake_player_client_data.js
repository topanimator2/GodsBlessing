// Sure we can detect on client side if the player is holding an axe
// However we also need the username of the player when the event is executed on the server side
NetworkEvents.dataReceived("clientfakeentity", event => {
    const { entity: { persistentData } } = event;
     if (!persistentData.StandpointTeleportationLocation) persistentData.StandpointTeleportationLocation = [];
    persistentData.StandpointTeleportationLocation.push(event.data);
});

NetworkEvents.dataReceived("myData", event => {
    const { entity: { persistentData, username } } = event;
    if (!persistentData.ModelsToRender) persistentData.ModelsToRender = [];
    if (!persistentData.ModelsToRender.some(model => model.Name === username)) {
        persistentData.ModelsToRender.push({ Name: username });
    }
});