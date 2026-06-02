import Magic from '../core/MagicBase.js';
import _$ from '../../../Utils/gFrame/core.js';
import Unit from '../../Units/core/UnitBase.js';
import Cheat from '../../../GameRule/Cheat.js';
import Button from '../../Buttons/core/ButtonBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import Gobj from '../../Gobj.js';
import Bullets from '../../Bullets/core/BulletsBase.js';
import Animation from '../../Animations/core/AnimationBase.js';

Magic.StimPacks = {
    name: "StimPacks",
    enabled: false,
    spell: function () {
        //Rage flag for units to decide stim or not
        if (!this.buffer.Stim) {
            //Cause damage
            this.life -= 10;
            if (this.life < 1) this.life = 1;
            //Stim sound
            if (this.insideScreen()) new Audio('bgm/Magic.StimPacks.wav').play();
            //Effect
            const bufferObj = {
                attackInterval: 800,
                speed: Unit.getSpeedMatrixBy(14)
            };
            this.addBuffer(bufferObj);
            this.buffer.Stim = true;
            //Will only be stim for 15sec
            Game.commandTimeout(() => {
                if (this.status != 'dead' && this.buffer.Stim) {
                    //Special effect is over
                    if (this.removeBuffer(bufferObj)) delete this.buffer.Stim;
                }
            }, 15000);
        }
    }
};
Magic.PersonalCloak = {
    name: "PersonalCloak",
    cost: { magic: 25 },
    enabled: false,
    spell: function () {
        //Will only be invisible when having magic
        if (!this.cloakBuffer) {
            const bufferObj = {
                isInvisible: true,
                //Magic losing every seconds
                recover: function () {
                    if (this.magic > 0 && !Cheat.gathering) this.magic--;
                    if (this.magic <= 0) {
                        //Might be negative float
                        this.magic = 0;
                        //Special effect is over
                        if (this.removeBuffer(bufferObj)) {
                            delete this.buffer.Cloak;
                            delete this.cloakBuffer;
                            //Recover icons and apply callbacks
                            delete this.items;
                            Button.reset();
                        }
                    }
                }
            };
            //Effect
            this.buffer.Cloak = true;
            this.addBuffer(bufferObj);
            this.cloakBuffer = bufferObj;
        }
        //Change icon
        const items = _$.clone(this.items);
        for (const N in items) {
            if (items[N].name == "Cloak") items[N].name = "Decloak";
        }
        this.items = items;
        //Apply callback
        Button.reset();
    }
};
Magic.Decloak = {
    name: "Decloak",
    enabled: true,
    spell: function () {
        if (this.cloakBuffer) {
            //Special effect is over
            if (this.removeBuffer(this.cloakBuffer)) {
                delete this.buffer.Cloak;
                delete this.cloakBuffer;
            }
        }
        //Recover icons and apply callbacks
        delete this.items;
        Button.reset();
    }
};
Magic.Lockdown = {
    name: "Lockdown",
    cost: { magic: 100 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Target enemy unit, machine unit
            const target = Game.getSelectedOne(location.x, location.y, true, true, null, (chara) => {
                return chara.isMachine() && !chara.buffer.Lockdown;
            });
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to fire lockdown
                this.moveToward(target, 300, () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Fire lockdown missile
                        const bullet = new Bullets.SingleMissile({
                            from: this,
                            to: target,
                            damage: 0
                        });
                        this.bullet = bullet;
                        bullet.fire(() => {
                            //Lockdown effect
                            if (target.status != 'dead') {
                                //Stop target
                                target.dock();
                                const bufferObj = {
                                    moveTo: function () { },
                                    moveToward: function () { },
                                    attack: function () { }
                                };
                                //Freeze status
                                target.addBuffer(bufferObj);
                                target.stop();
                                clearInterval(target.dockTimer);
                                //Flag
                                target.buffer.Lockdown = true;
                                //Lockdown animation, show hidden frames first
                                const anime = new Animation.Lockdown({
                                    target: target, callback: () => {
                                        //Restore after 60 seconds
                                        if (target.status != 'dead' && target.buffer.Lockdown) {
                                            if (target.removeBuffer(bufferObj)) delete target.buffer.Lockdown;
                                            target.dock();
                                        }
                                    }
                                });
                                anime.action = 7;
                                //Lockdown sound
                                if (anime.insideScreen()) new Audio('bgm/Magic.Lockdown.wav').play();
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
Magic.NuclearStrike = {
    name: "NuclearStrike",
    enabled: 1,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Move toward target to fire Nuclear bomb
            this.targetLock = true;
            this.moveTo(location.x, location.y, this.get('sight'), () => {
                //Fire Nuclear bomb
                const bullet = new Bullets.NuclearBomb({
                    from: { x: location.x, y: location.y - 250 },
                    to: { x: location.x, y: location.y }
                });
                this.bullet = bullet;
                //Fire Nuclear bomb with callback
                bullet.fire(() => {
                    //Nuclear bomb effect, should earlier than bomb animation draw
                    //Get in range charas, no matter ours or enemies
                    const targets = Game.getInRangeOnes(location.x, location.y, 175);
                    targets.forEach((chara) => {
                        //Cause 500 damage
                        chara.life -= 500;
                        if (chara.life <= 0) chara.die();
                    });
                    //Nuclear animation
                    const anime = new Animation.NuclearStrike({ x: location.x, y: location.y });
                    //Nuclear sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.NuclearStrike.wav').play();
                    //Use one bomb
                    if (Magic.NuclearStrike.enabled > 0) {
                        Magic.NuclearStrike.enabled--;
                        Button.reset();
                    }
                });
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Heal = {
    name: "Heal",
    cost: { magic: 1 },
    credit: true,
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Heal our units on ground, animal unit
            const target = Game.getSelectedOne(location.x, location.y, false, true, false, (chara) => {
                return !(chara.isMachine());
            });
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to heal him
                this.moveToward(target, 70, () => {
                    //Heal target until becoming healthy
                    const healTimer = setInterval(() => {
                        if (Game && Game.isPaused) return;
                        //Medic has magic and target is injured
                        if (this.magic && target.life < target.get('HP')) {
                            //Heal target
                            target.life += 10;
                            if (target.life > target.get('HP')) target.life = target.get('HP');
                            this.magic -= 5;
                            //Heal action and sound
                            if (this.insideScreen()) new Audio('bgm/Magic.Heal.wav').play();
                        }
                        else clearInterval(healTimer);
                    }, 500);
                });
            }
            delete this.creditBill;//else
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.Restoration = {
    name: "Restoration",
    cost: { magic: 50 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Restore all units
            const target = Game.getSelectedOne(location.x, location.y, null, true);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to restore unit
                this.moveToward(target, 140, () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Restore effect
                        const anime = new Animation.Restoration({ target: target });
                        //Restore sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Restoration.wav').play();
                        //Remove all bufferObjs
                        $.extend([], target.bufferObjs).forEach((bufferObj) => {
                            target.removeBuffer(bufferObj);
                        });
                        //Remove remaining buffer
                        if (target.cloakBuffer) delete target.cloakBuffer;
                        if (target.purpleBuffer) delete target.purpleBuffer;
                        //Delete all buffer animations on target
                        const bufferAnimations = ['StasisField', 'Lockdown', 'Plague', 'Ensnare', 'PurpleEffect', 'RedEffect', 'GreenEffect', 'DefensiveMatrix', 'MaelStorm', 'Irradiate'];
                        $.extend([], Burst.allEffects).forEach((effect) => {
                            if (effect.target == target && bufferAnimations.some((name) => (effect instanceof Animation[name])))
                                Burst.allEffects.splice(Burst.allEffects.indexOf(effect), 1);
                        });
                        //Delete all buffers, some cannot delete
                        if (target.buffer.Hallucination) target.buffer = { Hallucination: true };
                        else target.buffer = {};
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
Magic.OpticalFlare = {
    name: "OpticalFlare",
    cost: { magic: 75 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Shoot enemy unit
            const target = Game.getSelectedOne(location.x, location.y, true, true);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to fire optical flare
                this.moveToward(target, this.get('sight'), () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Fire optical flare
                        const bullet = new Bullets.VultureBall({
                            from: this,
                            to: target,
                            damage: 0
                        });
                        this.bullet = bullet;
                        bullet.fire(() => {
                            //Effect
                            const bufferObj = {
                                sight: target.radius()
                            };
                            if (target.status != 'dead') target.addBuffer(bufferObj);
                            //Buffer flag
                            target.buffer.Blind = true;
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
Magic.SpiderMines = {
    name: "SpiderMines",
    enabled: false,
    spell: function (location) { }
};
Magic.SeigeMode = {
    name: "SeigeMode",
    enabled: false,
    spell: function () {
        // Stop the tank
        this.stop();
        this.targetLock = true;
        // Transformation duration
        Game.commandTimeout(() => {
            if (this.status != 'dead') {
                // Apply Siege Mode stats
                this.buffer.SeigeMode = {
                    speed: 0,
                    attackRange: 420,
                    damage: 70,
                    AOE: {
                        type: "splash",
                        radius: 35,
                        hasEffect: true
                    },
                    name: "Tank (Seige Mode)"
                };
                // Swap items to allow Unseige
                this.oldItems = this.items;
                this.items = {
                    '7': {
                        name: 'TankMode', run: () => {
                            Magic.TankMode.spell.call(this);
                        }
                    }
                };
                Button.reset();
                if (this.insideScreen()) new Audio('bgm/Tank.siege.wav').play();
            }
        }, 2000);
    }
};
Magic.TankMode = {
    name: "TankMode",
    enabled: true,
    spell: function () {
        // Transformation duration
        Game.commandTimeout(() => {
            if (this.status != 'dead') {
                // Remove Siege Mode stats
                delete this.buffer.SeigeMode;
                // Restore items
                this.items = this.oldItems;
                delete this.oldItems;
                Button.reset();
                if (this.insideScreen()) new Audio('bgm/Tank.unsiege.wav').play();
            }
        }, 2000);
    }
};
Magic.Cloak = {
    name: "Cloak",
    cost: { magic: 25 },
    enabled: false,
    spell: function () {
        Magic.PersonalCloak.spell.call(this);
    }
};
Magic.DefensiveMatrix = {
    name: "DefensiveMatrix",
    cost: { magic: 100 },
    credit: true,
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Restore our units
            const target = Game.getSelectedOne(location.x, location.y, false, true, null, (chara) => {
                return !chara.buffer.DefensiveMatrix;//Not again
            });
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to activate defensive matrix
                this.moveToward(target, 250, () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Defensive matrix animation
                        const anime = new Animation.DefensiveMatrix({
                            target: target, callback: () => {
                                //Restore after 60 seconds, if no restoration executed, or interrupted by enemy attack
                                if (target.status != 'dead' && anime.status != 'dead' && target.buffer.DefensiveMatrix) {
                                    if (target.removeBuffer(bufferObj)) delete target.buffer.DefensiveMatrix;
                                }
                            }
                        });
                        //DefensiveMatrix sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.DefensiveMatrix.wav').play();
                        //Defensive matrix effect: absorb 250 damage
                        let matrixHP = 250;
                        const bufferObj = {
                            calculateDamageBy: function (enemyObj) {
                                let damage;
                                if (enemyObj instanceof Gobj) {
                                    let enemyAttackType = enemyObj.attackType;
                                    if (!enemyAttackType && enemyObj.attackMode) {
                                        enemyAttackType = (this.isFlying) ? enemyObj.attackMode.flying.attackType : enemyObj.attackMode.ground.attackType;
                                    }
                                    damage = enemyObj.get('damage') * Unit.attackMatrix[enemyAttackType][this.unitType];
                                }
                                else damage = enemyObj;
                                //Consume matrixHP
                                matrixHP -= damage;
                                //Fully absorb damage if matrixHP still remain
                                if (matrixHP > 0) return 0;
                                else {
                                    anime.die();
                                    //Release remaining damage
                                    return -matrixHP;
                                }
                            }
                        };
                        //Apply effect
                        target.addBuffer(bufferObj);
                        //Buffer flag
                        target.buffer.DefensiveMatrix = true;
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
Magic.EMPShockwave = {
    name: "EMPShockwave",
    cost: { magic: 100 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Move toward target to fire Plague
            this.targetLock = true;
            this.moveTo(location.x, location.y, this.get('sight'), () => {
                if (Resource.payCreditBill.call(this)) {
                    //Fire EMPShockwave
                    const bullet = new Bullets.SingleMissile({
                        from: this,
                        to: { x: location.x, y: location.y }
                    });
                    this.bullet = bullet;
                    //Fire EMPShockwave bullet with callback
                    bullet.fire(() => {
                        //EMP shockwave animation
                        const anime = new Animation.EMPShockwave({ x: location.x, y: location.y });
                        //EMPShockwave sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.EMPShockwave.wav').play();
                        //Get in range enemies
                        const targets = Game.getInRangeOnes(location.x, location.y, [90 * 1.2 >> 0, 74 * 1.2 >> 0], true);
                        //Effect
                        targets.forEach((chara) => {
                            //Losing all shield and magic
                            if (chara.shield) chara.shield = 0;
                            if (chara.magic) chara.magic = 0;
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
Magic.Irradiate = {
    name: "Irradiate",
    cost: { magic: 75 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Target enemy unit, animal unit
            const target = Game.getSelectedOne(location.x, location.y, true, true, null, (chara) => {
                return !(chara.isMachine()) && !chara.buffer.Irradiate;
            });
            if (target instanceof Gobj) {
                this.targetLock = true;
                const irradiate = (chara) => {
                    //Irradiate effect
                    const anime = new Animation.Irradiate({
                        target: chara, callback: () => {
                            //Restore after 25 seconds, dealing 250 damage
                            if (chara.status != 'dead' && chara.buffer.Irradiate) {
                                if (chara.removeBuffer(bufferObj)) delete chara.buffer.Irradiate;
                                clearInterval(chara.dockTimer);
                                chara.dock();
                            }
                        }
                    });
                    //Irradiate sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.Irradiate.wav').play();
                    //Losing life over time and walk around
                    chara.buffer.Irradiate = true;//Flag
                    const bufferObj = {
                        recover: function () {
                            //Get in range enemies and infect
                            Game.getInRangeOnes(chara.posX(), chara.posY(), 50, true, true, null, (chara) => {
                                return !(chara.isMachine()) && !chara.buffer.Irradiate;
                            }).forEach((chara) => {
                                irradiate(chara);
                            });
                            if (this.life > 0) this.life -= 10;//Refresh every 1 seconds
                            if (this.life <= 0) this.die();
                        },
                        dock: Neutral.Bengalaas.prototype.dock
                    };
                    chara.addBuffer(bufferObj);
                    chara.dock();
                };
                //Move toward target to spell Irradiate
                this.moveToward(target, 300, () => {
                    if (Resource.payCreditBill.call(this)) {
                        irradiate(target);
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
Magic.Yamato = {
    name: "Yamato",
    cost: { magic: 150 },
    credit: true,
    enabled: false,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            //Shoot all enemy
            const target = Game.getSelectedOne(location.x, location.y, true);
            if (target instanceof Gobj) {
                this.targetLock = true;
                //Move toward target to fire yamato
                this.moveToward(target, this.get('sight'), () => {
                    if (Resource.payCreditBill.call(this)) {
                        //Fire yamato
                        const bullet = new Bullets.Yamato({
                            from: this,
                            to: target,
                            damage: 250
                        });
                        this.bullet = bullet;
                        bullet.fire();
                        if (this.insideScreen()) new Audio('bgm/HeroCruiser.attack.wav').play();
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
Magic.ScannerSweep = {
    name: "ScannerSweep",
    cost: { magic: 50 },
    credit: true,
    enabled: true,
    spell: function spell(location) {
        //Has location callback info or nothing
        if (location) {
            if (Resource.payCreditBill.call(this)) {
                //ScannerSweep animation
                const anime = new Animation.ScannerSweep({ x: location.x, y: location.y });
                //ScannerSweep sound
                if (anime.insideScreen()) new Audio('bgm/Magic.ScannerSweep.wav').play();
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback = _$.hitch(spell, this);
            $('div.GameLayer').attr('status', 'button');
        }
    }
};
Magic.ArmNuclearSilo = {
    name: "ArmNuclearSilo",
    cost: { mine: 200, gas: 200, man: 8 },
    enabled: true,
    spell: function () {
        Magic.NuclearStrike.enabled++;
    }
};
Magic.LiftOff = {
    name: "LiftOff",
    enabled: false,
    spell: function () { }
};
Magic.Land = {
    name: "Land",
    enabled: false,
    spell: function (location) { }
};
