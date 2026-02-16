(function () {
    const scripts = [
        "Characters/Protosses/core/ProtossBase.js",
        "Characters/Protosses/workers/ProtossWorkers.js",
        "Characters/Protosses/ground/ProtossGround.js",
        "Characters/Protosses/air/ProtossAir.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><' + '/script>');
    }
})();
