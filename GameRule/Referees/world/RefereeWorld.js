Referee.monitorMiniMap = () => {
    if (Game._clock % 10 == 0) {
        GameMap.refreshMiniMap();
    }
};
Referee.coverFog = () => {
    GameMap.drawFog();
};
Referee.alterSelectionMode = function () {
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
        if (chara.cost) curMan += chara.cost.man;
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
