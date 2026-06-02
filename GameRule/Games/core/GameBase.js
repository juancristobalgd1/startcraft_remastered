import '../../../Utils/jquery.min.js';

const $ = globalThis.$;

const Game = {
    // Basic properties - use dynamic dimensions like legacy
    HBOUND: (typeof innerWidth !== 'undefined') ? innerWidth : 800,
    VBOUND: (typeof innerHeight !== 'undefined') ? innerHeight : 600,
    isPaused: false,
    _timer: -1,
    _frameInterval: 100,
    _clock: 0,
    get mainTick() { return this._clock; },
    replayFlag: false,
    replay: {},
    race: {
        selected: "Zerg" // Default to Zerg as per the instruction's implied default
    },
    level: 1,
    selectedUnit: {},
    allSelected: [],
    selectionCap: Infinity,
    teams: [],
    team: 0,
    _oldAllSelected: [],

    // Core objects
    pathfinding: null,
    metrics: { enabled: false },
    ui: { lastMetrics: {}, lastSelected: {}, lastResource: {}, lastProcessing: {} },
    infoBox: {
        x: 145,
        y: (typeof innerHeight !== 'undefined') ? (innerHeight - 110) : 490,
        width: (typeof innerWidth !== 'undefined') ? (innerWidth - 295) : 505,
        height: 110
    },
    uiScale: 'normal',
    fontScale: 'normal',
    reducedMotion: false,
    hapticsEnabled: true,
    commands: {},
    commandTimeout(func, delay) {
        const dueTick = Game._clock + (delay / 100 >> 0);
        if (!Game.commands[dueTick]) Game.commands[dueTick] = [];
        Game.commands[dueTick].push(func);
    },
    commandInterval(func, interval) {
        const funcAdjust = function () {
            func();
            Game.commandTimeout(funcAdjust, interval);
        };
        Game.commandTimeout(funcAdjust, interval);
    }
};

// Global assignment for legacy support
if (typeof window !== 'undefined') {
    window.Game = Game;
}

export default Game;
