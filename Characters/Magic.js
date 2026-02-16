(function () {
    var scripts = [
        "Characters/Magics/core/MagicBase.js",
        "Characters/Magics/zerg/ZergMagic.js",
        "Characters/Magics/terran/TerranMagic.js",
        "Characters/Magics/protoss/ProtossMagic.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
