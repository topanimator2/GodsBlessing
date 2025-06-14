LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/zombie")
        .randomChance(0.05)
        .addLoot("withered_soul:holy_emblem");
  });