var GameMap = {
    currentMap: 'Switchback',//By default
    offsetX: 0,
    offsetY: 0,
    speed: 40,
    triggerMargin: 20,
    //To synchronize drawing map and units, will not refresh immediately
    needRefresh: false,
    fogFlag: true,
    fogType: true,//If true using gradient shadow, if false use 3 circles
    miniCxt: $('canvas[name="mini_map"]')[0].getContext('2d'),
    fogCanvas: document.createElement('canvas'),
    miniFogCanvas: document.createElement('canvas'),
    shadowCanvas: document.createElement('canvas'),//Pre-render for fog shadow
    insideStroke: {
        width: 0,
        height: 0
    },
    //Init map
    setCurrentMap: function (name) {
        GameMap.currentMap = name;
        $('canvas[name="mini_map"]').attr('class', name);
        //Init inside stroke size
        GameMap.insideStroke.width = (130 * Game.HBOUND / GameMap.getCurrentMap().width) >> 0;
        GameMap.insideStroke.height = (130 * Game.VBOUND / GameMap.getCurrentMap().height) >> 0;
        //Init fog relative
        GameMap.fogCanvas.width = Game.HBOUND;
        GameMap.fogCanvas.height = Game.VBOUND;
        GameMap.fogCxt = GameMap.fogCanvas.getContext('2d');
        GameMap.miniFogCanvas.width = GameMap.miniFogCanvas.height = 130;
        GameMap.miniFogCxt = GameMap.miniFogCanvas.getContext('2d');
        GameMap.shadowCanvas.width = GameMap.shadowCanvas.height = 100;
        GameMap.shadowCxt = GameMap.shadowCanvas.getContext('2d');
        //Prepared fog shadow for quick render
        var radial = GameMap.shadowCxt.createRadialGradient(50, 50, 25, 50, 50, 50);
        radial.addColorStop(0, 'rgba(0,0,0,1)');
        radial.addColorStop(1, 'rgba(0,0,0,0)');
        GameMap.shadowCxt.fillStyle = radial;
        GameMap.shadowCxt.beginPath();
        GameMap.shadowCxt.arc(50, 50, 50, 0, Math.PI * 2);
        GameMap.shadowCxt.fill();
        GameMap._clearMapResources();
        GameMap._spawnMapResources();
        //Init explored map (32x32 tiles)
        GameMap.exploredW = (GameMap.getCurrentMap().width / 32) >> 0;
        GameMap.exploredH = (GameMap.getCurrentMap().height / 32) >> 0;
        GameMap.explored = new Uint8Array(GameMap.exploredW * GameMap.exploredH);
    },
    markExplored: function (x, y, sight) {
        if (!GameMap.explored) return;
        var r = (sight / 32) >> 0;
        var cx = (x / 32) >> 0;
        var cy = (y / 32) >> 0;
        for (var i = cx - r; i <= cx + r; i++) {
            for (var j = cy - r; j <= cy + r; j++) {
                if (i >= 0 && i < GameMap.exploredW && j >= 0 && j < GameMap.exploredH) {
                    if ((i - cx) * (i - cx) + (j - cy) * (j - cy) <= r * r) {
                        GameMap.explored[j * GameMap.exploredW + i] = 1;
                    }
                }
            }
        }
    },
    getCurrentMap: function () {
        return sourceLoader.sources['Map_' + GameMap.currentMap];
    },
    refreshFog: function () {
        if (GameMap.fogFlag && GameMap.fogCxt && GameMap.miniFogCxt) {
            var ctx = GameMap.fogCxt;
            var mCtx = GameMap.miniFogCxt;

            // 1. Fill with black (Unexplored)
            ctx.fillStyle = mCtx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, GameMap.fogCanvas.width, GameMap.fogCanvas.height);
            mCtx.fillRect(0, 0, 130, 130);

            // 2. Draw Explored areas as Grey (using destination-out with 0.5 alpha)
            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = mCtx.fillStyle = 'rgba(0,0,0,0.5)';

            if (GameMap.explored) {
                var worldX, worldY, mx, my;
                for (var j = 0; j < GameMap.exploredH; j++) {
                    for (var i = 0; i < GameMap.exploredW; i++) {
                        if (GameMap.explored[j * GameMap.exploredW + i]) {
                            worldX = i << 5; // * 32
                            worldY = j << 5; // * 32
                            ctx.fillRect(worldX - GameMap.offsetX, worldY - GameMap.offsetY, 32, 32);

                            mx = (worldX * 130 / GameMap.getCurrentMap().width) >> 0;
                            my = (worldY * 130 / GameMap.getCurrentMap().height) >> 0;
                            mCtx.fillRect(mx, my, 2, 2);
                        }
                    }
                }
            }

            // 3. Clear visible area (Visible)
            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = mCtx.fillStyle = 'rgba(0,0,0,1)'; // Full transparency

            // Process visibility without creating intermediate arrays
            var _fogProcess = function (chara) {
                if (chara.status == 'dead') return;
                if (chara.insideScreen && chara.insideScreen()) {
                    ctx.beginPath();
                    ctx.arc(chara.posX() - GameMap.offsetX, chara.posY() - GameMap.offsetY, chara.get('sight'), 0, 2 * Math.PI);
                    ctx.fill();
                    GameMap.markExplored(chara.posX(), chara.posY(), chara.get('sight'));
                }
                var mapW = GameMap.getCurrentMap().width;
                var mapH = GameMap.getCurrentMap().height;
                var mx = (chara.posX() * 130 / mapW) >> 0;
                var my = (chara.posY() * 130 / mapH) >> 0;
                var sight = (chara.get('sight') * 130 / mapH) >> 0;
                mCtx.beginPath();
                if (GameMap.fogType) {
                    mCtx.drawImage(GameMap.shadowCanvas, 0, 0, 100, 100, mx - (sight << 1), my - (sight << 1), sight << 2, sight << 2);
                } else {
                    mCtx.arc(mx, my, sight, 0, 2 * Math.PI);
                    mCtx.fill();
                }
            };
            // Our units (iterate directly, no concat)
            var _ourU = Unit.allOurUnits();
            for (var _fi = 0; _fi < _ourU.length; _fi++) _fogProcess(_ourU[_fi]);
            for (var _fi = 0; _fi < Building.ourBuildings.length; _fi++) _fogProcess(Building.ourBuildings[_fi]);
            // Parasited enemies and scanner sweeps (these are rare, filter is ok)
            var _enemyU = Unit.allEnemyUnits();
            for (var _fi = 0; _fi < _enemyU.length; _fi++) {
                if (_enemyU[_fi].buffer.Parasite) _fogProcess(_enemyU[_fi]);
            }
            for (var _fi = 0; _fi < Burst.allEffects.length; _fi++) {
                if (Animation.getName(Burst.allEffects[_fi]) == "ScannerSweep") _fogProcess(Burst.allEffects[_fi]);
            }

            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'source-over';
        }
    },
    drawFog: function () {
        if (GameMap.fogFlag && GameMap.fogCxt && GameMap.miniFogCxt) {
            //Reduce calculation frequency for performance, every 1 sec
            if (Game._clock % 10 == 0) GameMap.refreshFog();
            //Draw fog on main map, high frequency
            Game.frontCxt.drawImage(GameMap.fogCanvas, 0, 0);
        }
    },
    drawMiniFog: function () {
        if (GameMap.fogFlag && GameMap.miniFogCxt) {
            //Draw fog on mini-map
            GameMap.miniCxt.drawImage(GameMap.miniFogCanvas, 0, 0);
        }
    },
    drawExploredFog: function () {
        if (!GameMap.explored || !GameMap.fogFlag) return;
        var ctx = Game.backCxt;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; // Semi-transparent grey for explored
        for (var j = 0; j < GameMap.exploredH; j++) {
            var worldY = j * 32;
            if (worldY + 32 < GameMap.offsetY || worldY > GameMap.offsetY + Game.VBOUND) continue;
            for (var i = 0; i < GameMap.exploredW; i++) {
                var worldX = i * 32;
                if (worldX + 32 < GameMap.offsetX || worldX > GameMap.offsetX + Game.HBOUND) continue;
                if (GameMap.explored[j * GameMap.exploredW + i]) {
                    // Explored area: we don't draw anything here (it remains visible)
                    // BUT we want to darken it if it's currently in fog.
                    // The main fog logic will cover currently unseen areas with black.
                    // We want: 
                    // 1. Unexplored -> Black (Main Fog)
                    // 2. Explored but unseen -> Grey (We draw this here)
                    // 3. Visible -> Clear

                    // Actually, a simpler way:
                    // Fill everything with Grey on a middle layer, 
                    // then Main Fog covers everything with Black except visible.
                    // But "Explored" shouldn't be covered by Black.
                } else {
                    // Unexplored: will be handled by main black fog
                }
            }
        }
        ctx.restore();
    },
    drawMud: function () {
        var _increments = [[0, 1], [-1, 0], [0, -1], [1, 0]];
        //var _offsets=[[1,1],[-1,1],[1,-1],[-1,-1]];//4 circles radius
        /*var shadowOffsets=_$.mapTraverse(_offsets,function(x){
         return x*3;
         });*/
        var mudRadius = 120;
        var mudIncrements = _$.mapTraverse(_increments, function (x) {
            return x * mudRadius / 2;
        });
        /*var mudOffsets=_$.mapTraverse(_offsets,function(x){
            return x*mudRadius/2;
        });*/
        Game.backCxt.save();
        Game.backCxt.beginPath();
        //Create fill style for mud
        var mudPattern = Game.backCxt.createPattern(sourceLoader.sources['Mud'], "repeat");
        Game.backCxt.fillStyle = mudPattern;
        /*Game.backCxt.shadowColor="#212";//"rgba(0,0,0,0.7)"
        Game.backCxt.shadowBlur=8;*/
        Building.allBuildings.filter(function (chara) {
            return (chara instanceof Building.ZergBuilding) && !chara.noMud && chara.insideScreen();
        }).forEach(function (chara) {
            var centerX = chara.posX() - GameMap.offsetX;
            var centerY = chara.posY() - GameMap.offsetY;
            var pos = [centerX + mudRadius, centerY - mudRadius];
            Game.backCxt.moveTo(pos[0], pos[1]);
            for (var M = 0, angle = -Math.PI / 4; M < 4; M++, angle += Math.PI / 2) {
                for (var N = 0; N < 5; N++) {
                    Game.backCxt.arc(pos[0], pos[1], mudRadius / 4, angle, angle + Math.PI / 2);
                    if (N < 4) {
                        pos[0] += mudIncrements[M][0];
                        pos[1] += mudIncrements[M][1];
                    }
                }
            }
            /*//Mud shape mixed by 4 circles
            mudOffsets.forEach(function(offset){
                Game.backCxt.moveTo(centerX+offset[0]+mudRadius,centerY+offset[1]);
                Game.backCxt.arc(centerX+offset[0],centerY+offset[1],mudRadius,0,Math.PI*2);
            });*/
        });
        //Stroke edge clearly
        Game.backCxt.strokeStyle = "#212";
        Game.backCxt.lineWidth = 3;
        Game.backCxt.stroke();
        //Fill mud
        Game.backCxt.fill();
        /*//Radius shadow
        shadowOffsets.forEach(function(offset){
            Game.backCxt.offsetX=offset[0];
            Game.backCxt.offsetY=offset[1];
            Game.backCxt.fill();
         });*/
        Game.backCxt.restore();
    },
    isOnCreep: function (x, y) {
        var mudRadius = 180; // Slightly larger for construction
        return Building.allBuildings.some(function (chara) {
            if (!(chara instanceof Building.ZergBuilding) || chara.noMud || chara.status === 'dead') return false;
            var dx = chara.posX() - x;
            var dy = chara.posY() - y;
            return (dx * dx + dy * dy) < mudRadius * mudRadius;
        });
    },
    draw: function () {
        //Clear background
        Game.backCxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
        //Draw map as background
        Game.backCxt.drawImage(GameMap.getCurrentMap(), GameMap.offsetX, GameMap.offsetY, Game.HBOUND, Game.VBOUND - Game.infoBox.height + 5,
            0, 0, Game.HBOUND, Game.VBOUND - Game.infoBox.height + 5);
        //Draw mud for ZergBuildings
        GameMap.drawMud();
    },
    refresh: function (direction) {
        var edgeX = GameMap.getCurrentMap().width - Game.HBOUND;
        var edgeY = GameMap.getCurrentMap().height - Game.VBOUND + Game.infoBox.height - 5;
        var onlyMap;
        switch (direction) {
            case "LEFT":
                GameMap.offsetX -= GameMap.speed;
                if (GameMap.offsetX < 0) GameMap.offsetX = 0;
                break;
            case "RIGHT":
                GameMap.offsetX += GameMap.speed;
                if (GameMap.offsetX > edgeX) GameMap.offsetX = edgeX;
                break;
            case "TOP":
                GameMap.offsetY -= GameMap.speed;
                if (GameMap.offsetY < 0) GameMap.offsetY = 0;
                break;
            case "BOTTOM":
                GameMap.offsetY += GameMap.speed;
                if (GameMap.offsetY > edgeY) GameMap.offsetY = edgeY;
                break;
            case "MAP":
                onlyMap = true;
                break;
        }
        GameMap.draw();
        //Need re-calculate fog when screen moves
        if (!onlyMap) GameMap.refreshFog();
    },
    refreshMiniMap: function () {
        //Selected map size
        var mapWidth = GameMap.getCurrentMap().width;
        var mapHeight = GameMap.getCurrentMap().height;
        //Clear mini-map
        GameMap.miniCxt.clearRect(0, 0, 130, 130);
        //Re-draw mini-map points
        var miniX, miniY, rectSize;
        Building.allBuildings.concat(Unit.allUnits).forEach(function (chara) {
            miniX = (130 * chara.x / mapWidth) >> 0;
            miniY = (130 * chara.y / mapHeight) >> 0;
            GameMap.miniCxt.fillStyle = (chara.isEnemy) ? 'red' : 'lime';
            rectSize = (chara instanceof Building) ? 4 : 3;
            GameMap.miniCxt.fillRect(miniX, miniY, rectSize, rectSize);
        });
        //Re-draw fog on mini-map
        GameMap.drawMiniFog();
        //Re-draw inside stroke
        GameMap.miniCxt.strokeStyle = 'white';
        GameMap.miniCxt.lineWidth = 2;
        GameMap.miniCxt.strokeRect((130 * GameMap.offsetX / mapWidth) >> 0, (130 * GameMap.offsetY / mapHeight) >> 0, GameMap.insideStroke.width, GameMap.insideStroke.height);
    },
    clickHandler: function (event) {
        //Mouse at (clickX,clickY)
        var clickX = event.pageX - $('canvas[name="mini_map"]').offset().left;
        var clickY = event.pageY - $('canvas[name="mini_map"]').offset().top;
        //Relocate map center
        GameMap.relocateAt(GameMap.getCurrentMap().width * clickX / 130, GameMap.getCurrentMap().height * clickY / 130);
    },
    dblClickHandler: function (event) {
        //Mouse at (clickX,clickY)
        var clickX = event.pageX - $('canvas[name="mini_map"]').offset().left;
        var clickY = event.pageY - $('canvas[name="mini_map"]').offset().top;
        //Map (clickX,clickY) to position (mapX,mapY) on map
        var mapX = GameMap.getCurrentMap().width * clickX / 130;
        var mapY = GameMap.getCurrentMap().height * clickY / 130;
        //Move selected units to (mapX,mapY)
        Unit.allOurUnits().filter(function (chara) {
            return chara.selected;
        }).forEach(function (chara) {
            if (chara.attack) chara.stopAttack();
            chara.targetLock = true;
            chara.moveTo(mapX, mapY);
        });
    },
    relocateAt: function (centerX, centerY) {
        //Get map edge
        var edgeX = GameMap.getCurrentMap().width - Game.HBOUND;
        var edgeY = GameMap.getCurrentMap().height - Game.VBOUND + Game.infoBox.height - 5;
        //Map (centerX,centerY) to position (offsetX,offsetY) on top-left in map
        var offsetX = (centerX - Game.HBOUND / 2) >> 0;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > edgeX) offsetX = edgeX;
        var offsetY = (centerY - (Game.VBOUND - Game.infoBox.height + 5) / 2) >> 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetY > edgeY) offsetY = edgeY;
        //Relocate map
        GameMap.offsetX = offsetX;
        GameMap.offsetY = offsetY;
        GameMap.needRefresh = true;//For synchronize
    }
};

