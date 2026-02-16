(function () {
    const scripts = [
        "GameRule/Referees/core/RefereeBase.js",
        "GameRule/Referees/vision/RefereeVision.js",
        "GameRule/Referees/movement/RefereeMovement.js",
        "GameRule/Referees/world/RefereeWorld.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
