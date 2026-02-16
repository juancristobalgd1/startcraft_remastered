var Referee = {
    ourDetectedUnits: [],
    enemyDetectedUnits: [],
    ourUnderArbiterUnits: [],
    enemyUnderArbiterUnits: [],
    _pos: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    unique: (arr) => [...new Set(arr)],
    voice: {
        pError: _$.lazyAudio('bgm/PointError.wav'),
        button: _$.lazyAudio('bgm/Button.wav'),
        resource: {
            Zerg: {
                mine: _$.lazyAudio('bgm/mine.Zerg.wav'),
                gas: _$.lazyAudio('bgm/gas.Zerg.wav'),
                man: _$.lazyAudio('bgm/man.Zerg.wav'),
                magic: _$.lazyAudio('bgm/magic.Zerg.wav')
            },
            Terran: {
                mine: _$.lazyAudio('bgm/mine.Terran.wav'),
                gas: _$.lazyAudio('bgm/gas.Terran.wav'),
                man: _$.lazyAudio('bgm/man.Terran.wav'),
                magic: _$.lazyAudio('bgm/magic.Terran.wav')
            },
            Protoss: {
                mine: _$.lazyAudio('bgm/mine.Protoss.wav'),
                gas: _$.lazyAudio('bgm/gas.Protoss.wav'),
                man: _$.lazyAudio('bgm/man.Protoss.wav'),
                magic: _$.lazyAudio('bgm/magic.Protoss.wav')
            }
        },
        upgrade: {
            Zerg: _$.lazyAudio('bgm/upgrade.Zerg.wav'),
            Terran: _$.lazyAudio('bgm/upgrade.Terran.wav'),
            Protoss: _$.lazyAudio('bgm/upgrade.Protoss.wav')
        }
    },
    winCondition: () => {
        return (Unit.allEnemyUnits().length == 0 && Building.enemyBuildings.length == 0);
    },
    loseCondition: () => {
        return (Unit.allOurUnits().length == 0 && Building.ourBuildings.length == 0);
    }
};
