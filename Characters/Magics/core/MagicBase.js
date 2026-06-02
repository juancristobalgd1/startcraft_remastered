import _$ from '../../../Utils/gFrame/core.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import Gobj from '../../Gobj.js';
import Unit from '../../Units/core/UnitBase.js';
import Button from '../../Buttons/core/ButtonBase.js';
import Cheat from '../../../GameRule/Cheat.js';

const Magic = {};

Magic.Load = {
    name: "Load",
    enabled: false,
    spell: function spell(location) {
        if (location) {
            const target = Game.getSelectedOne(location.x, location.y, false, true, null, (chara) => {
                // Ground units only for transport, excludes self
                return !chara.isFlying && chara !== this;
            });
            if (target instanceof Gobj && target instanceof Unit) {
                const spaceUsed = this.cargo.reduce((sum, u) => sum + (u.unitType + 1), 0);
                const unitSize = target.unitType + 1;
                if (spaceUsed + unitSize <= this.get('cargoCapacity')) {
                    this.targetLock = true;
                    this.moveToward(target, 40, () => {
                        if (target.status !== "dead") {
                            // Stop unit
                            if (target.stop) target.stop();
                            if (target.stopAttack) target.stopAttack();

                            // Remove from active game lists
                            const remove = (arr, item) => {
                                const idx = arr.indexOf(item);
                                if (idx !== -1) arr.splice(idx, 1);
                            };
                            remove(Unit.allUnits, target);
                            if (target.isEnemy) remove(Unit.enemyGroundUnits, target);
                            else remove(Unit.ourGroundUnits, target);

                            this.cargo.push(target);
                            if (this.selected) Button.reset();

                            // Continue loading if more targets? (StarCraft allows queueing, but let's keep it simple)
                            this.targetLock = false;
                        }
                    });
                } else {
                    if (this === Game.selectedUnit && Game.showMessage) Game.showMessage("No hay suficiente capacidad");
                }
            } else {
                delete this.creditBill;
            }
        } else {
            Button.callback = _$.hitch(spell, this);
            globalThis.$('div.GameLayer').attr('status', 'button');
        }
    }
};

Magic.UnloadAll = {
    name: "UnloadAll",
    enabled: false,
    spell: function spell() {
        if (this.cargo && this.cargo.length > 0) {
            const passengers = [...this.cargo];
            this.cargo = [];
            passengers.forEach((passenger, index) => {
                Game.commandTimeout(() => {
                    passenger.status = "dock";
                    passenger.x = this.x;
                    passenger.y = this.y;
                    Unit.allUnits.push(passenger);
                    if (passenger.isEnemy) Unit.enemyGroundUnits.push(passenger);
                    else Unit.ourGroundUnits.push(passenger);
                    Unit.sortAllUnits();
                }, index * 200);
            });
            if (this.selected) Button.reset();
        }
    }
};

Magic.CleanScreen = {
    name: "CleanScreen",
    cost: {
        mine: 200
    },
    spell: function spell() {
        Cheat.execute('fuck your mother');
    }
};

if (typeof window !== 'undefined') {
    window.Magic = Magic;
}
export default Magic;
