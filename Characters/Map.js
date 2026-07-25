import _$ from '../Utils/gFrame/core.js';
import '../Utils/gFrame/utils.js';
import sourceLoader from '../Utils/sourceLoader.js';
import Unit from './Units/core/UnitBase.js';
import Building from './Buildings/core/BuildingBase.js';
import Burst from './Bursts/core/BurstBase.js';
import Animation from './Animations/core/AnimationBase.js';
import Neutral from './Breeds/Neutral.js';
import Game from '../GameRule/Games/core/GameBase.js';

class GameMapClass {
    constructor() {
        this.currentMap = 'Switchback'; //By default
        this.offsetX = 0;
        this.offsetY = 0;
        this.speed = 40;
        this.triggerMargin = 20;
        //To synchronize drawing map and units, will not refresh immediately
        this.needRefresh = false;
        this.fogFlag = true;
        this.fogType = true; //If true using gradient shadow, if false use 3 circles

        // Ensure DOM element exists or handle potential null
        const miniMapCanvas = $('canvas[name="mini_map"]')[0];
        this.miniCxt = miniMapCanvas ? miniMapCanvas.getContext('2d') : null;

        this.fogCanvas = document.createElement('canvas');
        this.miniFogCanvas = document.createElement('canvas');
        this.shadowCanvas = document.createElement('canvas'); //Pre-render for fog shadow
        this.insideStroke = {
            width: 0,
            height: 0
        };

        // Cache properties
        this._resourceCache = {};
        this._mapScanCache = {};
        this._spawnedResourceIndex = {};

        // Init explored map properties
        this.exploredW = 0;
        this.exploredH = 0;
        this.explored = null;

        // Dynamic speed property used in mouseController
        this._dynamicSpeed = undefined;

        // Last ping time for minimap
        this.lastPingTime = 0;
        this.pingLocation = { x: 0, y: 0 };

        // Rect property seems to be expected, initialize it
        this.rect = { width: 0, height: 0 };
        // Contexts for drawing
        this.bgCxt = null;
        this.showGrid = false;
    }

    //Init map
    setCurrentMap(name) {
        this.currentMap = name;
        $('canvas[name="mini_map"]').attr('class', name);
        //Init fog relative (will update size if map loaded)
        this.fogCanvas.width = 130;
        this.fogCanvas.height = 130;
        this.fogCanvas.ratio = 130 / 2048;
        this.fogCxt = this.fogCanvas.getContext('2d');
        this.miniFogCanvas.width = this.miniFogCanvas.height = 130;
        this.miniFogCxt = this.miniFogCanvas.getContext('2d');
        this.shadowCanvas.width = this.shadowCanvas.height = 100;
        this.shadowCxt = this.shadowCanvas.getContext('2d');
        //Prepared fog shadow for quick render
        const radial = this.shadowCxt.createRadialGradient(50, 50, 25, 50, 50, 50);
        radial.addColorStop(0, 'rgba(0,0,0,1)');
        radial.addColorStop(1, 'rgba(0,0,0,0)');
        this.shadowCxt.fillStyle = radial;
        this.shadowCxt.beginPath();
        this.shadowCxt.arc(50, 50, 50, 0, Math.PI * 2);
        this.shadowCxt.fill();
        this._clearMapResources();
        this._spawnMapResources();
        //Init map-dependent values only if map is loaded
        const map = sourceLoader.sources['Map_' + this.currentMap];
        if (map && map.width && map.height) {
            this.fogCanvas.width = 130;
            this.fogCanvas.height = Math.round(130 * map.height / map.width);
            this.fogCanvas.ratio = 130 / map.width;

            //Init inside stroke size
            this.insideStroke.width = (130 * Game.HBOUND / map.width) >> 0;
            this.insideStroke.height = (130 * Game.VBOUND / map.height) >> 0;
            //Init explored map (32x32 tiles)
            this.exploredW = (map.width / 32) >> 0;
            this.exploredH = (map.height / 32) >> 0;
            this.explored = new Uint8Array(this.exploredW * this.exploredH);
        } else {
            // Map not loaded yet, will be initialized when loaded
            this.insideStroke.width = 0;
            this.insideStroke.height = 0;
            this.exploredW = 0;
            this.exploredH = 0;
            this.explored = null;
        }
    }

