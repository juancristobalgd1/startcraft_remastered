(function () {
    const scripts = [
        "Characters/Breeds/Zerg.js",
        "Characters/Breeds/Terran.js",
        "Characters/Breeds/Protoss.js",
        "Characters/Breeds/Neutral.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"></script>');
    }
})();
