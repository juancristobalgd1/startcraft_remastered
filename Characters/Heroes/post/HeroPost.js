import '../../../Utils/gFrame/core.js';
import '../../../Utils/gFrame/utils.js';
import Zerg from '../../Zergs/core/ZergBase.js';
import Terran from '../../Terrans/core/TerranBase.js';
import Protoss from '../../Protosses/core/ProtossBase.js';
import { Neutral } from '../../Breeds/Neutral.js';
import Hero from '../core/HeroBase.js';

const _$ = globalThis._$;

_$.traverse([Zerg, Terran, Protoss, Neutral, Hero], function (unitType) {
    ['HP', 'SP', 'MP', 'damage', 'armor', 'speed', 'attackRange', 'attackInterval', 'plasma', 'sight'].forEach(function (prop) {
        if (unitType.prototype[prop] != undefined) {
            unitType.prototype[prop] = [unitType.prototype[prop], unitType.prototype[prop]];
            unitType.prototype[prop].shareFlag = true;
        }
    });
    if (unitType.prototype.attackMode) {
        ['damage', 'attackRange', 'attackInterval'].forEach(function (prop) {
            unitType.prototype.attackMode.flying[prop] =
                [unitType.prototype.attackMode.flying[prop], unitType.prototype.attackMode.flying[prop]];
            unitType.prototype.attackMode.flying[prop].shareFlag = true;
            unitType.prototype.attackMode.ground[prop] =
                [unitType.prototype.attackMode.ground[prop], unitType.prototype.attackMode.ground[prop]];
            unitType.prototype.attackMode.ground[prop].shareFlag = true;
        });
    }
    unitType.upgrade = function (prop, value, isEnemy) {
        switch (isEnemy) {
            case false:
                unitType.prototype[prop][0] = value;
                break;
            case true:
                unitType.prototype[prop][1] = value;
                break;
            case undefined:
                unitType.prototype[prop] = value;
                break;
        }
    };
});

if (Protoss.Carrier && Protoss.Carrier.prototype) {
    Protoss.Carrier.prototype.interceptorCapacity =
        [Protoss.Carrier.prototype.interceptorCapacity, Protoss.Carrier.prototype.interceptorCapacity];
    Protoss.Carrier.prototype.interceptorCapacity.shareFlag = true;
}

if (Protoss.Reaver && Protoss.Reaver.prototype) {
    Protoss.Reaver.prototype.scarabCapacity =
        [Protoss.Reaver.prototype.scarabCapacity, Protoss.Reaver.prototype.scarabCapacity];
    Protoss.Reaver.prototype.scarabCapacity.shareFlag = true;
}