    markExplored(x, y, sight) {
        if (!this.explored) return;
        const r = (sight / 32) >> 0;
        const cx = (x / 32) >> 0;
        const cy = (y / 32) >> 0;
        for (let i = cx - r; i <= cx + r; i++) {
            for (let j = cy - r; j <= cy + r; j++) {
                if (i >= 0 && i < this.exploredW && j >= 0 && j < this.exploredH) {
                    if ((i - cx) * (i - cx) + (j - cy) * (j - cy) <= r * r) {
                        this.explored[j * this.exploredW + i] = 1;
                    }
                }
            }
        }
    }

    getCurrentMap() {
        const map = sourceLoader.sources['Map_' + this.currentMap];
        // Return default values if map not loaded yet
        if (!map) {
            return { width: 2048, height: 2048 };
        }
        return map;
    }

    refreshFog() {
        if (this.fogFlag && this.fogCxt && this.miniFogCxt) {
            const mapImg = sourceLoader.sources['Map_' + this.currentMap];
            if (!this.explored && mapImg && mapImg.width) {
                this.setCurrentMap(this.currentMap);
                const all = (typeof Unit !== 'undefined' && Unit.allUnits ? Unit.allUnits : []).concat(typeof Building !== 'undefined' && Building.allBuildings ? Building.allBuildings : []);
                all.forEach(u => {
                    if (u && u.status !== 'dead') {
                        const sight = (typeof u.get === 'function') ? u.get('sight') : (u.sight || 150);
                        this.markExplored(u.posX(), u.posY(), sight);
                    }
                });
            }

            const ctx = this.fogCxt;
            const mCtx = this.miniFogCxt;
            const ratio = this.fogCanvas.ratio || (130 / 2048);

            // Reset composite operation
            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'source-over';

            // 1. Fill with black (Unexplored)
            ctx.fillStyle = mCtx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
            mCtx.fillRect(0, 0, 130, 130);

            // 2. Draw Explored areas as Grey (using destination-out with 0.5 alpha)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,0.5)';

            if (this.explored) {
                let worldX, worldY;
                for (let j = 0; j < this.exploredH; j++) {
                    for (let i = 0; i < this.exploredW; i++) {
                        if (this.explored[j * this.exploredW + i]) {
                            worldX = i << 5; // * 32
                            worldY = j << 5; // * 32
                            ctx.fillRect(Math.round(worldX * ratio), Math.round(worldY * ratio), Math.round(32 * ratio) || 1, Math.round(32 * ratio) || 1);
                        }
                    }
                }
            }

            // 3. Clear visible area (Visible)
            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = mCtx.fillStyle = 'rgba(0,0,0,1)'; // Full transparency

            const ourUnits = Unit.allOurUnits().concat(Building.ourBuildings);
            const parasitedEnemies = Unit.allEnemyUnits().filter(chara => chara.buffer.Parasite);
            const scannerSweeps = Burst.allEffects.filter(anime => Animation.getName(anime) == "ScannerSweep");
            const revealedEnemies = Unit.allEnemyUnits().concat(Building.enemyBuildings).filter(chara => {
                if (chara.status == 'dead') return false;
                const now = (window.performance && performance.now) ? performance.now() : Date.now();
                if (chara._revealedUntil && now < chara._revealedUntil) return true;
                if (chara._lastAttackAt && now - chara._lastAttackAt < 3000) return true;
                return false;
            });
            const addInObjs = parasitedEnemies.concat(scannerSweeps).concat(revealedEnemies);

            // Precalculate enemy visibility based on fog update state to prevent disappearing/flickering
            const allEnemies = Unit.allEnemyUnits().concat(Building.enemyBuildings);
            allEnemies.forEach(enemy => {
                enemy._visibleBySight = false;
            });

            ourUnits.concat(addInObjs).forEach(chara => {
                if (chara.status != 'dead') {
                    const sight = (typeof chara.get === 'function') ? chara.get('sight') : (chara.sight || 150);
                    // Mark explored for all units (even off-screen)
                    this.markExplored(chara.posX(), chara.posY(), sight);

                    // Update visibility of all enemies within this vision source's range
                    allEnemies.forEach(enemy => {
                        if (!enemy._visibleBySight && enemy.status != 'dead') {
                            const dx = enemy.posX() - chara.posX();
                            const dy = enemy.posY() - chara.posY();
                            if (dx * dx + dy * dy < sight * sight) {
                                enemy._visibleBySight = true;
                            }
                        }
                    });

                    const cx = Math.round(chara.posX() * ratio);
                    const cy = Math.round(chara.posY() * ratio);
                    const radius = Math.round(sight * ratio * 2);

                    ctx.drawImage(this.shadowCanvas, 0, 0, 100, 100, cx - radius, cy - radius, radius << 1, radius << 1);

                    const mx = (chara.posX() * 130 / this.getCurrentMap().width) >> 0;
                    const my = (chara.posY() * 130 / this.getCurrentMap().height) >> 0;
                    const miniSight = (sight * 130 / this.getCurrentMap().height) >> 0;
                    mCtx.beginPath();
                    if (this.fogType) {
                        mCtx.drawImage(this.shadowCanvas, 0, 0, 100, 100, mx - (miniSight << 1), my - (miniSight << 1), miniSight << 2, miniSight << 2);
                    } else {
                        mCtx.arc(mx, my, miniSight, 0, 2 * Math.PI);
                        mCtx.fill();
                    }
                }
            });

            // Explicitly set visibility for parasited/revealed enemies
            parasitedEnemies.forEach(enemy => { enemy._visibleBySight = true; });
            revealedEnemies.forEach(enemy => { enemy._visibleBySight = true; });

            ctx.globalCompositeOperation = mCtx.globalCompositeOperation = 'source-over';
        }
    }

