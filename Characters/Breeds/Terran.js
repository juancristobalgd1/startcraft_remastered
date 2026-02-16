(function () {
    var scripts = [
        "Characters/Terrans/core/TerranBase.js",
        "Characters/Terrans/workers/TerranWorkers.js",
        "Characters/Terrans/infantry/TerranInfantry.js",
        "Characters/Terrans/vehicles/TerranVehicles.js",
        "Characters/Terrans/air/TerranAir.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
