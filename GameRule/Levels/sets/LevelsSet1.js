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
            new Protoss.Probe({ x: 200, y: 400 });
            new Zerg.Drone({ x: 150, y: 400 });
            new Protoss.Zealot({ x: 200, y: 300 });

            //Add enemy (placed within visible range for gameplay)
            new Terran.SCV({ x: 400, y: 400, isEnemy: true });
            new Zerg.Mutalisk({ x: 350, y: 100, isEnemy: true });
            new Zerg.Devourer({ x: 400, y: 100, isEnemy: true });
            new Zerg.Guardian({ x: 450, y: 100, isEnemy: true });
            new Zerg.Mutalisk({ x: 350, y: 200, isEnemy: true });
            new Zerg.Devourer({ x: 400, y: 200, isEnemy: true });
            new Zerg.Guardian({ x: 450, y: 200, isEnemy: true });
            new Zerg.Mutalisk({ x: 350, y: 300, isEnemy: true });
            new Zerg.Devourer({ x: 400, y: 300, isEnemy: true });
            new Zerg.Guardian({ x: 450, y: 300, isEnemy: true });
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
            //Add enemy (placed within visible range)
            new Terran.Wraith({ x: 400, y: 100, isEnemy: true });
            new Terran.Wraith({ x: 450, y: 100, isEnemy: true });
            new Terran.Wraith({ x: 500, y: 100, isEnemy: true });
            new Zerg.Mutalisk({ x: 400, y: 200, isEnemy: true });
            new Zerg.Devourer({ x: 450, y: 200, isEnemy: true });
            new Zerg.Guardian({ x: 500, y: 200, isEnemy: true });
            new Zerg.Mutalisk({ x: 400, y: 300, isEnemy: true });
            new Zerg.Devourer({ x: 450, y: 300, isEnemy: true });
            new Zerg.Guardian({ x: 500, y: 300, isEnemy: true });
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
            //Add enemy (placed within visible range)
            new Neutral.Ragnasaur({ x: 400, y: 100, isEnemy: true });
            new Neutral.Rhynsdon({ x: 400, y: 200, isEnemy: true });
            new Neutral.Ursadon({ x: 400, y: 300, isEnemy: true });
            new Neutral.Bengalaas({ x: 450, y: 100, isEnemy: true });
            new Neutral.Scantid({ x: 450, y: 200, isEnemy: true });
            new Neutral.Kakaru({ x: 450, y: 300, isEnemy: true });
            new Zerg.Mutalisk({ x: 500, y: 150, isEnemy: true });
            new Zerg.Guardian({ x: 500, y: 250, isEnemy: true });
        }
    },
    {
        level: 4,
        label: 'TerranDefense',
        load: function () {
            //Load map
            GameMap.setCurrentMap('TrenchWars');
            GameMap.offsetX = 0;
            GameMap.offsetY = 0;
            GameMap.fogFlag = true;
            //Apply race style
            Game.race.choose('Terran');
            Resource[0].mine = 500;
            Resource[0].gas = 200;

            //Starting base
            new Building.TerranBuilding.CommandCenter({ x: 200, y: 300 });
            new Terran.SCV({ x: 150, y: 350 });
            new Terran.SCV({ x: 250, y: 350 });
            new Terran.Marine({ x: 400, y: 400 });
            new Terran.Marine({ x: 400, y: 450 });

            //Enemy Waves
            let wave = 1;
            const spawnEnemy = (type, count, delay) => {
                Game.commandTimeout(() => {
                    Game.showWarning('Wave ' + wave++ + ': ' + count + ' ' + (type.prototype.name || 'Enemy') + 's incoming!');
                    for (let i = 0; i < count; i++) {
                        new type({
                            x: 1000 + Game.random() * 200,
                            y: 300 + Game.random() * 200,
                            isEnemy: true
                        }).attackGround({ x: 200, y: 300 });
                    }
                }, delay);
            };

            spawnEnemy(Zerg.Zergling, 6, 20000);  // 20s
            spawnEnemy(Zerg.Hydralisk, 4, 40000); // 40s
            spawnEnemy(Zerg.Mutalisk, 3, 60000);  // 1m
            spawnEnemy(Zerg.Lurker, 2, 80000);    // 1m 20s

            Referee.winCondition = function () {
                return (wave > 4 && Unit.allEnemyUnits().length == 0);
            };
        }
    }
);
