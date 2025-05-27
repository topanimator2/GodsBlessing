// Sure we can detect on client side if the player is holding an axe
// However we also need the username of the player when the event is executed on the server side
NetworkEvents.dataReceived("myData", event => {
    const { entity: { persistentData, username }, data: { HoldingAxe } } = event;
    persistentData.put(username, { HoldingAxe: HoldingAxe });
    if (!persistentData.ModelsToRender) persistentData.ModelsToRender = [];
    if (!persistentData.ModelsToRender.some(model => model.Name === username)) {
        persistentData.ModelsToRender.push({ Name: username });
    }
});