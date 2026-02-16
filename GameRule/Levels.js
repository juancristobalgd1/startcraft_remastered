(function () {
    const scripts = [
        "GameRule/Levels/core/LevelsBase.js",
        "GameRule/Levels/sets/LevelsSet1.js",
        "GameRule/Levels/sets/LevelsSet2.js",
        "GameRule/Levels/sets/LevelsSet3.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
