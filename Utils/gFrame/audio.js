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