    drawFog() {
        if (this.fogFlag && this.fogCxt) {
            // Update fog data every 10 clocks
            if (Game._clock % 10 == 0) this.refreshFog();
            
            // Draw the visible part of the fog canvas stretched onto frontCxt
            const ratio = this.fogCanvas.ratio || (130 / 2048);
            const sx = Math.round(this.offsetX * ratio);
            const sy = Math.round(this.offsetY * ratio);
            const sw = Math.round(Game.HBOUND * ratio);
            const sh = Math.round(Game.VBOUND * ratio);
            
            Game.frontCxt.drawImage(this.fogCanvas, sx, sy, sw, sh, 0, 0, Game.HBOUND, Game.VBOUND);
        }
    }

    drawMiniFog() {
        if (this.fogFlag && this.miniFogCanvas) {
            // Draw fog on mini-map directly from miniFogCanvas
            this.miniCxt.drawImage(this.miniFogCanvas, 0, 0, this.miniFogCanvas.width, this.miniFogCanvas.height, 0, 0, 130, 130);
        }
    }

    drawMud() {
        // ORIGINAL LOGIC: Creep should be drawn if there are Zerg buildings, regardless of map
        if (!this.bgCxt && Game && Game.backCxt) this.bgCxt = Game.backCxt;
        if (!this.bgCxt) return;

        const mudRadius = 250;
        const mudIncrements = [
            [-mudRadius * 0.4, -mudRadius * 0.4],
            [mudRadius * 0.4, -mudRadius * 0.4],
            [mudRadius * 0.4, mudRadius * 0.4],
            [-mudRadius * 0.4, mudRadius * 0.4]
        ];

        const mudPatternImg = sourceLoader.sources['Mud'];
        if (!mudPatternImg) return;
        const mudPattern = this.bgCxt.createPattern(mudPatternImg, 'repeat');
        this.bgCxt.fillStyle = mudPattern;

        // Zerg buildings that produce creep
        const creepProducers = ['Hatchery', 'Lair', 'Hive', 'CreepColony', 'SunkenColony', 'SporeColony'];

        Building.allBuildings.forEach(b => {
            if (creepProducers.includes(b.name) && b.status != 'dead') {
                const centerX = (b.posX() - this.offsetX) >> 0;
                const centerY = (b.posY() - this.offsetY) >> 0;

                // Frustum culling for performance
                if (centerX < -mudRadius || centerX > Game.HBOUND + mudRadius ||
                    centerY < -mudRadius || centerY > Game.VBOUND + mudRadius) return;

                this.bgCxt.beginPath();
                const pos = [centerX, centerY]; // Start from center
                this.bgCxt.arc(centerX, centerY, mudRadius, 0, Math.PI * 2);
                this.bgCxt.fill();
            }
        });
    }

