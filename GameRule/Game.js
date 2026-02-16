(function () {
    var scripts = [
        "GameRule/Games/core/GameBase.js",
        "GameRule/Games/selection/GameSelection.js",
        "GameRule/Games/ui/GameUI.js",
        "GameRule/Games/render/GameRender.js",
        "GameRule/Games/lifecycle/GameLifecycle.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();

