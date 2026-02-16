(function () {
    const scripts = [
        "Characters/Animations/core/AnimationBase.js",
        "Characters/Animations/magic/MagicSet1.js",
        "Characters/Animations/magic/MagicSet2.js",
        "Characters/Animations/magic/MagicSet3.js",
        "Characters/Animations/evolve/Evolve.js",
        "Characters/Animations/damage/Damage.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