GameMap._resourceCache = {};
GameMap._mapScanCache = {};
GameMap._spawnedResourceIndex = {};
GameMap._clearMapResources = function () {
    var isRes = function (chara) {
        return Boolean(chara && chara._isMapResource);
    };
    var removeFrom = function (arr) {
        if (!arr || !arr.length) return;
        for (var i = arr.length - 1; i >= 0; i--) {
            if (isRes(arr[i])) arr.splice(i, 1);
        }
    };
    if (typeof Unit !== 'undefined' && Unit) {
        removeFrom(Unit.allUnits);
        removeFrom(Unit.ourGroundUnits);
        removeFrom(Unit.enemyGroundUnits);
        removeFrom(Unit.ourFlyingUnits);
        removeFrom(Unit.enemyFlyingUnits);
    }
    if (typeof Game !== 'undefined' && Game) {
        if (Game.selectedUnit && isRes(Game.selectedUnit)) Game.changeSelectedTo({});
        if (Game.allSelected && Game.allSelected.length) {
            for (var i = Game.allSelected.length - 1; i >= 0; i--) {
                if (isRes(Game.allSelected[i])) Game.allSelected.splice(i, 1);
            }
        }
    }
};

GameMap._getMapScan = function () {
    var map = GameMap.getCurrentMap();
    if (!map || !map.width || !map.height) return null;
    var mapName = GameMap.currentMap;
    var cached = GameMap._mapScanCache[mapName];
    if (cached && cached.mapW === map.width && cached.mapH === map.height && cached.factor) return cached;

    var maxDim = Math.max(map.width, map.height);
    var factor = Math.max(1, Math.ceil(maxDim / 512));
    var w = (map.width / factor) >> 0;
    var h = (map.height / factor) >> 0;
    if (w < 2 || h < 2) return null;

    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    try {
        ctx.drawImage(map, 0, 0, w, h);
    } catch (e) {
        return null;
    }
    var data;
    try {
        data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
        return null;
    }
    cached = { factor: factor, w: w, h: h, data: data, mapW: map.width, mapH: map.height };
    GameMap._mapScanCache[mapName] = cached;
    return cached;
};