    hasCreep(x, y) {
        // ORIGINAL LOGIC: Creep works on any map where Zerg buildings are present
        const mudRadius = 250; // Match drawMud radius
        let dx, dy;
        return Building.allBuildings.some(b => {
            // Redundant check but safe
            if (b.name != 'Hatchery' && b.name != 'Lair' && b.name != 'Hive' && b.name != 'CreepColony' && b.name != 'SunkenColony' && b.name != 'SporeColony') return false;
            if (b.status == 'dead') return false;
            dx = x - b.posX();
            dy = y - b.posY();
            return dx * dx + dy * dy < mudRadius * mudRadius;
        });
    }

    isUnitVisibleToPlayer(chara) {
        try {
            if (!chara) return true;
            if (!chara.isEnemy) return true;
            if (!this.fogFlag) return true;

            // Use the precalculated sight visibility flag updated in refreshFog()
            if (chara._visibleBySight !== undefined) {
                if (chara._visibleBySight) return true;
            } else {
                // Fallback to real-time canSee on the very first frames before refreshFog has run
                const ourUnits = (typeof Unit !== 'undefined' && Unit && Unit.allOurUnits) ? Unit.allOurUnits() : [];
                const ourBuildings = (typeof Building !== 'undefined' && Building && Building.ourBuildings) ? Building.ourBuildings : [];
                for (const unit of ourUnits.concat(ourBuildings)) {
                    if (unit && unit.status != 'dead' && typeof unit.canSee === 'function' && unit.canSee(chara)) {
                        return true;
                    }
                }
            }

            // Fallback for real-time attack detection (so they reveal immediately when attacking)
            if (typeof chara.isAttacking === 'function' && chara.isAttacking()) return true;
            if (chara.status === 'attack') return true;
            if (chara.bullet) return true;

            if (chara._revealedUntil) {
                const now = (typeof window !== 'undefined' && window.performance && performance.now) ? performance.now() : Date.now();
                if (now < chara._revealedUntil) {
                    return true;
                }
            }

            if (chara._lastAttackAt) {
                const now = (typeof window !== 'undefined' && window.performance && performance.now) ? performance.now() : Date.now();
                if (now - chara._lastAttackAt < 3000) {
                    return true;
                }
            }

            return false;
        } catch (e) {
            return true;
        }
    }

    revealUnitTemporarily(chara, duration) {
        if (!chara || !chara.isEnemy) return;
        const now = (window.performance && performance.now) ? performance.now() : Date.now();
        chara._revealedUntil = now + (duration || 3000);
    }

    refresh(step) {
        this.bgCxt = (Game && Game.backCxt) || (Game && Game.cxt);
        if (!this.bgCxt) return;
        if (!this.rect || !this.rect.width) {
            this.rect = { width: Game.HBOUND || innerWidth, height: Game.VBOUND || innerHeight };
        }
        const mapImg = sourceLoader.sources['Map_' + this.currentMap];
        if (!mapImg) return;

        // Fix: InvalidStateError check
        if (mapImg instanceof HTMLImageElement) {
            if (!mapImg.complete) return;
            if (mapImg.naturalWidth === 0) return;
        }

        try {
            this.bgCxt.drawImage(mapImg, this.offsetX, this.offsetY, this.rect.width, this.rect.height, 0, 0, this.rect.width, this.rect.height);
        } catch (e) {
            // Ignore draw error if image state is invalid
        }

        const edgeX = this.offsetX % 32;
        const edgeY = this.offsetY % 32;

        if (this.showGrid) {
            this.bgCxt.save();
            this.bgCxt.strokeStyle = "rgba(255,255,255,0.2)";
            this.bgCxt.lineWidth = 1;
            this.bgCxt.beginPath();
            for (let i = 0; i < this.rect.width / 32; i++) {
                this.bgCxt.moveTo(i * 32 - edgeX, 0);
                this.bgCxt.lineTo(i * 32 - edgeX, this.rect.height);
            }
            for (let j = 0; j < this.rect.height / 32; j++) {
                this.bgCxt.moveTo(0, j * 32 - edgeY);
                this.bgCxt.lineTo(this.rect.width, j * 32 - edgeY);
            }
            this.bgCxt.stroke();
            this.bgCxt.restore();
        }
        this.drawMud();
        this.refreshFog();
        this.refreshMiniMap();
    }

