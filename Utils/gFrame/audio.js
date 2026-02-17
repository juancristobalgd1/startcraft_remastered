Audio.prototype.playFromStart = function () {
  this.pause();
  this.currentTime = 0;
  this.play();
};

_$.audioRegistry = [];

_$.registerAudio = function (audio) {
  if (!audio || _$.audioRegistry.indexOf(audio) !== -1) return;
  _$.audioRegistry.push(audio);
};

_$.pauseAllAudio = function () {
  var a, playing;
  for (var i = 0, len = _$.audioRegistry.length; i < len; i++) {
    a = _$.audioRegistry[i];
    if (!a) continue;
    playing = false;
    try { playing = !a.paused && !a.ended; } catch (e) { }
    a.__wasPlayingBeforePause = playing;
    if (playing) {
      try { a.pause(); } catch (e) { }
    }
  }
};

_$.resumeAllAudio = function () {
  var a, p;
  for (var i = 0, len = _$.audioRegistry.length; i < len; i++) {
    a = _$.audioRegistry[i];
    if (!a || !a.__wasPlayingBeforePause) continue;
    a.__wasPlayingBeforePause = false;
    try {
      p = a.play();
      if (p && typeof p.catch === 'function') p.catch(function () { });
    } catch (e) { }
  }
};

_$.bgmFolderByPrefix = (function () {
  var map = {};
  var add = function (folder, names) {
    for (var i = 0; i < names.length; i++) {
      map[names[i]] = folder;
    }
  };
  add("Terran", [
    "Marine", "Firebat", "Ghost", "Medic", "SCV", "Vulture", "Tank", "Goliath", "Wraith", "Valkyrie",
    "BattleCruiser", "Dropship", "Vessel", "Civilian", "Sarah", "HeroCruiser", "Kerrigan", "TerranBuilding"
  ]);
  add("Protoss", [
    "Zealot", "Dragoon", "Templar", "DarkTemplar", "Archon", "DarkArchon", "Reaver", "Scout",
    "Carrier", "Arbiter", "Corsair", "Shuttle", "Observer", "Probe", "ProtossBuilding"
  ]);
  add("Zerg", [
    "Zergling", "Hydralisk", "Lurker", "Ultralisk", "Defiler", "Drone", "Overlord", "Queen", "Mutalisk",
    "Guardian", "Devourer", "Scourge", "Broodling", "Larva", "InfestedTerran", "ZergBuilding", "Egg",
    "Cocoon", "Colony", "Zerg"
  ]);
  add("Neutral", ["Bengalaas", "Kakaru", "Ragnasaur", "Rhynsdon", "Scantid", "Ursadon"]);
  add("Effects", ["FireSpark", "VultureSpark", "GreenFog", "Greenball", "PurpleCloud", "DragoonBall", "ReaverBomb", "Sunken", "Missle", "Overload", "Building"]);
  add("Magic", ["Magic"]);
  add("UI", ["GameWin", "GameLose", "YouWin", "YouLose", "LevelSelect", "Button", "PointError", "gas", "mine", "man", "magic", "upgrade"]);
  return map;
})();
_$.resolveBgmSrc = function (src) {
  if (!src || src.indexOf('bgm/') !== 0) return src;
  var file = src.slice(4);
  var prefix = file.split('.')[0];
  var folder = _$.bgmFolderByPrefix[prefix];
  if (!folder && file.endsWith('.burst.wav')) folder = "Effects";
  return folder ? ("bgm/" + folder + "/" + file) : src;
};

if (!Audio.__scWrappedBgm) {
  Audio.__scWrappedBgm = true;
  var __nativeAudio = Audio;
  var WrappedAudio = function (src) {
    if (typeof src === 'string') src = _$.resolveBgmSrc(src);
    return new __nativeAudio(src);
  };
  WrappedAudio.prototype = __nativeAudio.prototype;
  window.Audio = WrappedAudio;
}

if (!Audio.prototype.__scAudioPlayPatched) {
  Audio.prototype.__scAudioPlayPatched = true;
  var __nativePlay = Audio.prototype.play;
  Audio.prototype.play = function () {
    if (window._$ && _$.registerAudio) _$.registerAudio(this);
    var p = __nativePlay.apply(this, arguments);
    if (p && typeof p.catch === 'function') p.catch(function () { });
    return p;
  };
}

_$.lazyAudio = function (src) {
  return {
    _audio: null,
    _ensure: function () {
      if (!this._audio) this._audio = new Audio(src);
      if (window._$ && _$.registerAudio) _$.registerAudio(this._audio);
      return this._audio;
    },
    play: function () {
      try {
        var p = this._ensure().play();
        if (p && typeof p.catch === 'function') p.catch(function () { });
        return p;
      } catch (e) { return null; }
    },
    pause: function () {
      if (this._audio) this._audio.pause();
    },
    playFromStart: function () {
      try { this._ensure().playFromStart(); } catch (e) { }
    }
  };
};
