// kubejs/startup_scripts/hex_reflection.js
/*
StartupEvents.postInit(() => {
  // 1) Load the TechTastic registry and entry classes
  const HMPRegistryCL = Java.loadClass(
    'io.github.techtastic.hexmapping.registry.HexMappingPatternRegistry'
  );
  const EntryCL = Java.loadClass(
    'io.github.techtastic.hexmapping.registry.ActionRegistryEntry'
  );

  // 2) (Optional) load HexPattern & HexDir if your entry needs it
  const HexPatternCL = Java.loadClass(
    'at.petrak.hexcasting.api.casting.math.HexPattern'
  );
  const HexDirCL = Java.loadClass(
    'at.petrak.hexcasting.api.casting.math.HexDir'
  );

  // 3) Build the entry instance
  //    — inspect the constructor in your IDE for the right signature!
  //    Commonly it’s something like:
  //      ActionRegistryEntry(HexPattern pattern, boolean reqEnlightenment, boolean triggersBlind, int cost)
  const pattern = HexPatternCL.fromAngles('wdwe', HexDirCL.NORTH_EAST);
  const requiresEnlightenment  = false;
  const triggersBlindDiversion = false;
  const costMedia               = 50_000;
  const entry = new EntryCL(
    pattern,
    requiresEnlightenment,
    triggersBlindDiversion,
    costMedia
  );

  // 4) Call register
  //    The first arg is the string ID (no namespace), second is your entry:
  HMPRegistryCL.register('levitation_totem', entry);

  console.info('[KubeJS] → Registered TechTastic Hex pattern “levitation_totem”');
});
*/