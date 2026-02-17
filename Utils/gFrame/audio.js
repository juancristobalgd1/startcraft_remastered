Audio.prototype.playFromStart = function () {
  this.pause();
  this.currentTime = 0;
  this.play();
};

// ─── AudioRegistry ─────────────────────────────────────────────

class AudioRegistry {
  static #items = [];

  static get items() {
    return this.#items;
  }

  static register(audio) {
    if (!audio || this.#items.indexOf(audio) !== -1) return;
    this.#items.push(audio);
  }

  static pauseAll() {
    for (let i = 0, len = this.#items.length; i < len; i++) {
      const a = this.#items[i];
      if (!a) continue;
      let playing = false;
      try {
        playing = !a.paused && !a.ended;
      } catch {
        /* noop */
      }
      a.__wasPlayingBeforePause = playing;
      if (playing) {
        try {
          a.pause();
        } catch {
          /* noop */
        }
      }
    }
  }

  static resumeAll() {
    for (let i = 0, len = this.#items.length; i < len; i++) {
      const a = this.#items[i];
      if (!a || !a.__wasPlayingBeforePause) continue;
      a.__wasPlayingBeforePause = false;
      try {
        a.play()?.catch(() => {});
      } catch {
        /* noop */
      }
    }
  }
}

// ─── BgmResolver ───────────────────────────────────────────────

class BgmResolver {
  static map = (() => {
    const m = {};
    const add = (folder, names) => {
      for (let i = 0; i < names.length; i++) m[names[i]] = folder;
    };
    add("Terran", [
      "Marine",
      "Firebat",
      "Ghost",
      "Medic",
      "SCV",
      "Vulture",
      "Tank",
      "Goliath",
      "Wraith",
      "Valkyrie",
      "BattleCruiser",
      "Dropship",
      "Vessel",
      "Civilian",
      "Sarah",
      "HeroCruiser",
      "Kerrigan",
      "TerranBuilding",
    ]);
    add("Protoss", [
      "Zealot",
      "Dragoon",
      "Templar",
      "DarkTemplar",
      "Archon",
      "DarkArchon",
      "Reaver",
      "Scout",
      "Carrier",
      "Arbiter",
      "Corsair",
      "Shuttle",
      "Observer",
      "Probe",
      "ProtossBuilding",
    ]);
    add("Zerg", [
      "Zergling",
      "Hydralisk",
      "Lurker",
      "Ultralisk",
      "Defiler",
      "Drone",
      "Overlord",
      "Queen",
      "Mutalisk",
      "Guardian",
      "Devourer",
      "Scourge",
      "Broodling",
      "Larva",
      "InfestedTerran",
      "ZergBuilding",
      "Egg",
      "Cocoon",
      "Colony",
      "Zerg",
    ]);
    add("Neutral", [
      "Bengalaas",
      "Kakaru",
      "Ragnasaur",
      "Rhynsdon",
      "Scantid",
      "Ursadon",
    ]);
    add("Effects", [
      "FireSpark",
      "VultureSpark",
      "GreenFog",
      "Greenball",
      "PurpleCloud",
      "DragoonBall",
      "ReaverBomb",
      "Sunken",
      "Missle",
      "Overload",
      "Building",
    ]);
    add("Magic", ["Magic"]);
    add("UI", [
      "GameWin",
      "GameLose",
      "YouWin",
      "YouLose",
      "LevelSelect",
      "Button",
      "PointError",
      "gas",
      "mine",
      "man",
      "magic",
      "upgrade",
    ]);
    return m;
  })();

  static resolve(src) {
    if (!src || src.indexOf("bgm/") !== 0) return src;
    const file = src.slice(4);
    const prefix = file.split(".")[0];
    const folder =
      this.map[prefix] ?? (file.endsWith(".burst.wav") ? "Effects" : null);
    return folder ? `bgm/${folder}/${file}` : src;
  }
}

// ─── Audio Constructor Wrap (one-time) ─────────────────────────

if (!Audio.__scWrappedBgm) {
  Audio.__scWrappedBgm = true;
  const __nativeAudio = Audio;
  const WrappedAudio = function (src) {
    if (typeof src === "string") src = BgmResolver.resolve(src);
    return new __nativeAudio(src);
  };
  WrappedAudio.prototype = __nativeAudio.prototype;
  window.Audio = WrappedAudio;
}

// ─── Audio.play Patch (one-time) ───────────────────────────────

if (!Audio.prototype.__scAudioPlayPatched) {
  Audio.prototype.__scAudioPlayPatched = true;
  const __nativePlay = Audio.prototype.play;
  Audio.prototype.play = function () {
    AudioRegistry.register(this);
    const p = __nativePlay.apply(this, arguments);
    p?.catch(() => {});
    return p;
  };
}

// ─── LazyAudio ─────────────────────────────────────────────────

class LazyAudio {
  #src;
  #audio = null;

  constructor(src) {
    this.#src = src;
  }

  #ensure() {
    if (!this.#audio) this.#audio = new Audio(this.#src);
    AudioRegistry.register(this.#audio);
    return this.#audio;
  }

  play() {
    try {
      const p = this.#ensure().play();
      p?.catch(() => {});
      return p;
    } catch {
      return null;
    }
  }

  pause() {
    this.#audio?.pause();
  }

  playFromStart() {
    try {
      this.#ensure().playFromStart();
    } catch {
      /* noop */
    }
  }
}

// ─── Backward Compatibility Bindings ───────────────────────────

_$.audioRegistry = AudioRegistry.items;
_$.registerAudio = (audio) => AudioRegistry.register(audio);
_$.pauseAllAudio = () => AudioRegistry.pauseAll();
_$.resumeAllAudio = () => AudioRegistry.resumeAll();
_$.bgmFolderByPrefix = BgmResolver.map;
_$.resolveBgmSrc = (src) => BgmResolver.resolve(src);
_$.lazyAudio = (src) => new LazyAudio(src);
