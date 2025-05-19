LootJS.modifiers((event) => {
    event
    .addLootTableModifier("minecraft:entities/wither_skeleton")
        .matchMainHand(Item.of("minecraft:wooden_hoe").ignoreNBT())
        .randomChance(0.5)
        .addLoot("withered_soul:orb_of_death_and_rebirth");
        
  });