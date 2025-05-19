LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/enderman")
        .randomChance(0.3)
        .addLoot("withered_soul:orb_of_reawakening");
  });