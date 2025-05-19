LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/phantom")
        .randomChance(0.1)
        .addLoot("withered_soul:lightning_affinity");
  });