LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/enderman")
        .randomChance(0.1)
        .addLoot("withered_soul:orb_of_ender");
  });