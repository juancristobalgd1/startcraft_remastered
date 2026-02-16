(function () {
    const scripts = [
        "Characters/Buildings/core/BuildingBase.js",
        "Characters/Buildings/core/BuildingRaces.js",
        "Characters/Buildings/core/BuildingAttackable.js",
        "Characters/Buildings/zerg/ZergCore1.js",
        "Characters/Buildings/zerg/ZergCore2.js",
        "Characters/Buildings/zerg/ZergSpecial.js",
        "Characters/Buildings/zerg/ZergEvolve.js",
        "Characters/Buildings/terran/TerranCore1.js",
        "Characters/Buildings/terran/TerranCore2.js",
        "Characters/Buildings/terran/TerranAddons.js",
        "Characters/Buildings/terran/TerranSpecial.js",
        "Characters/Buildings/protoss/ProtossCore1.js",
        "Characters/Buildings/protoss/ProtossTech1.js",
        "Characters/Buildings/protoss/ProtossTech2.js",
        "Characters/Buildings/protoss/ProtossSpecial.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
