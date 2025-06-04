
// 3 ▸ store or remove data as soon as it arrives
NetworkEvents.dataReceived('fake_entity', e => {
  let tag = e.data.getCompound(`entityInfo`)
  let id = tag.getString('id')
  if (tag.getDouble('remove')) delete global.FAKE[id];
  else
    global.FAKE[e.data.id] = {
    id   : tag.id,
    name : tag.name,
    x    : tag.x,
    y    : tag.y,
    z    : tag.z,
    yRot : tag.yRot,
    xRot : tag.xRot
  };
});
