(function () {
    const scripts = [
        "Characters/Buttons/core/ButtonBase.js",
        "Characters/Buttons/menus/ButtonMenus.js",
        "Characters/Buttons/core/ButtonEquip.js",
        "Characters/Buttons/core/ButtonHandlers.js"
    ];
    for (let i = 0; i < scripts.length; i++) {
        document.write('<script src="' + scripts[i] + '"><\/script>');
    }
})();
