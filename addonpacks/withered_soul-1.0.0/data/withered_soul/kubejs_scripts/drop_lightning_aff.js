LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/phantom")
        .randomChance(0.15)
        .addLoot("withered_soul:lightning_affinity");
  });