GameMap._isMineralPixel = function (r, g, b) {
    if (b < 110) return false;
    if (b < g + 5) return false;
    if (b < r + 35) return false;
    if (g < 50) return false;
    return true;
};

GameMap._spawnMineralAt = function (cx, cy, bw, bh) {
    if (typeof Neutral === 'undefined' || !Neutral || !Neutral.Mineral) return null;
    var w = Math.max(30, Math.min(80, bw || 60));
    var h = Math.max(30, Math.min(80, bh || 60));
    var mineral = new Neutral.Mineral({ x: (cx - w / 2) >> 0, y: (cy - h / 2) >> 0 });
    mineral.width = w;
    mineral.height = h;
    mineral.noRender = true;
    mineral._isMapResource = true;
    mineral.selected = false;
    mineral.includePoint = function () { return false; };
    mineral.include = function () { return false; };
    mineral.stop();
    mineral.dock();
    return mineral;
};

GameMap._findMineralClusterNear = function (worldX, worldY) {
    var scan = GameMap._getMapScan();
    if (!scan) return null;
    var factor = scan.factor;
    var w = scan.w, h = scan.h, data = scan.data;
    var sx = (worldX / factor) >> 0;
    var sy = (worldY / factor) >> 0;
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return null;

    var radius = 12;
    var minX = Math.max(0, sx - radius);
    var maxX = Math.min(w - 1, sx + radius);
    var minY = Math.max(0, sy - radius);
    var maxY = Math.min(h - 1, sy + radius);
    var count = 0, sumX = 0, sumY = 0, bx0 = maxX, bx1 = minX, by0 = maxY, by1 = minY;
    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            var i = (y * w + x) << 2;
            var r = data[i], g = data[i + 1], b = data[i + 2];
            if (!GameMap._isMineralPixel(r, g, b)) continue;
            count++;
            sumX += x;
            sumY += y;
            if (x < bx0) bx0 = x;
            if (x > bx1) bx1 = x;
            if (y < by0) by0 = y;
            if (y > by1) by1 = y;
        }
    }
    if (count < 10) return null;
    var bwPx = bx1 - bx0 + 1;
    var bhPx = by1 - by0 + 1;
    if (bwPx > 28 || bhPx > 28) return null;
    var density = count / (bwPx * bhPx);
    if (density < 0.08) return null;
    var cx = ((sumX / count) + 0.5) * factor;
    var cy = ((sumY / count) + 0.5) * factor;
    var bw = (bx1 - bx0 + 1) * factor;
    var bh = (by1 - by0 + 1) * factor;
    return { x: cx, y: cy, w: bw, h: bh };
};

