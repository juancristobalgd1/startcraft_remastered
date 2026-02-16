Levels.push(
    {
        level: 1,
        load: function () {
            //Load map
            GameMap.setCurrentMap('Switchback');
            GameMap.offsetX = 50;
            GameMap.offsetY = 50;
            Resource[0].mine = 1000;
            Resource[0].gas = 1000;
            //Apply race style
            Game.race.choose('Terran');
            //Load units
            new Terran.BattleCruiser({ x: 100, y: 100 });
            new Terran.Wraith({ x: 200, y: 100 });
            new Terran.BattleCruiser({ x: 100, y: 200 });
            new Terran.Wraith({ x: 200, y: 200 });
            new Terran.BattleCruiser({ x: 100, y: 300 });
            new Terran.Wraith({ x: 200, y: 300 });
            new Terran.SCV({ x: 100, y: 400 });
            new Zerg.Drone({ x: 150, y: 400 });
            new Protoss.Probe({ x: 200, y: 400 });
            //Add enemy
            new Terran.SCV({ x: 600, y: 400, isEnemy: true });
            new Zerg.Mutalisk({ x: 700, y: 100, isEnemy: true });
            new Zerg.Devourer({ x: 800, y: 100, isEnemy: true });
            new Zerg.Guardian({ x: 900, y: 100, isEnemy: true });
            new Zerg.Mutalisk({ x: 700, y: 200, isEnemy: true });
            new Zerg.Devourer({ x: 800, y: 200, isEnemy: true });
            new Zerg.Guardian({ x: 900, y: 200, isEnemy: true });
            new Zerg.Mutalisk({ x: 700, y: 300, isEnemy: true });
            new Zerg.Devourer({ x: 800, y: 300, isEnemy: true });
            new Zerg.Guardian({ x: 900, y: 300, isEnemy: true });
        }
    },
    {
        level: 2,
        load: function () {
            //Load map
            GameMap.setCurrentMap('Volcanis');
            //Apply race style
            Game.race.choose('Zerg');
            //Load units
            new Zerg.Overlord({ x: 100, y: 100 });
            new Hero.HeroCruiser({ x: 100, y: 200 });
            new Terran.Civilian({ x: 100, y: 300 });
            new Zerg.Mutalisk({ x: 200, y: 100 });
            new Zerg.Devourer({ x: 200, y: 200 });
            new Zerg.Guardian({ x: 200, y: 300 });
            //Add enemy
            new Terran.Wraith({ x: 700, y: 100, isEnemy: true });
            new Terran.Wraith({ x: 800, y: 100, isEnemy: true });
            new Terran.Wraith({ x: 900, y: 100, isEnemy: true });
            new Zerg.Mutalisk({ x: 700, y: 200, isEnemy: true });
            new Zerg.Devourer({ x: 800, y: 200, isEnemy: true });
            new Zerg.Guardian({ x: 900, y: 200, isEnemy: true });
            new Zerg.Mutalisk({ x: 700, y: 300, isEnemy: true });
            new Zerg.Devourer({ x: 800, y: 300, isEnemy: true });
            new Zerg.Guardian({ x: 900, y: 300, isEnemy: true });
        }
    },
    {
        level: 3,
        load: function () {
            //Load map
            GameMap.setCurrentMap('TrenchWars');
            //Apply race style
            Game.race.choose('Zerg');
            //Load units
            new Neutral.Ragnasaur({ x: 100, y: 100 });
            new Neutral.Rhynsdon({ x: 200, y: 100 });
            new Neutral.Ursadon({ x: 100, y: 200 });
            new Neutral.Bengalaas({ x: 200, y: 200 });
            new Neutral.Scantid({ x: 100, y: 300 });
            new Neutral.Kakaru({ x: 200, y: 300 });
            new Zerg.Guardian({ x: 150, y: 100 });
            new Zerg.Guardian({ x: 150, y: 200 });
            new Zerg.Guardian({ x: 150, y: 300 });
            //Add enemy
            new Neutral.Ragnasaur({ x: 700, y: 100, isEnemy: true });
            new Neutral.Rhynsdon({ x: 700, y: 200, isEnemy: true });
            new Neutral.Ursadon({ x: 700, y: 300, isEnemy: true });
            new Neutral.Bengalaas({ x: 800, y: 100, isEnemy: true });
            new Neutral.Scantid({ x: 800, y: 200, isEnemy: true });
            new Neutral.Kakaru({ x: 800, y: 300, isEnemy: true });
            //new Zerg.Mutalisk({x:900,y:150,isEnemy:true});
            //new Zerg.Guardian({x:900,y:250,isEnemy:true});
        }
    }
);
