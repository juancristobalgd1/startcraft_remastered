import Magic from '../core/MagicBase.js';
import _$ from '../../../Utils/gFrame/core.js';
import Building from '../../Buildings/core/BuildingBase.js';
import Unit from '../../Units/core/UnitBase.js';
import { InfestedBase } from '../../Buildings/zerg/ZergCore2.js';
import Button from '../../Buttons/core/ButtonBase.js';
import Bullets from '../../Bullets/core/BulletsBase.js';
import { Parasite } from '../../Bullets/zerg/ZergBullets.js';
import Resource from '../../../GameRule/Resource.js';
//import Zerg from '../../Zergs/core/ZergBase.js';
import { Broodling } from '../../Zergs/ground/ZergGround.js';
import Gobj from '../../Gobj.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import '../../../Utils/jquery.min.js';

const $ = globalThis.$;

Magic.Burrow = {
    name: "Burrow",
    enabled: false,
    spell: function () {
        this.dock();
        if (this.stopAttack) this.stopAttack();
        this.status = "burrow";
        this.action = 2;
        //Effect:Freeze target
        const bufferObj = {
            moveTo: function () { },
            moveToward: function () { },
            dock: function () { }
        };
        if (this.attack) bufferObj.attack = function () { };
        //Lurker has same behavior as attackable building
        if (this.name == "Lurker") {
            const mixin = $.extend({}, Building.Attackable.prototypePlus);
            delete mixin.name;
            delete mixin.die;
            $.extend(bufferObj, mixin);
        }
        //Freeze immediately
        this.addBuffer(bufferObj, (this.name == "Lurker"));//onAll for Lurker
        this.burrowBuffer = [bufferObj];
        //Sound effect
        if (this.insideScreen()) this.sound.burrow.play();
        //Forbid actions
        const itemsBackup = this.items;
        this.items = {
            '1': undefined, '2': undefined, '3': undefined, '4': undefined, '5': undefined,
            '6': undefined, '7': undefined, '8': undefined, '9': undefined
        };
        Button.reset();
        //Finish burrow
        Game.commandTimeout(() => {
            //Invisible when finish burrow
            const bufferObjII = { isInvisible: true };
            this.addBuffer(bufferObjII);
            this.burrowBuffer.push(bufferObjII);
            this.buffer.Burrow = true;
            //Change icon when finish burrow
            const items = _$.clone(itemsBackup);
            for (const N in items) {
                if (items[N] && items[N].name == "Burrow") items[N].name = "Unburrow";
            }
            this.items = items;
            //Apply callback
            Button.reset();
        }, this.imgPos.burrow.left[0].length * 100 - 200);
    }
};
Magic.Unburrow = {
    name: "Unburrow",
    enabled: false,
    spell: function () {
        this.status = "unburrow";
        this.action = 0;
        //Show unit immediately
        this.removeBuffer(this.burrowBuffer.pop());
        //Sound effect
        if (this.insideScreen()) this.sound.unburrow.play();
        //Forbid actions
        this.items = {
            '1': undefined, '2': undefined, '3': undefined, '4': undefined, '5': undefined,
            '6': undefined, '7': undefined, '8': undefined, '9': undefined
        };
        Button.reset();
        //Finish unburrow
        delete this.buffer.Burrow;
        Game.commandTimeout(() => {
            if (this.burrowBuffer) {
                //Release freeze
                if (this.removeBuffer(this.burrowBuffer.pop())) {
                    delete this.burrowBuffer;
                }
            }
            //Recover icons and apply callbacks
            delete this.items;
            Button.reset();
            this.dock();
            this.direction = (this.name == "Hydralisk" || this.name == "Lurker") ? 2 : 3;
        }, this.frame.unburrow * 100 - 200);//margin
    }
};
// Magic.Load and Magic.UnloadAll are now implemented in MagicBase.js for all races.