GameMap._spawnMineralNear = function (worldX, worldY) {
    if (typeof Unit !== 'undefined' && Unit && Unit.allUnits && Unit.allUnits.length) {
        var existing = Unit.allUnits.filter(function (u) {
            return u && u._isMapResource && (typeof Neutral !== 'undefined' && u instanceof Neutral.Mineral);
        }).sort(function (a, b) {
            var dax = worldX - a.posX(), day = worldY - a.posY();
            var dbx = worldX - b.posX(), dby = worldY - b.posY();
            return dax * dax + day * day - (dbx * dbx + dby * dby);
        })[0];
        if (existing) {
            var dx = worldX - existing.posX(), dy = worldY - existing.posY();
            if (dx * dx + dy * dy < 70 * 70) return existing;
        }
    }
    var cluster = GameMap._findMineralClusterNear(worldX, worldY);
    if (!cluster) return null;
    var mapName = GameMap.currentMap;
    var idx = GameMap._spawnedResourceIndex[mapName];
    if (!idx) idx = GameMap._spawnedResourceIndex[mapName] = {};
    var key = ((cluster.x / 8) >> 0) + ',' + ((cluster.y / 8) >> 0);
    if (idx[key]) return null;
    idx[key] = true;
    return GameMap._spawnMineralAt(cluster.x, cluster.y, cluster.w, cluster.h);
};

