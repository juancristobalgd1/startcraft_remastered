(function () {
    var scripts = [
        "Characters/Heroes/core/HeroBase.js",
        "Characters/Heroes/units/HeroUnits.js",
        "Characters/Heroes/post/HeroPost.js"
    ];
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
