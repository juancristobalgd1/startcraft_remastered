(function () {
    var scripts = [
        "Characters/Zergs/core/ZergBase.js",
        "Characters/Zergs/workers/ZergWorkers.js",
        "Characters/Zergs/ground/ZergGround.js",
        "Characters/Zergs/air/ZergAir.js",
        "Characters/Zergs/support/ZergSupport.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
