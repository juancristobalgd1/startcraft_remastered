(function () {
    var scripts = [
        "Characters/Animations/core/AnimationBase.js",
        "Characters/Animations/magic/MagicSet1.js",
        "Characters/Animations/magic/MagicSet2.js",
        "Characters/Animations/magic/MagicSet3.js",
        "Characters/Animations/evolve/Evolve.js",
        "Characters/Animations/damage/Damage.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        var scr = document.createElement('script');
        scr.src = scripts[i];
        document.head.appendChild(scr);
    }
})();
