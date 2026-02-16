(function () {
  var scripts = [
    "Utils/gFrame/core",
    "Utils/gFrame/utils",
    "Utils/gFrame/inheritance",
    "Utils/gFrame/audio",
    "Utils/gFrame/modules"
  ];
  for (var i = 0; i < scripts.length; i++) {
    document.write('<script src="' + scripts[i] + '.js"><\/script>');
  }
})();
