(function () {
    var scripts = [
        "Characters/Bursts/core/BurstBase.js",
        "Characters/Bursts/zerg/ZergEffects1.js",
        "Characters/Bursts/terran/TerranEffects.js",
        "Characters/Bursts/protoss/ProtossEffects1.js",
        "Characters/Bursts/protoss/ProtossEffects2.js",
        "Characters/Bursts/buildings/BuildingBursts.js",
        "Characters/Bursts/zerg/ZergDeaths.js",
        "Characters/Bursts/zerg/ZergBirths.js",
        "Characters/Bursts/neutral/NeutralBursts.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
