(function () {
    var scripts = [
        "Characters/Bullets/core/BulletsBase.js",
        "Characters/Bullets/zerg/ZergBullets.js",
        "Characters/Bullets/terran/TerranBullets.js",
        "Characters/Bullets/protoss/ProtossBullets.js",
        "Characters/Bullets/mappings/Assignments.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
