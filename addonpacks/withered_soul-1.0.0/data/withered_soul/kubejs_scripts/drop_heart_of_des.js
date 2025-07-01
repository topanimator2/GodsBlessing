LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/ghast")
        .randomChance(0.1)
        .addLoot("withered_soul:heart_of_destruction");
  });