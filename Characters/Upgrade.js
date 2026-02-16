(function () {
    const scripts = [
        "Characters/Upgrades/core/UpgradeBase.js",
        "Characters/Upgrades/terran/TerranUpgrades.js",
        "Characters/Upgrades/zerg/ZergUpgrades.js",
        "Characters/Upgrades/protoss/ProtossUpgrades.js",
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
