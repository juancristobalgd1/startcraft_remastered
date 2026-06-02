import _$ from '../Utils/gFrame/core.js';
import '../Utils/gFrame/utils.js';
import Building from '../Characters/Buildings/core/BuildingBase.js';
import { ZergBuilding, TerranBuilding, ProtossBuilding } from '../Characters/Buildings/core/BuildingRaces.js';
import Game from './Games/core/GameBase.js';
import Referee from './Referees/core/RefereeBase.js';
import Cheat from './Cheat.js';
import Zerg from '../Characters/Zergs/core/ZergBase.js';
import Terran from '../Characters/Terrans/core/TerranBase.js';
import Protoss from '../Characters/Protosses/core/ProtossBase.js';
import Magic from '../Characters/Magics/core/MagicBase.js';
import Upgrade from '../Characters/Upgrades/core/UpgradeBase.js';

const Resource = {
    playerNum: 0,
    init: function (num) {
        if (num == undefined) num = 2;
        for (let N = 0; N < num; N++) {
            Resource[N] = {
                mine: 50,
                gas: 0,
                curMan: 0,
                totalMan: 0
            };
        }
        Resource.playerNum = num;
    },
    // Cache for ES6 class field cost lookups (avoid repeated instantiation)
    _costCache: new WeakMap(),
    getCost: function (name, team) {
        if (team === undefined) team = (Game.team !== undefined ? Game.team : 0);
        let cost;

        [Zerg, Terran, Protoss, ZergBuilding, TerranBuilding, ProtossBuilding, Magic, Upgrade].forEach(function (Type) {
            if (!Type) return;
            for (let item in Type) {
                //Filter out noise
                if (item == 'inherited' || item == 'super' || item == 'extends') continue;
                if (item == name) {
                    // Try prototype.cost first (legacy pattern), then static cost,
                    // then fallback to instance cost (ES6 class fields are instance properties)
                    cost = (Type[item].prototype && Type[item].prototype.cost) ? Type[item].prototype.cost : Type[item].cost;
                    if (!cost && typeof Type[item] === 'function') {
                        // ES6 class fields are instance-only: use cached dummy to read cost
                        if (!Resource._costCache.has(Type[item])) {
                            try {
                                const dummy = new Type[item]();
                                Resource._costCache.set(Type[item], (dummy && dummy.cost) ? dummy.cost : null);
                            } catch (e) {
                                Resource._costCache.set(Type[item], null);
                            }
                        }
                        cost = Resource._costCache.get(Type[item]);
                    }
                    //Resolve array cost
                    if (cost) {
                        //Clone fetched cost object, but sometimes undefined
                        cost = _$.clone(cost);
                        ['mine', 'gas', 'man', 'magic', 'time'].forEach(function (res) {
                            if (cost[res] && (cost[res] instanceof Array)) {
                                cost[res] = cost[res][Type[item].level[team]];
                            }
                        });
                    }
                }
            }
        });
        return cost;
    },
    //Check if paid successfully
    paypal: function (cost) {
        if (cost) {
            let oweFlag = false,
                msg = '';
            if (Cheat && Cheat.gathering) cost.magic = 0;
            const team = (this.team != null) ? this.team : (Game.team !== undefined ? Game.team : 0);
            if (cost['mine'] && cost['mine'] > Resource[team].mine) {
                oweFlag = true;
                msg += 'Not enough minerals...mine more minerals<br>';
                //Advisor voice
                if (Referee && Referee.voice && Referee.voice.resource && Game && Game.race && Game.race.selected)
                    Referee.voice.resource[Game.race.selected].mine.play();
            }
            if (cost['gas'] && cost['gas'] > Resource[team].gas) {
                oweFlag = true;
                msg += 'Not enough Vespene gases...harvest more gas<br>';
                //Advisor voice
                if (Referee && Referee.voice && Referee.voice.resource && Game && Game.race && Game.race.selected)
                    Referee.voice.resource[Game.race.selected].gas.play();
            }
            if (cost['man'] && cost['man'] > (Resource[team].totalMan - Resource[team].curMan)) {
                oweFlag = true;
                if (Game && Game.race && Game.race.selected) {
                    switch (Game.race.selected) {
                        case 'Zerg':
                            msg += 'Too many underlings...create more Overlords<br>';
                            break;
                        case 'Terran':
                            msg += 'Not enough supplies...build more Supply Depots<br>';
                            break;
                        case 'Protoss':
                            msg += 'Not enough psi...build more Pylons<br>';
                            break;
                    }
                    //Advisor voice
                    if (Referee && Referee.voice && Referee.voice.resource)
                        Referee.voice.resource[Game.race.selected].man.play();
                }
            }
            if (cost['magic'] && cost['magic'] > this.magic) {
                oweFlag = true;
                msg += 'Not enough energy<br>';
                //Advisor voice
                if (Referee && Referee.voice && Referee.voice.resource && Game && Game.race && Game.race.selected)
                    Referee.voice.resource[Game.race.selected].magic.play();
            }
            if (oweFlag) {
                if (Game && Game.showMessage) Game.showMessage(msg);
                //Payment failed
                return false;
            } else {
                if (!this.creditBill) {
                    //Pay immediately
                    if (cost['mine']) {
                        Resource[team].mine -= cost['mine'];
                    }
                    if (cost['gas']) {
                        Resource[team].gas -= cost['gas'];
                    }
                    if (cost['magic']) {
                        this.magic -= cost['magic'];
                    }
                }
                //Already paid
                return true;
            }
        }
        //No bill
        else return true;
    },
    //Pay credit card bill
    payCreditBill: function () {
        const cost = this.creditBill;
        //Paid credit bill, no longer owe money this time
        delete this.creditBill;
        return Resource.paypal.call(this, cost);
    }
};

if (typeof window !== 'undefined') {
    window.Resource = Resource;
}
export default Resource;
