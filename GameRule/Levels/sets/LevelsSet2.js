Levels.push(
    {
        level: 4,
        load: function () {
            //Load map
            GameMap.setCurrentMap('BloodBath');
            GameMap.offsetX = 50;
            GameMap.offsetY = 50;
            GameMap.fogFlag = false;
            //Apply race style
            Game.race.choose('Zerg');
            //Apply cheat for testing
            Cheat.execute('something for nothing');
            //Load units
            new Zerg.Drone({ x: 100, y: 100 });
            new Zerg.Zergling({ x: 200, y: 100 });
            new Zerg.Hydralisk({ x: 100, y: 200 });
            new Zerg.Scourge({ x: 200, y: 200 });
            new Zerg.Lurker({ x: 100, y: 300 });
            new Zerg.Ultralisk({ x: 200, y: 300 });
            new Zerg.Broodling({ x: 100, y: 400 });
            new Zerg.InfestedTerran({ x: 200, y: 400 });
            new Zerg.Queen({ x: 100, y: 50 });
            new Zerg.Defiler({ x: 200, y: 50 });
            new Hero.Sarah({ x: 100, y: 150 });
            new Zerg.Mutalisk({ x: 50, y: 50 });
            new Zerg.Guardian({ x: 50, y: 150 });
            new Zerg.Devourer({ x: 50, y: 250 });
            //Add enemy
            new Zerg.Drone({ x: 700, y: 100, isEnemy: true });
            new Zerg.Zergling({ x: 700, y: 200, isEnemy: true });
            new Zerg.Hydralisk({ x: 700, y: 300, isEnemy: true });
            new Zerg.Scourge({ x: 800, y: 100, isEnemy: true });
            new Zerg.Lurker({ x: 800, y: 200, isEnemy: true });
            new Zerg.Ultralisk({ x: 800, y: 300, isEnemy: true });
            new Zerg.Broodling({ x: 700, y: 150, isEnemy: true });
            new Zerg.InfestedTerran({x:700,y:250,isEnemy:true});
            new Zerg.Queen({ x: 800, y: 150, isEnemy: true });
            new Zerg.Defiler({ x: 800, y: 250, isEnemy: true });
        }
    },
    {
        level: 5,
        load: function () {
            //Load map
            GameMap.setCurrentMap('OrbitalRelay');
            GameMap.offsetX = 50;
            GameMap.offsetY = 50;
            GameMap.fogFlag = false;
            //Apply race style
            Game.race.choose('Terran');
            //Apply cheat for testing
            Cheat.execute('something for nothing');
            //Load units
            new Terran.Marine({ x: 100, y: 100 });
            new Terran.Firebat({ x: 200, y: 100 });
            new Terran.Ghost({ x: 100, y: 200 });
            new Terran.Vulture({ x: 200, y: 200 });
            new Terran.Tank({ x: 100, y: 300 });
            new Terran.Goliath({ x: 200, y: 300 });
            new Terran.Medic({ x: 100, y: 400 });
            new Terran.Dropship({ x: 200, y: 400 });
            new Terran.Vessel({ x: 100, y: 50 });
            new Terran.Valkyrie({ x: 200, y: 50 });
            new Hero.Kerrigan({ x: 100, y: 150 });
            new Terran.Wraith({ x: 200, y: 150 });
            new Terran.SCV({ x: 50, y: 250 });
            new Terran.BattleCruiser({ x: 150, y: 250 });
            //Add enemy
            new Terran.Marine({ x: 700, y: 100, isEnemy: true });
            new Terran.Firebat({ x: 700, y: 200, isEnemy: true });
            new Terran.Vulture({ x: 700, y: 300, isEnemy: true });
            new Terran.Tank({ x: 800, y: 100, isEnemy: true });
            new Terran.Goliath({ x: 800, y: 200, isEnemy: true });
            new Terran.Dropship({ x: 800, y: 300, isEnemy: true });
            new Terran.Vessel({ x: 700, y: 150, isEnemy: true });
            new Terran.Valkyrie({ x: 700, y: 250, isEnemy: true });
        }
    },
    {
        level: 6,
        load: function () {
            //Load map
            GameMap.setCurrentMap('ThinIce');
            //Apply race style
            Game.race.choose('Protoss');
            //Apply cheat for testing
            Cheat.execute('something for nothing');
            //Load units
            new Protoss.Probe({ x: 100, y: 100 });
            new Protoss.Zealot({ x: 200, y: 100 });
            new Protoss.Dragoon({ x: 100, y: 200 });
            new Protoss.Templar({ x: 200, y: 200 });
            new Protoss.DarkTemplar({ x: 100, y: 300 });
            new Protoss.Reaver({ x: 200, y: 300 });
            new Protoss.Archon({ x: 100, y: 400 });
            new Protoss.DarkArchon({ x: 200, y: 400 });
            new Protoss.Shuttle({ x: 100, y: 50 });
            new Protoss.Observer({ x: 200, y: 50 });
            new Protoss.Observer({ x: 200, y: 100 });
            new Protoss.Arbiter({ x: 100, y: 150 });
            new Protoss.Scout({ x: 200, y: 150 });
            new Protoss.Carrier({ x: 100, y: 250 });
            new Protoss.Corsair({ x: 200, y: 250 });
            //Add enemy
            new Protoss.Probe({ x: 700, y: 100, isEnemy: true });
            new Protoss.Zealot({ x: 700, y: 200, isEnemy: true });
            new Protoss.Dragoon({ x: 700, y: 300, isEnemy: true });
            new Protoss.Templar({ x: 800, y: 100, isEnemy: true });
            new Protoss.DarkTemplar({ x: 800, y: 200, isEnemy: true });
            new Protoss.Observer({ x: 800, y: 300, isEnemy: true });
            new Protoss.Reaver({x:800,y:300,isEnemy:true});
            new Protoss.Arbiter({ x: 700, y: 250, isEnemy: true });
            new Protoss.Scout({ x: 750, y: 250, isEnemy: true });
            new Protoss.Carrier({ x: 700, y: 150, isEnemy: true });
            new Protoss.Corsair({ x: 700, y: 200, isEnemy: true });
            new Protoss.Carrier({x:700,y:250,isEnemy:true});
        }
    }
);