    refreshMiniMap() {
        if (!this.miniCxt) return;
        try {
            const mapImg = sourceLoader.sources['Map_' + this.currentMap];
            // Check if map image is loaded and valid
            if (!mapImg || !(mapImg instanceof HTMLImageElement) || !mapImg.complete || mapImg.naturalWidth === 0) {
                // Map not loaded yet, just clear the minimap
                this.miniCxt.clearRect(0, 0, 130, 130);
                return;
            }
            const mapWidth = mapImg.width;
            const mapHeight = mapImg.height;
            let miniX = (this.offsetX * 130 / mapWidth) >> 0;
            let miniY = (this.offsetY * 130 / mapHeight) >> 0;
            let rectSize = (this.rect.width * 130 / mapWidth) >> 0; //Square viewport
            
            // 1. Clear minimap
            this.miniCxt.clearRect(0, 0, 130, 130);
            
            // 2. Draw map background
            this.miniCxt.drawImage(mapImg, 0, 0, mapWidth, mapHeight, 0, 0, 130, 130);

            // 3. Draw units and buildings as dots
            const mapW = this.getCurrentMap().width;
            const mapH = this.getCurrentMap().height;
            Unit.allUnits.concat(Building.allBuildings).forEach(chara => {
                if (chara.status != 'dead' && (chara.isEnemy == false || !this.fogFlag || this.isUnitVisibleToPlayer(chara))) {
                    const mx = (chara.posX() * 130 / mapW) >> 0;
                    const my = (chara.posY() * 130 / mapH) >> 0;
                    this.miniCxt.fillStyle = chara.isEnemy ? "red" : (chara.isNeutral ? "yellow" : "rgb(0, 150, 255)");
                    this.miniCxt.fillRect(mx - 1, my - 1, 2, 2);
                }
            });

            // 4. Draw fog on mini-map
            this.drawMiniFog();

            // 5. Draw viewport rect
            this.miniCxt.strokeStyle = "white";
            this.miniCxt.lineWidth = 1;
            this.miniCxt.strokeRect(miniX, miniY, rectSize, (rectSize * this.rect.height / this.rect.width) >> 0);

            // 6. Draw Minimap notification ping
            const now = Date.now();
            if (now - this.lastPingTime < 3000) {
                const ping = (now - this.lastPingTime) / 1000; //0-3
                const px = (this.pingLocation.x * 130 / mapWidth) >> 0;
                const py = (this.pingLocation.y * 130 / mapHeight) >> 0;
                const pulse = Math.abs(Math.sin(ping * Math.PI * 2)); //0-1-0
                const radius = 10 + pulse * 10;
                this.miniCxt.strokeStyle = "rgba(255,0,0," + (1 - ping / 3) + ")";
                this.miniCxt.beginPath();
                this.miniCxt.arc(px, py, radius, 0, Math.PI * 2);
                this.miniCxt.stroke();
            }
        } catch (e) {
            this.miniCxt.clearRect(0, 0, 130, 130);
        }
    }

    clickHandler(event) {
        const $canvas = $('canvas[name="mini_map"]');
        const offset = $canvas.offset();
        const clickX = event.pageX - offset.left;
        const clickY = event.pageY - offset.top;
        //Relocate map center
        this.relocateAt(this.getCurrentMap().width * clickX / 130, this.getCurrentMap().height * clickY / 130);
    }

