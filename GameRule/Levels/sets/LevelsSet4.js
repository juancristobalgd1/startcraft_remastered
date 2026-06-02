import Levels from '../core/LevelsBase.js';
import _$ from '../../../Utils/gFrame/core.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import GameMap from '../../../Characters/Map.js';
import Referee from '../../../GameRule/Referees/core/RefereeBase.js';
import Resource from '../../../GameRule/Resource.js';
import Cheat from '../../../GameRule/Cheat.js';
import Upgrade from '../../../Characters/Upgrades/core/UpgradeBase.js';
import Button from '../../../Characters/Buttons/core/ButtonBase.js';
import Gobj from '../../../Characters/Gobj.js';
import Unit from '../../../Characters/Units/core/UnitBase.js';
import Building from '../../../Characters/Buildings/core/BuildingBase.js';

// Import races and heroes
import Zerg from '../../../Characters/Zergs/core/ZergBase.js';
import Terran from '../../../Characters/Terrans/core/TerranBase.js';
import Protoss from '../../../Characters/Protosses/core/ProtossBase.js';
import Hero from '../../../Characters/Heroes/core/HeroBase.js';
import Neutral from '../../../Characters/Breeds/Neutral.js';
import Bullets from '../../../Characters/Bullets/core/BulletsBase.js';
import Animation from '../../../Characters/Animations/core/AnimationBase.js';

