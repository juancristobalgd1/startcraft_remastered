import Upgrade from './UpgradeBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';

Upgrade.UpgradeSunkenDamage = {
    name: "UpgradeSunkenDamage",
    cost: {
        mine: [50, 75, 100, 125, 150],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SunkenColony) {
                globalThis.Building.ZergBuilding.SunkenColony.prototype.damage += 5;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[1];
                }
            }
        }
    }
};

Upgrade.EnlargeSunkenArea = {
    name: "UpgradeSunkenArea",
    cost: {
        mine: [100, 125, 150, 175, 200],
        time: [300, 400, 500, 600, 700]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SunkenColony) {
                globalThis.Building.ZergBuilding.SunkenColony.prototype.AOE.radius += 50;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[2];
                }
            }
        }
    }
};

Upgrade.UpgradeSporeDamage = {
    name: "UpgradeSporeDamage",
    cost: {
        mine: [50, 60, 70, 80, 90],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.ZergBuilding && globalThis.Building.ZergBuilding.SporeColony) {
                globalThis.Building.ZergBuilding.SporeColony.prototype.damage += 3;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[3];
                }
            }
        }
    }
};

Upgrade.EnlargeSporeChain = {
    name: "EnlargeSporeChain",
    cost: {
        mine: [80, 90, 100, 110, 120],
        time: [300, 400, 500, 600, 700]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Bullets && globalThis.Bullets.Spore) {
                globalThis.Bullets.Spore.prototype.traceTimes += 1;
                globalThis.Bullets.Spore.prototype.traceRadius += 50;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[4];
                }
            }
        }
    }
};

Upgrade.UpgradeMissileDamage = {
    name: "UpgradeMissileDamage",
    cost: {
        mine: [50, 65, 80, 95, 110],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.TerranBuilding && globalThis.Building.TerranBuilding.MissileTurret) {
                globalThis.Building.TerranBuilding.MissileTurret.prototype.damage += 4;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[5];
                }
            }
        }
    }
};

Upgrade.IncreaseMissileCount = {
    name: "IncreaseMissileCount",
    cost: {
        mine: [80, 95, 110, 125, 140],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.TerranBuilding && globalThis.Building.TerranBuilding.MissileTurret) {
                globalThis.Building.TerranBuilding.MissileTurret.prototype.AOE.radius += 30;
                globalThis.Building.TerranBuilding.MissileTurret.prototype.AOE.count++;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[6];
                }
            }
        }
    }
};

Upgrade.UpgradePhotonCannonDamage = {
    name: "UpgradePhotonCannonDamage",
    cost: {
        mine: [50, 70, 90, 110, 130],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.PhotonCannon) {
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.damage += 4;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[7];
                }
            }
        }
    }
};

Upgrade.IncreasePhotonCannonCount = {
    name: "IncreasePhotonCannonCount",
    cost: {
        mine: [80, 95, 110, 125, 140],
        time: [300, 300, 300, 300, 300]
    },
    level: [0, 0],
    effect: function (isEnemy) {
        const idx = Number(Boolean(isEnemy));
        if (Game.level == 11 || Game.replayLevel == 11) {
            if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.PhotonCannon) {
                globalThis.Building.ProtossBuilding.PhotonCannon.prototype.continuousAttack.count++;
            }
            this.level[idx]++;
            if (this.level[idx] >= 5) {
                if (globalThis.Building && globalThis.Building.ProtossBuilding && globalThis.Building.ProtossBuilding.TeleportPoint) {
                    delete globalThis.Building.ProtossBuilding.TeleportPoint.prototype.items[8];
                }
            }
        }
    }
};

export default Upgrade;