Magic.Lurker = {
    name: "Lurker",
    enabled: false
};
Magic.InfestTerranCommandCenter = {
    name: "InfestTerranCommandCenter",
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Target enemy building: Injured Command Center
            const target = Game.getSelectedOne(location.x, location.y, true, false, null, (chara) => {
                return chara.name === 'CommandCenter' && chara.life / chara.get('HP') < 0.5;
            });
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to infest command center
                this.moveToward(target, Unit.meleeRange, () => {
                    if (target.status !== 'dead' && target.life / target.get('HP') < 0.5) {
                        //Change side
                        target.isEnemy = this.isEnemy;
                        //Order ours not to attack it anymore
                        Unit.allOurUnits().concat(Building.ourBuildings).forEach((chara) => {
                            if (chara.target === target) chara.stopAttack();
                        });
                        target.evolveTo(InfestedBase);
                    }
                });
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Parasite = {
    name: "Parasite",
    cost: { magic: 75 },
    credit: true,
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Target enemy unit
            const target = Game.getSelectedOne(location.x, location.y, true, true);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to fire parasite
                this.moveToward(target, this.get('sight'), () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Fire parasite
                        const bullet = new Parasite({
                            from: this,
                            to: target,
                            damage: 0
                        });
                        this.bullet = bullet;
                        bullet.fire(() => {
                            //Effect:should steal target sight
                            target.buffer.Parasite = true;
                        });
                    }
                });
            }
            else delete this.creditBill;
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.SpawnBroodlings = {
    name: "SpawnBroodlings",
    cost: { magic: 150 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Kill enemy unit ground
            const target = Game.getSelectedOne(location.x, location.y, true, true, false);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to fire SpawnBroodlings
                this.moveToward(target, this.get('sight'), () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Fire SpawnBroodlings to kill that enemy immediately
                        const bullet = new Parasite({
                            from: this,
                            to: target,
                            damage: 99999
                        });
                        this.bullet = bullet;
                        //Effect
                        bullet.fire(() => {
                            for (let n = 0; n < 2; n++) {
                                new Broodling({ x: target.posX(), y: target.posY(), isEnemy: this.isEnemy });
                            }
                        });
                    }
                });
            }
            //Empty object {}, cannot spell
            else delete this.creditBill;
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Ensnare = {
    name: "Ensnare",
    cost: { magic: 75 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Move toward target to fire Ensnare
            this.targetLock = true;
            this.moveTo(location.x, location.y, this.get('sight'), () => {
                if (Resource.payCreditBill.call(this)) {
                    //Fire Ensnare
                    const bullet = new Bullets.Parasite({
                        from: this,
                        to: { x: location.x, y: location.y }
                    });
                    this.bullet = bullet;
                    //Fire Ensnare bullet with callback
                    bullet.fire(() => {
                        //Ensnare animation and sound
                        const anime = new Animation.Ensnare({ x: location.x, y: location.y });
                        if (anime.insideScreen()) new Audio('bgm/Magic.Ensnare.wav').play();
                        //Get in range enemy units
                        const targets = Game.getInRangeOnes(location.x, location.y, [76 * 1.2 >> 0, 62 * 1.2 >> 0], true, true);
                        //Slow moving speed
                        const bufferObj = {
                            speed: Unit.getSpeedMatrixBy(2)
                        };
                        targets.forEach((chara) => {
                            if (chara.buffer.Ensnare) return;
                            chara.buffer.Ensnare = true;
                            chara.addBuffer(bufferObj);
                            new Animation.GreenEffect({
                                target: chara, callback: () => {
                                    if (chara.status != 'dead' && chara.buffer.Ensnare) {
                                        if (chara.removeBuffer(bufferObj)) delete chara.buffer.Ensnare;
                                    }
                                }
                            });
                        });
                    });
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Consume = {
    name: "Consume",
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Kill our unit ground
            const target = Game.getSelectedOne(location.x, location.y, false, true, false);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to consume
                this.moveToward(target, 70, () => {
                    //Effect
                    const anime = new Animation.Consume({
                        target: target, callback: () => {
                            //Consume sound
                            if (anime.insideScreen()) new Audio('bgm/Magic.Consume.wav').play();
                            //Consume animation missing
                            target.die();
                            this.magic += 50;
                            if (this.magic > this.get('MP')) this.magic = this.get('MP');
                        }
                    });
                });
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.DarkSwarm = {
    name: "DarkSwarm",
    cost: { magic: 100 },
    credit: true,
    _timer: 0,
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Move toward target to fire DarkSwarm
            this.targetLock = true;
            this.moveTo(location.x, location.y, this.get('sight'), () => {
                if (Resource.payCreditBill.call(this)) {
                    //DarkSwarm animation, play hidden frames at first
                    new Animation.DarkSwarm({ x: location.x, y: location.y }).action = 6;
                    //Dynamic update targets every 1 second
                    let targets = [];
                    //Full guard from distance
                    const bufferObj = {
                        //Full guard from distance
                        calculateDamageBy: function (enemyObj, percent) {
                            //Range attack will lose efficacy
                            if (enemyObj.attackRange > 100) return 0;
                            else return percent;
                        }
                    };
                    //Dark swarm wave
                    const swarmWave = () => {
                        //Recover old targets
                        targets.forEach((chara) => {
                            if (chara.status != 'dead') {
                                if (chara.removeBuffer(bufferObj)) delete chara.buffer.DarkSwarm;
                            }
                        });
                        targets = [];
                        //Check if any dark swarm exist
                        const darkSwarms = Burst.allEffects.filter((effect) => effect instanceof Animation.DarkSwarm);
                        if (darkSwarms.length) {
                            //Get targets inside all of swarms
                            darkSwarms.forEach((swarm) => {
                                //Update buffer on ground units inside swarm (both ours and enemy)
                                targets = targets.concat(Game.getInRangeOnes(swarm.posX(), swarm.posY(), [94 * 1.2 >> 0, 76 * 1.2 >> 0], false, true, false));
                                targets = targets.concat(Game.getInRangeOnes(swarm.posX(), swarm.posY(), [94 * 1.2 >> 0, 76 * 1.2 >> 0], true, true, false));
                            });
                            targets = [...new Set(targets)];
                            //Effect
                            targets.forEach((chara) => {
                                if (chara.buffer.DarkSwarm) return;
                                chara.buffer.DarkSwarm = true;
                                chara.addBuffer(bufferObj);
                            });
                            Game.commandTimeout(swarmWave, 1000);
                            Magic.DarkSwarm._timer = 1;
                        }
                        else Magic.DarkSwarm._timer = 0;
                    };
                    //If not calculating, execute
                    if (!Magic.DarkSwarm._timer) swarmWave();
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Plague = {
    name: "Plague",
    cost: { magic: 150 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Move toward target to fire Plague
            this.targetLock = true;
            this.moveTo(location.x, location.y, this.get('sight'), () => {
                if (Resource.payCreditBill.call(this)) {
                    //Plague animation and sound
                    const anime = new Animation.Plague({ x: location.x, y: location.y });
                    if (anime.insideScreen()) new Audio('bgm/Magic.Ensnare.wav').play();
                    //Get in range enemy units
                    const targets = Game.getInRangeOnes(location.x, location.y, [64 * 1.2 >> 0, 64 * 1.2 >> 0], true, true);
                    //Effect:HP losing every seconds
                    const bufferObj = {
                        recover: function () {
                            if (this.life > 0) this.life -= 25;//Refresh every 1 seconds
                            if (this.life <= 0) this.life = 1;
                        }
                    };
                    targets.forEach((chara) => {
                        //Buffer flag
                        if (chara.buffer.Plague) return;//Not again
                        chara.buffer.Plague = true;
                        //HP losing every seconds
                        chara.addBuffer(bufferObj);
                        //Green effect
                        new Animation.RedEffect({
                            target: chara, callback: () => {
                                if (chara.status != 'dead' && chara.buffer.Plague) {
                                    //Restore
                                    if (chara.removeBuffer(bufferObj)) delete chara.buffer.Plague;
                                }
                            }
                        });
                    });
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
