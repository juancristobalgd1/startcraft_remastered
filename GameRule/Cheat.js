import '../Utils/jquery.min.js';
import Game from './Games/core/GameBase.js';
import Resource from './Resource.js';
import GameMap from '../Characters/Map.js';
import Upgrade from '../Characters/Upgrades/core/UpgradeBase.js';
import Unit from '../Characters/Units/core/UnitBase.js';
import Building from '../Characters/Buildings/core/BuildingBase.js';
import Referee from './Referees/core/RefereeBase.js';
import Hero from '../Characters/Heroes/core/HeroBase.js';
import '../Characters/Heroes/units/HeroUnits.js'; // Load hero units
import keyController from '../Controller/keyController.js';

const $ = globalThis.$;

const Cheat = {
    isShown: false,
    cwal: false,
    warpten: false,
    gathering: false,

    handler: function () {
        if (Cheat.isShown) {
            const cheatCode = $('input#cheatInput').val().toLowerCase();
            let cheatFlag = false;
            // Forbid cheating during replay or active multiplayer
            const isMultiplayer = globalThis.Multiplayer && globalThis.Multiplayer.ON;
            if (!Game.replayFlag && !isMultiplayer) {
                cheatFlag = Cheat.execute(cheatCode);
            }
            $('#cheat_Box').hide();
            $('input#cheatInput').val('');
            if (cheatFlag) {
                // Refresh control panel
                if (Game.changeSelectedTo) Game.changeSelectedTo(Game.selectedUnit);
                if (Game.showMessage) Game.showMessage('Cheat enabled');
            }
            Cheat.isShown = false;
            if (keyController) keyController.disable = false;
        } else {
            $('#cheat_Box').show();
            $('input#cheatInput').focus();
            Cheat.isShown = true;
            if (keyController) keyController.disable = true;
        }
    },

    execute: function (cheatCode) {
        let cheatFlag = true;
        const team = Game.team;
        switch (cheatCode) {
            case "show me the money":
                if (Resource[team]) {
                    Resource[team].mine += 10000;
                    Resource[team].gas += 10000;
                }
                break;
            case "warpten":
                Cheat.warpten = !Cheat.warpten;
                break;
            case "breathe deep":
                if (Resource[team]) Resource[team].gas += 10000;
                break;
            case "medieval man":
                // Enable all upgrade research for free
                break;
            case "black sheep wall":
                // Switch between show fog or not show
                GameMap.fogFlag = !GameMap.fogFlag;
                break;
            case "something for nothing":
                // Upgrade all grades
                for (const grade in Upgrade) {
                    if (Upgrade[grade] && typeof Upgrade[grade].effect === 'function') {
                        Upgrade[grade].effect(team);
                    }
                }
                break;
            case "full recovery":
                Unit.allOurUnits().concat(Building.ourBuildings).forEach(function (chara) {
                    chara.life = chara.get('HP');
                    if (chara.SP) chara.shield = chara.get('SP');
                    if (chara.MP) chara.magic = chara.get('MP');
                });
                break;
            case "staying alive":
                Referee.winCondition = Referee.loseCondition = function () {
                    return false;
                };
                break;
            case "operation cwal":
                Cheat.cwal = !Cheat.cwal;
                break;
            case "the gathering":
                Cheat.gathering = !Cheat.gathering;
                break;
            case "power overwhelming":
                if (Cheat.oldCalculateDamageBy) {
                    const tempCalculateDamageBy = $.extend([], Cheat.oldCalculateDamageBy);
                    Cheat.oldCalculateDamageBy = [Unit.prototype.calculateDamageBy, Building.prototype.calculateDamageBy];
                    Unit.prototype.calculateDamageBy = tempCalculateDamageBy[0];
                    Building.prototype.calculateDamageBy = tempCalculateDamageBy[1];
                } else {
                    Cheat.oldCalculateDamageBy = [Unit.prototype.calculateDamageBy, Building.prototype.calculateDamageBy];
                    Unit.prototype.calculateDamageBy = function (enemyObj) {
                        if (enemyObj.isEnemy) return 0;
                        else return Cheat.oldCalculateDamageBy[0].call(this, enemyObj);
                    };
                    Building.prototype.calculateDamageBy = function (enemyObj) {
                        if (enemyObj.isEnemy) return 0;
                        else return Cheat.oldCalculateDamageBy[1].call(this, enemyObj);
                    };
                }
                break;
            case "big daddy":
                if (Hero.HeroCruiser) {
                    const daddy = new Hero.HeroCruiser({ x: GameMap.offsetX + Game.HBOUND / 2, y: GameMap.offsetY + Game.VBOUND / 2 });
                    Game.changeSelectedTo(daddy);
                }
                break;
            case "big mommy":
                if (Hero.Sarah) {
                    const mommy = new Hero.Sarah({ x: GameMap.offsetX + Game.HBOUND / 2, y: GameMap.offsetY + Game.VBOUND / 2 });
                    Game.changeSelectedTo(mommy);
                }
                break;
            case "game over man":
            case "gg":
                Game.lose();
                break;
            case "there is no cow level":
            case "your gg":
                Game.win();
                break;
            case "fuck your mother":
                Unit.allEnemyUnits().concat(Building.enemyBuildings).forEach(function (chara) {
                    chara.die();
                });
                break;
            case "fuck my asshole":
                Unit.allOurUnits().concat(Building.ourBuildings).forEach(function (chara) {
                    chara.die();
                });
                break;
            case "liuda is god":
                Cheat.execute('black sheep wall');
                Referee.winCondition = Referee.loseCondition = function () {
                    return false;
                };
                Unit.allUnits.concat(Building.allBuildings).forEach(function (chara) {
                    chara.die();
                });
                break;
            default:
                cheatFlag = false;
                break;
        }
        return cheatFlag;
    }
};

if (typeof window !== 'undefined') {
    window.Cheat = Cheat;
}

export default Cheat;
