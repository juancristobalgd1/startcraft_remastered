(function () {
    const scripts = [
         "Characters/Units/core/UnitBase.js",
         "Characters/Units/core/AttackableUnitBase.js",
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