Levels.push(
    {
        level: 10,
        label: 'HUNTERxHUNTER',
        load: function () {
            var isNightmare = true;
            //Load map
            GameMap.setCurrentMap('Grass');
            var mapSize = GameMap.getCurrentMap();
            GameMap.offsetX = (mapSize.width - Game.HBOUND) / 2 >> 0;
            GameMap.offsetY = (mapSize.height - Game.VBOUND) / 2 >> 0;
            GameMap.fogFlag = false;
            //Apply race style
            Game.race.choose('Zerg');
            //Single player
            if (globalThis.Multiplayer) globalThis.Multiplayer.ON = false;
            //Show me the money
            Game.commandTimeout(function () {
                Resource[0].mine = Resource[0].gas = 9999;
            }, 0);
            //Fulfill nuclear bombs
            if (globalThis.Magic && globalThis.Magic.NuclearStrike) {
                globalThis.Magic.NuclearStrike.enabled = 999;
            }
            //Change kill to EXP:
            globalThis.$('p.kill').html('<b style="color:red">EXP:</b><span></span>');
            //Magic infinite
            Cheat.execute('the gathering');
            //Patch: Overlord speed up
            Game.commandTimeout(function () {
                Upgrade.EvolvePneumatizedCarapace.effect(true);
                Upgrade.IncreaseCarrierCapacity.effect(true);
            }, 0);
            //Override win and lose condition
            Referee.winCondition = function () {
                //Infinite enemies
                if (Unit.allUnits.length < 150) {
                    Game.showWarning('Refreshing...');
                    Levels.enemyWave();
                    Levels.refreshMagic();
                }
                //Upgrade your hunter
                var curLevel = Levels.DevilHunter.kill / 10 >> 0;
                if (curLevel > Levels.DevilHunter.level) {
                    for (var N = 0; N < curLevel - Levels.DevilHunter.level; N++) {
                        //Upgraded
                        if (isNightmare) {
                            Hero.DevilHunter.prototype.HP += 100;
                            Hero.DevilHunter.prototype.SP += 100;
                            Hero.DevilHunter.prototype.MP += 10;
                        }
                        Cheat.execute("something for nothing");
                        Cheat.execute("full recovery");
                        Levels.DevilHunter.level = curLevel;
                        Game.refreshInfo();
                        if (Referee.voice && Referee.voice.upgrade && Referee.voice.upgrade[Game.race.selected]) {
                            Referee.voice.upgrade[Game.race.selected].play();
                        }
                        Game.showMessage('Upgrade complete');
                    }
                }
                return false;
            };
            //Random magics for hunter
            Levels.refreshMagic = function () {
                var magics = ["Parasite", "SpawnBroodlings", "Ensnare", "DarkSwarm", "Plague", "StimPacks", "Lockdown", "NuclearStrike",
                    "Restoration", "OpticalFlare", "DefensiveMatrix", "EMPShockwave", "Irradiate", "Yamato", "ScannerSweep", "PsionicStorm",
                    "Hallucination", "Feedback", "MindControl", "MaelStorm", "Recall", "StasisField", "DisruptionWeb", "RechargeShields"];
                var items = {};
                for (var N = 4; N <= 9; N++) {
                    var index = Math.random() * magics.length >> 0;
                    items[N] = { name: magics[index] };
                    magics.splice(index, 1);
                }
                Hero.DevilHunter.prototype.items = items;
                Button.equipButtonsFor(Levels.DevilHunter);
            };
            Levels.refreshMagic();
            //Add units on map
            Levels.DevilHunter = new Hero.DevilHunter({ x: mapSize.width / 2, y: mapSize.height / 2 });
            Levels.DevilHunter.level = 0;
            Game.commandTimeout(function () {
                Game.changeSelectedTo(Levels.DevilHunter);
            }, 0);
            //Enemy coming
            Levels.enemyWave = function () {
                var pos = { team: 1 };
                _$.traverse([Neutral, Zerg, Terran, Protoss], function (enemyType) {
                    pos.x = (Game.getNextRandom() * mapSize.width) >> 0;
                    pos.y = (Game.getNextRandom() * mapSize.height) >> 0;
                    var enemy = new enemyType(pos);
                    if (enemy.attack) {
                        enemy.attackLimit = null;
                    }
                });
            };
            for (var N = 0; N < 4; N++) {
                Levels.enemyWave();
            }
            //Enemies will becomes stronger and stronger
            Game.commandInterval(function () {
                Game.showWarning('Enemies become stronger!');
                //Upgrade all grades for enemy
                for (var grade in Upgrade) {
                    if (Upgrade[grade] && typeof Upgrade[grade].effect === 'function') {
                        Upgrade[grade].effect(true);
                    }
                }
            }, isNightmare ? 90000 : 60000);
            //Baby hunter will talk every 30s
            var speech = [
                "What the hell is going on? Where am I?",
                "This world is weird! There must be some mistake!",
                "Hey, gloomyson, you sent me to the wrong game!",
                "I'm so scared! I want my mummy!",
                "Let me out! I wanna go home! Plz!",
                "You dare fool me? I'm blind not deaf!",
                "Do you know who I am? My papa is GinBliz!",
                "Let me out of here! Or I'll tell papa to sue you!",
                "At least let me pass hunter exam and get license first!",
                "Nen power, release!",
                "Help me, Killua, Kurapika!",
                "(T_T) cry~~~"
            ];
            for (var N = 0; N < speech.length; N++) {
                (function (n) {
                    Game.commandTimeout(function () {
                        Game.showMessage('HunterBoy: ' + speech[n], 5000);
                    }, n * 30000 + 10000);
                })(N);
            }
        }
    },
    {
        level: 11,
        label: 'TowerDefense',
        load: function () {
            //Load map
            GameMap.setCurrentMap('TowerDefense');
            GameMap.offsetX = 4096 - Game.HBOUND;
            GameMap.offsetY = 3072 - Game.VBOUND;
            GameMap.fogFlag = false;
            //Apply race style
            Game.race.choose('Terran');
            //Single player
            if (globalThis.Multiplayer) globalThis.Multiplayer.ON = false;
            //Patch
            Game.commandTimeout(function () {
                Upgrade.EvolvePneumatizedCarapace.effect(true);
            }, 0);
            Building.prototype.sight = 1000;
            GameMap.drawMud = function () { };
            if (Zerg.Lurker) Zerg.Lurker.prototype.reactionWhenAttackedBy = Unit.prototype.reactionWhenAttackedBy;
            if (Zerg.Larva) {
                Zerg.Larva.prototype.moveTo = Unit.prototype.moveTo;
                Zerg.Larva.prototype.moveToward = Unit.prototype.moveToward;
            }
            //Missile fixed duration, original behavior
            if (globalThis.Bullets && globalThis.Bullets.Spore) {
                globalThis.Bullets.Spore.prototype.duration = 500;
                delete globalThis.Bullets.Spore.prototype.speedVal;
            }
            if (globalThis.Bullets && globalThis.Bullets.SingleMissile) {
                globalThis.Bullets.SingleMissile.prototype.duration = 600;
                delete globalThis.Bullets.SingleMissile.prototype.speedVal;
            }
            if (globalThis.Bullets && globalThis.Bullets.DragoonBall) {
                globalThis.Bullets.DragoonBall.prototype.duration = 800;
                delete globalThis.Bullets.DragoonBall.prototype.speedVal;
            }
            //Upgrade utility
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items = {
                    '1': { name: 'UpgradeSunkenDamage' },
                    '2': { name: 'EnlargeSunkenArea' },
                    '3': { name: 'UpgradeSporeDamage' },
                    '4': { name: 'EnlargeSporeChain' },
                    '5': { name: 'UpgradeMissileDamage' },
                    '6': { name: 'IncreaseMissileCount' },
                    '7': { name: 'UpgradePhotonCannonDamage' },
                    '8': { name: 'IncreasePhotonCannonCount' },
                    '9': { name: 'CleanScreen' }
                };
            }
            //#######Transform defensing tower#######
            //Circle attack: 1 VS N
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SunkenColony) {
                globalThis.Building.ZergBuilding.SunkenColony.prototype.AOE = {
                    type: "CIRCLE",
                    hasEffect: true,
                    radius: 50
                };
                globalThis.Building.ZergBuilding.SunkenColony.prototype.upgrade = ['UpgradeSunkenDamage', 'EnlargeSunkenArea'];
            }
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SporeColony) {
                globalThis.Building.ZergBuilding.SporeColony.prototype.upgrade = ['UpgradeSporeDamage', 'EnlargeSporeChain'];
            }
            if (globalThis.Building && globalThis.Building.TerranBuilding && globalThis.Building.TerranBuilding.MissileTurret) {
                globalThis.Building.TerranBuilding.MissileTurret.prototype.upgrade = ['UpgradeMissileDamage', 'IncreaseMissileCount'];
            }
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.PhotonCannon) {
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.upgrade = ['UpgradePhotonCannonDamage', 'IncreasePhotonCannonCount'];
            }
            //Chain attack: 1 VS 1+1+1
            if (globalThis.Bullets && globalThis.Bullets.Spore) {
                globalThis.Bullets.Spore.prototype.fire = function () {
                    this.life = this.traceTimes;
                    globalThis.Bullets.prototype.fire.apply(this, arguments);
                };
                if (globalThis.Bullets.Darts) {
                    globalThis.Bullets.Spore.prototype.die = globalThis.Bullets.Darts.prototype.die;
                }
                globalThis.Bullets.Spore.prototype.traceTimes = 1;
                globalThis.Bullets.Spore.prototype.traceRadius = 100;
                globalThis.Bullets.Spore.prototype.noDamage = true;
            }
            //Multiple bullets attack: N VS N
            if (globalThis.Building && globalThis.Building.TerranBuilding && globalThis.Building.TerranBuilding.MissileTurret) {
                globalThis.Building.TerranBuilding.MissileTurret.prototype.AOE = {
                    type: "MULTIPLE",
                    hasEffect: false,
                    radius: 150,
                    count: 1
                };
            }
            //Multiple times attack: N VS 1
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.PhotonCannon) {
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.continuousAttack = {
                    count: 1,
                    layout: function (bullet, num) {
                        //Reassign location
                        if (Math.abs(bullet.speed.x) > Math.abs(bullet.speed.y)) {
                            if (bullet.speed.x > 0) {
                                bullet.x += (20 * num);
                                bullet.y += (20 * num * bullet.speed.y / bullet.speed.x) >> 0;
                            }
                            else {
                                bullet.x -= (20 * num);
                                bullet.y -= (20 * num * bullet.speed.y / bullet.speed.x) >> 0;
                            }
                        }
                        else {
                            if (bullet.speed.y > 0) {
                                bullet.y += (20 * num);
                                bullet.x += (20 * num * bullet.speed.x / bullet.speed.y) >> 0;
                            }
                            else {
                                bullet.y -= (20 * num);
                                bullet.x -= (20 * num * bullet.speed.x / bullet.speed.y) >> 0;
                            }
                        }
                    }
                };
            }
            //Add our buildings
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SunkenColony) {
                globalThis.Building.ZergBuilding.SunkenColony.prototype.attackLimit = null;
                globalThis.Building.ZergBuilding.SunkenColony.prototype.attackRange = 700;
                globalThis.Building.ZergBuilding.SunkenColony.prototype.HP = 9999;
                new globalThis.Building.ZergBuilding.SunkenColony({ x: 2524, y: 452 });
                new globalThis.Building.ZergBuilding.SunkenColony({ x: 60, y: 1500 });
                new globalThis.Building.ZergBuilding.SunkenColony({ x: 2438, y: 2320 });
            }
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SporeColony) {
                globalThis.Building.ZergBuilding.SporeColony.prototype.attackLimit = null;
                globalThis.Building.ZergBuilding.SporeColony.prototype.attackRange = 700;
                globalThis.Building.ZergBuilding.SporeColony.prototype.HP = 9999;
                new globalThis.Building.ZergBuilding.SporeColony({ x: 3980, y: 1500 });
                new globalThis.Building.ZergBuilding.SporeColony({ x: 1476, y: 452 });
                new globalThis.Building.ZergBuilding.SporeColony({ x: 1240, y: 2956 });
            }
            if (globalThis.Building && globalThis.Building.TerranBuilding && globalThis.Building.TerranBuilding.MissileTurret) {
                globalThis.Building.TerranBuilding.MissileTurret.prototype.attackLimit = null;
                globalThis.Building.TerranBuilding.MissileTurret.prototype.attackRange = 700;
                globalThis.Building.TerranBuilding.MissileTurret.prototype.HP = 9999;
                new globalThis.Building.TerranBuilding.MissileTurret({ x: 3228, y: 2632 });
                new globalThis.Building.TerranBuilding.MissileTurret({ x: 2000, y: 80 });
                new globalThis.Building.TerranBuilding.MissileTurret({ x: 784, y: 2320 });
            }
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.PhotonCannon) {
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.attackLimit = null;
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.attackRange = 700;
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.SP = 9999;
                new globalThis.Building.ProtossBuilding.PhotonCannon({ x: 3228, y: 1054 });
                new globalThis.Building.ProtossBuilding.PhotonCannon({ x: 784, y: 1054 });
                new globalThis.Building.ProtossBuilding.PhotonCannon({ x: 1684, y: 2320 });
            }
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                globalThis.Building.ProtossBuilding.TeleportPoint.prototype.SP = 9999;
                new globalThis.Building.ProtossBuilding.TeleportPoint({ x: 2060, y: 1586 });
            }
            //Add our unit
            if (Hero && Hero.Tassadar) {
                new Hero.Tassadar({ x: 3200, y: 3072 - Game.VBOUND / 2 }).magic = 999;
            }
            //Override win and lose condition
            var killCount = 0;//Closure
            Referee.winCondition = function () {
                var kills = 0;
                globalThis.Building.ourBuildings.forEach(function (build) {
                    if (build.kill) kills += build.kill;
                });
                if (kills > killCount) {
                    Resource[0].mine += (kills - killCount);
                    killCount = kills;
                }
                return (wave > num && Unit.allEnemyUnits().length == 0);
            };
            var LIFE = 20;
            Referee.loseCondition = function () {
                Unit.allEnemyUnits().forEach(function (chara) {
                    if (chara.inside({ centerX: 2048, centerY: 1536, radius: 200 })) {
                        LIFE--;
                        Game.showMessage('Remaining life: ' + LIFE);
                        chara.die();
                    }
                });
                return (LIFE <= 0);
            };
            //Enemy coming
            var num = 0, wave = 1;
            var interval = 30000;//30 seconds per wave
            _$.traverse([Neutral, Zerg, Terran, Protoss], function (enemyType) {
                Game.commandTimeout(function () {
                    for (var N = 0; N < 15; N++) {
                        (function (n) {
                            Game.commandTimeout(function () {
                                var enemy = new enemyType({ x: 3622, y: 2916, team: 1 });
                                if (enemy.attack) enemy.attack = function () {
                                    this.targetLock = true;
                                };
                                Game.commandTimeout(function () {
                                    enemy.targetLock = true;
                                    enemy.destination = { x: 3622, y: 280 };
                                    enemy.destination.next = { x: 422, y: 280 };
                                    enemy.destination.next.next = { x: 422, y: 2800 };
                                    enemy.destination.next.next.next = { x: 2100, y: 2800 };
                                    enemy.destination.next.next.next.next = { x: 2100, y: 1500 };
                                }, 0);
                            }, n * 1000);
                        })(N);
                    }
                    Game.showWarning('Wave ' + wave++ + ': ' + enemyType.prototype.name);
                }, interval * num++);
            });
            //Game win when time reach
            Game.commandTimeout(function () {
                Game.win();
            }, interval * num + 60000);
        }
    },
    {
        level: 12,
        label: 'Replay',
        load: function () {
            //Load replay
            var lastReplay = localStorage.getItem('lastReplay');
            if (lastReplay != null) {
                Game.replayFlag = true;
                Button.equipButtonsFor = function () { };
                //Equip with replay buttons
                Button.equipButtonsForReplay();
                //Parse last replay data
                lastReplay = JSON.parse(lastReplay);
                if (lastReplay.hasOwnProperty('team')) Game.team = lastReplay.team;
                Levels[lastReplay.level - 1].load();
                Game.replayLevel = lastReplay.level;
                //Parse user moves
                var recordCmds = lastReplay.cmds;
                for (var tick in recordCmds) {
                    if (globalThis.Multiplayer) {
                        globalThis.Multiplayer.parseTickCmd({ tick: parseInt(tick), cmds: recordCmds[tick] });
                    }
                }
                //Replay ends
                Game.endTick = lastReplay.end;
                Game.commandTimeout(function () {
                    Game.stopAnimation();
                    globalThis.$('div.panel_Control button').attr('disabled', true);
                    Game.showMessage('Replay ended...', 10000);
                }, 100 * Game.endTick);
            }
            else {
                alert('Cannot find any replay!');
                delete Game.level;
                return true;
            }
        }
    }
);
