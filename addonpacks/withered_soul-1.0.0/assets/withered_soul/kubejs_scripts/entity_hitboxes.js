let $AABB = Java.loadClass(`net.minecraft.world.phys.AABB`)

NetworkEvents.dataReceived('entity_hitboxes', event => { 
    let Tag = event.data
    let uuid = Tag.getUUID("entityUUId")
    let entities = event.player.level.getEntities()

    let minx = Tag.getDouble("minx")
    let miny = Tag.getDouble("miny")
    let minz = Tag.getDouble("minz")

    let maxx = Tag.getDouble("maxx")
    let maxy = Tag.getDouble("maxy")
    let maxz = Tag.getDouble("maxz")
    let BoundingBox = new $AABB(
        minx,miny,minz,
        maxx,maxy,maxz
    )

    entities.forEach(e => {
            if(uuid.toString() == e.getUuid().toString()) {
            e.setBoundingBox(BoundingBox.move(e.getBlockX(),e.getBlockY(),e.getBlockZ()))
            }
    });
})