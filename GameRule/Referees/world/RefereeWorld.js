Referee.monitorMiniMap = () => {
    if (Game._clock % 10 == 0) {
        GameMap.refreshMiniMap();
    }
};
Referee.coverFog = () => {
    GameMap.drawFog();
};
Referee.alterSelectionMode = function () {
    if (!Game.allSelected) return;
    $.extend([], Game.allSelected).forEach((chara) => {
        if (chara.status == 'dead' || (chara.isInvisible && chara.isEnemy))
            Game.allSelected.splice(Game.allSelected.indexOf(chara), 1);
    });
    if (Game.allSelected.length > 1) {
        if (_$.arrayEqual(Game.allSelected, Game._oldAllSelected)) {
            Game.refreshMultiSelectBox();
        }
        else {
            Game.drawMultiSelectBox();
            Game._oldAllSelected = _$.mixin([], Game.allSelected);
        }
        $('div.override').show();
        $('div.override div.multiSelection').show();
    }
    else {
        $('div.override').hide();
        $('div.override div.multiSelection').hide();
    }
};
Referee.addLarva = () => {
    if (Game._clock % 200 == 0) {
        Building.allBuildings.filter((chara) => chara.produceLarva).forEach((chara) => {
            for (let N = 0; N < 3; N++) {
                if (chara.larvas[N] == null || chara.larvas[N].status == "dead") {
                    chara.larvas[N] = new Zerg.Larva({ x: (chara.x + N * 48), y: (chara.y + chara.height), isEnemy: chara.isEnemy });
                    break;
                }
            }
        });
    }
};
Referee.judgeMan = function () {
    let curMan = 0, totalMan = 0;
    Unit.allOurUnits().concat(Building.ourBuildings).forEach((chara) => {
        if (chara.cost && chara.cost.man) curMan += chara.cost.man;
        if (chara.manPlus) totalMan += chara.manPlus;
    });
    Resource[0].curMan = curMan;
    Resource[0].totalMan = totalMan;
    curMan = 0;
    totalMan = 0;
    Unit.allEnemyUnits().concat(Building.enemyBuildings).forEach((chara) => {
        if (chara.cost && chara.cost.man) curMan += chara.cost.man;
        if (chara.manPlus) totalMan += chara.manPlus;
    });
    Resource[1].curMan = curMan;
    Resource[1].totalMan = totalMan;
};
Referee.judgeWinLose = function () {
    if (Referee.loseCondition())
        Game.lose();
    if (Referee.winCondition())
        Game.win();
};

Referee.judgeBuildingInjury = function () {
    Building.allBuildings.forEach((chara) => {
        if (!chara.injuryAnimations) {
            chara.injuryAnimations = [];
        }

        if (chara.status === 'dead') {
            chara.injuryAnimations.forEach(anime => anime.die());
            chara.injuryAnimations = [];
            return;
        }

        let hpRatio = chara.HP / chara.get('maxHP');
        let neededCount = 0;
        if (hpRatio < 0.15) {
            neededCount = 3;
        } else if (hpRatio < 0.33) {
            neededCount = 2;
        } else if (hpRatio < 0.50) {
            neededCount = 1;
        }

        if (!chara.injuryNames) {
            let race = chara.race || 'Terran';
            if (race === 'Zerg') {
                chara.injuryNames = ['bloodA', 'bloodB', 'bloodC'];
            } else if (race === 'Protoss') {
                chara.injuryNames = ['blueFireL', 'blueFireM', 'blueFireR'];
            } else {
                chara.injuryNames = ['redFireL', 'redFireM', 'redFireR'];
            }
        }
        if (!chara.injuryOffsets) {
            let width = chara.width;
            let height = chara.height;
            chara.injuryOffsets = [
                { x: -width * 0.2, y: height * 0.1 },
                { x: 0, y: -height * 0.2 },
                { x: width * 0.2, y: height * 0.1 }
            ];
        }

        // Clean up dead injury animations
        chara.injuryAnimations = chara.injuryAnimations.filter(anime => {
            if (anime.status === 'dead') return false;
            return true;
        });

        // Add animations if needed
        while (chara.injuryAnimations.length < neededCount) {
            let idx = chara.injuryAnimations.length;
            let name = chara.injuryNames[idx];
            let offset = chara.injuryOffsets[idx];
            let animeClass = Animation[name];
            if (animeClass) {
                let px = chara.posX() + offset.x;
                let py = chara.posY() + offset.y;
                let anime = new animeClass({ x: px, y: py });
                chara.injuryAnimations.push(anime);
            }
        }

        // Remove animations if needed (e.g. if building got repaired/healed)
        while (chara.injuryAnimations.length > neededCount) {
            let anime = chara.injuryAnimations.pop();
            if (anime) anime.die();
        }

        // Update positions of active animations to follow the building
        chara.injuryAnimations.forEach((anime, idx) => {
            let offset = chara.injuryOffsets[idx];
            let times = anime.scale ? anime.scale : 1;
            anime.x = (chara.posX() + offset.x - (anime.width || 0) * times / 2) >> 0;
            anime.y = (chara.posY() + offset.y - (anime.height || 0) * times / 2) >> 0;
        });
    });
};

Referee.saveReplaySnapshot = function () {
    if (Game._clock % 30 == 0 && !Game.replayFlag && Game.saveReplay) {
        Game.saveReplay();
    }
};
