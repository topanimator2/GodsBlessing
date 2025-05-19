LootJS.modifiers((event) => {
    event
    .addLootTableModifier("born_in_chaos_v1:entities/nightmare_stalker")
        .randomChance(0.6)
        .addLoot("withered_soul:orb_of_watching");
  });