    dblClickHandler(event) {
        const $canvas = $('canvas[name="mini_map"]');
        const offset = $canvas.offset();
        const clickX = event.pageX - offset.left;
        const clickY = event.pageY - offset.top;
        //Map (clickX,clickY) to position (mapX,mapY) on map
        const mapX = this.getCurrentMap().width * clickX / 130;
        const mapY = this.getCurrentMap().height * clickY / 130;
        //Move selected units to (mapX,mapY)
        Unit.allOurUnits().filter(chara => chara.selected).forEach(chara => {
            if (chara.attack) chara.stopAttack();
            chara.targetLock = true;
            chara.moveTo(mapX, mapY);
        });
    }

    relocateAt(x, y) {
        //Boundary check
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > this.getCurrentMap().width - this.rect.width) x = this.getCurrentMap().width - this.rect.width;
        if (y > this.getCurrentMap().height - this.rect.height) y = this.getCurrentMap().height - this.rect.height;
        this.offsetX = x;
        this.offsetY = y;
        const edgeX = this.offsetX % 32;
        const edgeY = this.offsetY % 32;
        //Update offset for all canvas layers
        $('#game').css('background-position', (-edgeX) + 'px ' + (-edgeY) + 'px');
    }

    _clearMapResources() {
        const isRes = chara => Boolean(chara && chara._isMapResource);
        const removeFrom = arr => {
            if (!arr || !arr.length) return;
            for (let i = arr.length - 1; i >= 0; i--) {
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
        if (Game) {
            if (Game.selectedUnit && isRes(Game.selectedUnit)) Game.changeSelectedTo({});
            if (Game.allSelected && Game.allSelected.length) {
                for (let i = Game.allSelected.length - 1; i >= 0; i--) {
                    if (isRes(Game.allSelected[i])) Game.allSelected.splice(i, 1);
                }
            }
        }
    }

    _getMapScan(maxDimOverride) {
        const map = this.getCurrentMap();
        if (!map || !map.width || !map.height) return null;
        const mapName = this.currentMap;
        const cacheKey = mapName + ':' + (maxDimOverride || 'auto');
        let cached = this._mapScanCache[cacheKey];
        if (cached && cached.mapW === map.width && cached.mapH === map.height && cached.factor) return cached;

        const maxDim = maxDimOverride || Math.max(map.width, map.height);
        const factor = Math.max(1, Math.ceil(maxDim / 512));
        const w = (map.width / factor) >> 0;
        const h = (map.height / factor) >> 0;
        if (w < 2 || h < 2) return null;

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        try {
            ctx.drawImage(map, 0, 0, w, h);
        } catch (e) {
            return null;
        }
        let data;
        try {
            data = ctx.getImageData(0, 0, w, h).data;
        } catch (e) {
            return null;
        }
        cached = {
            factor: factor,
            w: w,
            h: h,
            data: data,
            mapW: map.width,
            mapH: map.height
        };
        this._mapScanCache[cacheKey] = cached;
        return cached;
    }

    _isMineralPixel(r, g, b) {
        if (b < 110) return false;
        if (b < g + 5) return false;
        if (b < r + 35) return false;
        if (g < 50) return false;
        return true;
    }

    _isGasPixel(r, g, b) {
        if (g < 120) return false;
        if (g < r + 15) return false;
        if (g < b + 15) return false;
        return true;
    }

    _spawnMineralAt(cx, cy, bw, bh) {
        if (typeof Neutral === 'undefined' || !Neutral || !Neutral.Mineral) return null;
        const w = Math.max(30, Math.min(80, bw || 60));
        const h = Math.max(30, Math.min(80, bh || 60));
        const mineral = new Neutral.Mineral({
            x: (cx - w / 2) >> 0,
            y: (cy - h / 2) >> 0
        });
        mineral.width = w;
        mineral.height = h;
        mineral.noRender = true;
        mineral._isMapResource = true;
        mineral.selected = false;
        mineral.includePoint = () => false;
        mineral.include = () => false;
        mineral.stop();
        mineral.dock();
        return mineral;
    }

    _spawnGasAt(cx, cy, bw, bh) {
        if (typeof Neutral === 'undefined' || !Neutral || !Neutral.GasGeyser) return null;
        const w = Math.max(60, Math.min(120, bw || 96));
        const h = Math.max(60, Math.min(120, bh || 96));
        const geyser = new Neutral.GasGeyser({
            x: (cx - w / 2) >> 0,
            y: (cy - h / 2) >> 0
        });
        geyser.width = w;
        geyser.height = h;
        geyser.noRender = true;
        geyser._isMapResource = true;
        geyser.selected = false;
        geyser.includePoint = () => false;
        geyser.include = () => false;
        geyser.stop();
        geyser.dock();
        return geyser;
    }

    _findMineralClusterNear(worldX, worldY) {
        const scan = this._getMapScan();
        if (!scan) return null;
        const factor = scan.factor;
        const w = scan.w;
        const h = scan.h;
        const data = scan.data;
        const sx = (worldX / factor) >> 0;
        const sy = (worldY / factor) >> 0;
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) return null;

        const radius = 12;
        const minX = Math.max(0, sx - radius);
        const maxX = Math.min(w - 1, sx + radius);
        const minY = Math.max(0, sy - radius);
        const maxY = Math.min(h - 1, sy + radius);
        let count = 0,
            sumX = 0,
            sumY = 0,
            bx0 = maxX,
            bx1 = minX,
            by0 = maxY,
            by1 = minY;
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const i = (y * w + x) << 2;
                const r = data[i],
                    g = data[i + 1],
                    b = data[i + 2];
                if (!this._isMineralPixel(r, g, b)) continue;
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
        const bwPx = bx1 - bx0 + 1;
        const bhPx = by1 - by0 + 1;
        if (bwPx > 28 || bhPx > 28) return null;
        const density = count / (bwPx * bhPx);
        if (density < 0.08) return null;
        const cx = ((sumX / count) + 0.5) * factor;
        const cy = ((sumY / count) + 0.5) * factor;
        const bw = (bx1 - bx0 + 1) * factor;
        const bh = (by1 - by0 + 1) * factor;
        return {
            x: cx,
            y: cy,
            w: bw,
            h: bh
        };
    }

    _spawnMineralNear(worldX, worldY) {
        if (typeof Unit !== 'undefined' && Unit && Unit.allUnits && Unit.allUnits.length) {
            const existing = Unit.allUnits.filter(u => {
                return u && u._isMapResource && (typeof Neutral !== 'undefined' && u instanceof Neutral.Mineral);
            }).sort((a, b) => {
                const dax = worldX - a.posX(),
                    day = worldY - a.posY();
                const dbx = worldX - b.posX(),
                    dby = worldY - b.posY();
                return dax * dax + day * day - (dbx * dbx + dby * dby);
            })[0];
            if (existing) {
                const dx = worldX - existing.posX(),
                    dy = worldY - existing.posY();
                if (dx * dx + dy * dy < 70 * 70) return existing;
            }
        }
        const cluster = this._findMineralClusterNear(worldX, worldY);
        if (!cluster) return null;
        const mapName = this.currentMap;
        let idx = this._spawnedResourceIndex[mapName];
        if (!idx) idx = this._spawnedResourceIndex[mapName] = {};
        const key = ((cluster.x / 8) >> 0) + ',' + ((cluster.y / 8) >> 0);
        if (idx[key]) return null;
        idx[key] = true;
        return this._spawnMineralAt(cluster.x, cluster.y, cluster.w, cluster.h);
    }

    _spawnMapResources() {
        const map = this.getCurrentMap();
        if (!map || !map.width || !map.height) return;
        const mapName = this.currentMap;
        let cached = this._resourceCache[mapName];
        if (!cached) {
            const scan = this._getMapScan();
            if (!scan) return;
            const buildNodes = (isPixel, scanData) => {
                if (!scanData) return [];
                const factor = scanData.factor,
                    w = scanData.w,
                    h = scanData.h,
                    data = scanData.data;
                const size = w * h;
                const queue = new Int32Array(size);
                const mask = new Uint8Array(size);
                for (let p = 0, i = 0; p < size; p++, i += 4) {
                    if (isPixel(data[i], data[i + 1], data[i + 2])) mask[p] = 1;
                }
                const visited = new Uint8Array(size);
                const nodes = [];
                for (let start = 0; start < size; start++) {
                    if (!mask[start] || visited[start]) continue;
                    let qh = 0,
                        qt = 0;
                    queue[qt++] = start;
                    visited[start] = 1;
                    let count = 0,
                        sumX = 0,
                        sumY = 0;
                    let minX = w,
                        maxX = 0,
                        minY = h,
                        maxY = 0;
                    while (qh < qt) {
                        const cur = queue[qh++];
                        const cx = cur % w;
                        const cy = (cur / w) >> 0;
                        count++;
                        sumX += cx;
                        sumY += cy;
                        if (cx < minX) minX = cx;
                        if (cx > maxX) maxX = cx;
                        if (cy < minY) minY = cy;
                        if (cy > maxY) maxY = cy;
                        const left = cur - 1;
                        if (cx > 0 && mask[left] && !visited[left]) {
                            visited[left] = 1;
                            queue[qt++] = left;
                        }
                        const right = cur + 1;
                        if (cx < w - 1 && mask[right] && !visited[right]) {
                            visited[right] = 1;
                            queue[qt++] = right;
                        }
                        const up = cur - w;
                        if (cy > 0 && mask[up] && !visited[up]) {
                            visited[up] = 1;
                            queue[qt++] = up;
                        }
                        const down = cur + w;
                        if (cy < h - 1 && mask[down] && !visited[down]) {
                            visited[down] = 1;
                            queue[qt++] = down;
                        }
                    }
                    const bw = maxX - minX + 1;
                    const bh = maxY - minY + 1;
                    if (count < 14) continue;
                    if (bw > 120 || bh > 120) continue;
                    const density = count / (bw * bh);
                    if (density < 0.06) continue;
                    const centerX = ((sumX / count) + 0.5) * factor;
                    const centerY = ((sumY / count) + 0.5) * factor;
                    const ow = Math.max(30, Math.min(80, bw * factor));
                    const oh = Math.max(30, Math.min(80, bh * factor));
                    nodes.push({
                        x: centerX,
                        y: centerY,
                        w: ow,
                        h: oh
                    });
                }
                nodes.sort((a, b) => a.x - b.x);
                const pruned = [];
                const minDist = 50;
                const minDist2 = minDist * minDist;
                for (let k = 0; k < nodes.length; k++) {
                    const n = nodes[k];
                    let ok = true;
                    for (let j = pruned.length - 1; j >= 0 && j > pruned.length - 16; j--) {
                        const p = pruned[j];
                        const dx = n.x - p.x,
                            dy = n.y - p.y;
                        if (dx * dx + dy * dy < minDist2) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) pruned.push(n);
                }
                return pruned;
            };
            const minerals = buildNodes(this._isMineralPixel, scan);
            let gas = buildNodes(this._isGasPixel, scan);
            const maxDim = Math.max(map.width, map.height);
            const gasTarget = Math.min(maxDim, 1024);
            if (gasTarget < maxDim) {
                const gasScan = this._getMapScan(gasTarget);
                if (gasScan && gasScan !== scan) {
                    const gasHi = buildNodes(this._isGasPixel, gasScan);
                    if (gasHi.length > gas.length) gas = gasHi;
                }
            }
            cached = {
                minerals: minerals,
                gas: gas
            };
            this._resourceCache[mapName] = cached;
        }
        if (cached.length) {
            cached = {
                minerals: cached,
                gas: []
            };
            this._resourceCache[mapName] = cached;
        }
        this._spawnedResourceIndex[mapName] = {};
        for (let i = 0; i < cached.minerals.length; i++) {
            const n = cached.minerals[i];
            const key = ((n.x / 8) >> 0) + ',' + ((n.y / 8) >> 0);
            this._spawnedResourceIndex[mapName][key] = true;
            this._spawnMineralAt(n.x, n.y, n.w, n.h);
        }
        for (let g = 0; g < cached.gas.length; g++) {
            const gn = cached.gas[g];
            this._spawnGasAt(gn.x, gn.y, gn.w * 1.4, gn.h * 1.4);
        }
    }
}

const GameMap = new GameMapClass();

// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.GameMap = GameMap;
}

export default GameMap;