GameMap._spawnMapResources = function () {
    var map = GameMap.getCurrentMap();
    if (!map || !map.width || !map.height) return;
    var mapName = GameMap.currentMap;
    var cached = GameMap._resourceCache[mapName];
    if (!cached) {
        var scan = GameMap._getMapScan();
        if (!scan) return;
        var factor = scan.factor, w = scan.w, h = scan.h, data = scan.data;
        var size = w * h;
        var mask = new Uint8Array(size);
        for (var p = 0, i = 0; p < size; p++, i += 4) {
            if (GameMap._isMineralPixel(data[i], data[i + 1], data[i + 2])) mask[p] = 1;
        }
        var visited = new Uint8Array(size);
        var queue = new Int32Array(size);
        var nodes = [];
        for (var start = 0; start < size; start++) {
            if (!mask[start] || visited[start]) continue;
            var qh = 0, qt = 0;
            queue[qt++] = start;
            visited[start] = 1;
            var count = 0, sumX = 0, sumY = 0;
            var minX = w, maxX = 0, minY = h, maxY = 0;
            while (qh < qt) {
                var cur = queue[qh++];
                var cx = cur % w;
                var cy = (cur / w) >> 0;
                count++;
                sumX += cx;
                sumY += cy;
                if (cx < minX) minX = cx;
                if (cx > maxX) maxX = cx;
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;
                var left = cur - 1;
                if (cx > 0 && mask[left] && !visited[left]) { visited[left] = 1; queue[qt++] = left; }
                var right = cur + 1;
                if (cx < w - 1 && mask[right] && !visited[right]) { visited[right] = 1; queue[qt++] = right; }
                var up = cur - w;
                if (cy > 0 && mask[up] && !visited[up]) { visited[up] = 1; queue[qt++] = up; }
                var down = cur + w;
                if (cy < h - 1 && mask[down] && !visited[down]) { visited[down] = 1; queue[qt++] = down; }
            }
            var bw = maxX - minX + 1;
            var bh = maxY - minY + 1;
            if (count < 14) continue;
            if (bw > 120 || bh > 120) continue;
            var density = count / (bw * bh);
            if (density < 0.06) continue;
            var centerX = ((sumX / count) + 0.5) * factor;
            var centerY = ((sumY / count) + 0.5) * factor;
            var ow = Math.max(30, Math.min(80, bw * factor));
            var oh = Math.max(30, Math.min(80, bh * factor));
            nodes.push({ x: centerX, y: centerY, w: ow, h: oh });
        }
        nodes.sort(function (a, b) {
            return a.x - b.x;
        });
        var pruned = [];
        var minDist = 50;
        var minDist2 = minDist * minDist;
        for (var k = 0; k < nodes.length; k++) {
            var n = nodes[k];
            var ok = true;
            for (var j = pruned.length - 1; j >= 0 && j > pruned.length - 16; j--) {
                var p = pruned[j];
                var dx = n.x - p.x, dy = n.y - p.y;
                if (dx * dx + dy * dy < minDist2) { ok = false; break; }
            }
            if (ok) pruned.push(n);
        }
        cached = pruned;
        GameMap._resourceCache[mapName] = cached;
    }
    GameMap._spawnedResourceIndex[mapName] = {};
    for (var i = 0; i < cached.length; i++) {
        var n = cached[i];
        var key = ((n.x / 8) >> 0) + ',' + ((n.y / 8) >> 0);
        GameMap._spawnedResourceIndex[mapName][key] = true;
        GameMap._spawnMineralAt(n.x, n.y, n.w, n.h);
    }
};
