Game.addIntoAllSelected = function (chara, override) {
    if (chara instanceof Gobj) {
        if (Game.allSelected.indexOf(chara) == -1) {
            if (override) Game.allSelected = [chara];
            else if (Game.allSelected.length < Game.selectionCap) Game.allSelected.push(chara);
            chara.selected = true;
        }
    }
    if (chara instanceof Array) {
        if (override) Game.allSelected = chara.slice(0, Game.selectionCap);
        else chara.forEach(function (char) {
            if (Game.allSelected.length >= Game.selectionCap) return;
            if (Game.allSelected.indexOf(char) == -1) Game.allSelected.push(char);
        });
        Game.allSelected.forEach((char) => {
            char.selected = true;
        });
    }
    Game.allSelected.sort((chara1, chara2) => {
        const name1 = (chara1 instanceof Building) ? (chara1.inherited.name + '.' + chara1.name) : chara1.name;
        const name2 = (chara2 instanceof Building) ? (chara2.inherited.name + '.' + chara2.name) : chara2.name;
        return ([name1, name2].sort()[0] != name1) ? 1 : -1;
    });
    Referee.alterSelectionMode();
};
Game.addSelectedIntoTeam = function (teamNum, append) {
    if (!append || !(Game.teams[teamNum] instanceof Array)) {
        Game.teams[teamNum] = _$.mixin([], Game.allSelected);
        return;
    }
    var combined = _$.mixin([], Game.teams[teamNum]).concat(Game.allSelected);
    var team = [];
    combined.forEach(function (chara) {
        if (!chara || chara.status == 'dead') return;
        if (team.indexOf(chara) === -1) team.push(chara);
    });
    Game.teams[teamNum] = team;
};
Game.callTeam = function (teamNum, centerOnGroup) {
    var team = _$.mixin([], Game.teams[teamNum]);
    if (team instanceof Array) {
        Game.unselectAll();
        $.extend([], team).forEach(function (chara) {
            if (chara.status == 'dead') team.splice(team.indexOf(chara), 1);
        });
        Game.addIntoAllSelected(team, true);
        if (team[0] instanceof Gobj) {
            Game.changeSelectedTo(team[0]);
            team[0].sound.selected.play();
            if (centerOnGroup) {
                GameMap.relocateAt(team[0].posX(), team[0].posY());
            }
        }
    }
};
Game.unselectAll = function () {
    var units = Unit.allUnits.concat(Building.allBuildings);
    units.forEach((chara) => { chara.selected = false });
    Game.addIntoAllSelected([], true);
};
Game.multiSelectInRect = function () {
    Game.unselectAll();
    var startPoint = {
        x: GameMap.offsetX + Math.min(mouseController.startPoint.x, mouseController.endPoint.x),
        y: GameMap.offsetY + Math.min(mouseController.startPoint.y, mouseController.endPoint.y)
    };
    var endPoint = {
        x: GameMap.offsetX + Math.max(mouseController.startPoint.x, mouseController.endPoint.x),
        y: GameMap.offsetY + Math.max(mouseController.startPoint.y, mouseController.endPoint.y)
    };
    var inRectUnits = Unit.allOurUnits().filter((chara) => {
        return chara.insideRect({ start: (startPoint), end: (endPoint) });
    });
    var inRectBuildings = Building.ourBuildings.filter((chara) => {
        return chara.status != 'dead' && chara.insideRect({ start: (startPoint), end: (endPoint) });
    });
    var inRectAll = inRectUnits.concat(inRectBuildings);
    if (inRectUnits.length > 0) Game.changeSelectedTo(inRectUnits[0]);
    else if (inRectBuildings.length > 0) Game.changeSelectedTo(inRectBuildings[0]);
    else Game.changeSelectedTo({});
    Game.addIntoAllSelected(inRectAll, true);
};
Game.getSelectedOne = function (clickX, clickY, isEnemyFilter, unitBuildingFilter, isFlyingFilter, customFilter) {
    const distance = (chara) => {
        return (clickX - chara.posX()) * (clickX - chara.posX()) + (clickY - chara.posY()) * (clickY - chara.posY());
    };
    var selectedOne = {}, charas = [];
    if (isEnemyFilter == null) {
        if (unitBuildingFilter == null) charas = Unit.allUnits.concat(Building.allBuildings);
        else if (unitBuildingFilter) charas = Unit.allUnits;
        else charas = Building.allBuildings;
    }
    else if (isEnemyFilter) {
        if (unitBuildingFilter == null) charas = Unit.allEnemyUnits().concat(Building.enemyBuildings);
        else if (unitBuildingFilter) charas = Unit.allEnemyUnits();
        else charas = Building.enemyBuildings;
    }
    else {
        if (unitBuildingFilter == null) charas = Unit.allOurUnits().concat(Building.ourBuildings);
        else if (unitBuildingFilter) charas = Unit.allOurUnits();
        else charas = Building.ourBuildings;
    }
    if (isFlyingFilter != null) {
        charas = charas.filter((chara) => {
            return chara.isFlying == isFlyingFilter;
        });
    }
    if (customFilter != null) {
        charas = charas.filter(customFilter);
    }
    selectedOne = charas.filter((chara) => {
        return chara.status != 'dead' && chara.includePoint(clickX, clickY);
    }).sort((chara1, chara2) => {
        return distance(chara1) - distance(chara2);
    })[0];
    if (!selectedOne) selectedOne = {};
    return selectedOne;
};
Game.getInRangeOnes = function (clickX, clickY, range, isEnemyFilter, unitBuildingFilter, isFlyingFilter, customFilter) {
    var selectedOnes = [], charas = [];
    if (isEnemyFilter == null) {
        if (unitBuildingFilter == null) charas = Unit.allUnits.concat(Building.allBuildings);
        else if (unitBuildingFilter) charas = Unit.allUnits;
        else charas = Building.allBuildings;
    }
    else if (isEnemyFilter) {
        if (unitBuildingFilter == null) charas = Unit.allEnemyUnits().concat(Building.enemyBuildings);
        else if (unitBuildingFilter) charas = Unit.allEnemyUnits();
        else charas = Building.enemyBuildings;
    }
    else {
        if (unitBuildingFilter == null) charas = Unit.allOurUnits().concat(Building.ourBuildings);
        else if (unitBuildingFilter) charas = Unit.allOurUnits();
        else charas = Building.ourBuildings;
    }
    if (isFlyingFilter != null) {
        charas = charas.filter((chara) => {
            return chara.isFlying == isFlyingFilter;
        });
    }
    if (customFilter != null) {
        charas = charas.filter(customFilter);
    }
    selectedOnes = charas.filter((chara) => {
        return chara.status != 'dead' && chara.insideSquare({ centerX: clickX, centerY: clickY, radius: range });
    });
    return selectedOnes;
};
Game.getSelected = function () {
    return Unit.allUnits.concat(Building.allBuildings).filter((chara) => {
        return chara.selected;
    });
};
Game.getNearbyOnes = function (clickX, clickY, isEnemyFilter) {
    var units = [];
    if (isEnemyFilter == undefined) units = Unit.allUnits.concat(Building.allBuildings);
    else {
        if (isEnemyFilter) units = Unit.allEnemyUnits().concat(Building.enemyBuildings);
        else units = Unit.allOurUnits().concat(Building.ourBuildings);
    }
    units.sort((unit1, unit2) => {
        return (unit1.posX() - clickX) * (unit1.posX() - clickX) + (unit1.posY() - clickY) * (unit1.posY() - clickY)
            - (unit2.posX() - clickX) * (unit2.posX() - clickX) - (unit2.posY() - clickY) * (unit2.posY() - clickY);
    });
    return units;
};
Game.getNearestOne = function (clickX, clickY, isEnemyFilter) {
    return Game.getNearbyOnes(clickX, clickY, isEnemyFilter)[0];
};
