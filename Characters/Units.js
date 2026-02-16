(function () {
    const scripts = [
         "Characters/Units/core/UnitBase.js",
         "Characters/Units/core/UnitNavigation.js",
         "Characters/Units/core/UnitCombat.js",
         "Characters/Units/core/UnitStatics.js",
         "Characters/Units/core/UnitDockActions.js",
         "Characters/Units/core/AttackableUnitBase.js",
         "Characters/Units/core/AttackableUnitAI.js",
         "Characters/Units/core/AttackableUnitStatics.js",
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
