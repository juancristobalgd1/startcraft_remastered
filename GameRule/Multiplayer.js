import Game from './Games/core/GameBase.js';
import Unit from '../Characters/Units/core/UnitBase.js';
import Building from '../Characters/Buildings/core/BuildingBase.js';
import mouseController from '../Controller/mouseController.js';
import Button from '../Characters/Buttons/core/ButtonBase.js';
import Magic from '../Characters/Magics/core/MagicBase.js';
import Upgrade from '../Characters/Upgrades/core/UpgradeBase.js';
import Zerg from '../Characters/Zergs/core/ZergBase.js';
import Terran from '../Characters/Terrans/core/TerranBase.js';
import Protoss from '../Characters/Protosses/core/ProtossBase.js';
import Cheat from './Cheat.js';
import Referee from './Referees/core/RefereeBase.js';
import Neutral from '../Characters/Breeds/Neutral.js';

let origStartAnimation = Game.startAnimation;
let origStopAnimation = Game.stopAnimation;

const Multiplayer = {
    ON: false,
    cmds: [],
    
    // Capa de Red y Lobby
    ws: null,
    playerId: null,
    nickname: '',
    currentRoom: null,
    localQueue: [],
    receivedTicks: {},
    sendClock: 0,
    netTimer: null,
    selectedMap: 'Switchback',
    loadingGame: false,

    getUnitsByUIDs(uids) {
        return Unit.allUnits.concat(Building.allBuildings).filter(chara => {
            return uids.indexOf(chara.id) !== -1 && chara.status !== 'dead';
        });
    },

    getUIDs(charas) {
        return charas.map(chara => chara.id);
    },

    // --- Motor Lockstep de Red ---
    sendLocalCommand(cmd) {
        if (!this.ON) return;
        this.localQueue.push(JSON.stringify(cmd));
    },

    startLockstep() {
        this.ON = true;
        this.receivedTicks = {};
        this.localQueue = [];
        this.sendClock = 2; // Retardo de frames inicial (latencia)

        // Detener y reemplazar loop automático
        Game.startAnimation = function () {};
        Game.stopAnimation = function () {};
        if (Game._timer !== -1) {
            clearInterval(Game._timer);
            Game._timer = -1;
        }

        // Desactivar botón de pausa
        $('#PauseButton').hide();

        // Enviar ticks iniciales de latencia vacíos
        this.sendTickPacket(0);
        this.sendTickPacket(1);
        this.sendTickPacket(2);

        // Iniciar intervalo de red (100ms)
        if (this.netTimer) clearInterval(this.netTimer);
        this.netTimer = setInterval(() => {
            this.sendClock++;
            this.sendTickPacket(this.sendClock);
        }, 100);
    },

    sendTickPacket(tick) {
        if (!this.ws || this.ws.readyState !== 1) return;
        this.ws.send(JSON.stringify({
            type: 'tick-cmd',
            tick: tick,
            cmds: this.localQueue
        }));
        this.localQueue = [];
    },

    handleTickData(tickData) {
        const tick = tickData.tick;
        const allCmds = [];
        
        // Consolidar todos los comandos de todos los jugadores
        Object.values(tickData.cmds).forEach(playerCmds => {
            allCmds.push(...playerCmds);
        });

        this.receivedTicks[tick] = allCmds;

        // Procesar en orden estrictamente determinista
        while (this.receivedTicks[Game._clock] !== undefined) {
            const cmds = this.receivedTicks[Game._clock];
            this.parseTickCmd({ tick: Game._clock, cmds: cmds });
            
            // Ejecutar un frame síncrono del loop original
            if (Game._loop) {
                try {
                    const wasPaused = Game.isPaused;
                    Game.isPaused = false; // Forzar ejecución
                    Game._loop();
                    Game.isPaused = wasPaused;
                } catch (e) {
                    console.error("Error en loop lockstep:", e);
                }
            }
            delete this.receivedTicks[Game._clock];
        }
    },

    stopLockstep() {
        this.ON = false;
        if (this.netTimer) {
            clearInterval(this.netTimer);
            this.netTimer = null;
        }
        Game.startAnimation = origStartAnimation;
        Game.stopAnimation = origStopAnimation;
        $('#PauseButton').show();
    },

    // --- Cliente de Sockets del Lobby ---
    initSocket(serverUrl, nickname) {
        this.nickname = nickname;
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
            console.log('Conectado al servidor de lobby');
            this.ws.send(JSON.stringify({
                type: 'join-lobby',
                name: this.nickname
            }));
            
            // Cambiar UI
            $('#lobby-login').hide();
            $('#lobby-rooms-panel').show();
            $('#lobby-connected-nick').text(this.nickname);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (e) {
                console.error('Error al recibir mensaje de red:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('Conexión cerrada');
            this.stopLockstep();
            alert('Se ha perdido la conexión con el servidor de sockets.');
            this.showLobbyUI();
        };

        this.ws.onerror = (err) => {
            console.error('Error de socket:', err);
            alert('Error al conectar con el servidor.');
        };
    },

    sendServerMessage(msgObj) {
        if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(msgObj));
        }
    },

    handleServerMessage(data) {
        switch (data.type) {
            case 'welcome':
                this.playerId = data.id;
                break;
            case 'lobby-rooms':
                this.renderRoomsList(data.rooms);
                break;
            case 'create-room-success':
            case 'join-room-success':
                this.currentRoom = data.room;
                this.selectedMap = data.room.map;
                this.showRoomUI();
                break;
            case 'room-updated':
                this.currentRoom = data.room;
                this.selectedMap = data.room.map;
                this.updateRoomDetails();
                break;
            case 'opponent-disconnected':
                alert('El oponente se ha desconectado de la partida.');
                this.stopLockstep();
                Game.stop(Unit.allUnits);
                Game.layerSwitchTo("GameStart");
                break;
            case 'chat-msg':
                this.appendChatMessage(data.sender, data.message);
                break;
            case 'start-game':
                this.currentRoom.players = data.players;
                this.selectedMap = data.map;
                this.launchGame(data.seed);
                break;
            case 'go-live':
                this.loadingGame = false;
                this.goLive();
                break;
            case 'tick-data':
                this.handleTickData(data);
                break;
            case 'error':
                alert('Error del servidor: ' + data.message);
                break;
        }
    },

    // --- Lanzamiento del Juego Multijugador ---
    launchGame(seed) {
        // Encontrar nuestro jugador local
        const localPlayer = this.currentRoom.players.find(p => p.id === this.playerId);
        if (!localPlayer) return;

        // Configurar variables de partida multijugador
        Game.level = 13; // Nivel multijugador dinámico
        Game.seed = seed;
        Game.randomSeed = seed;
        Game.team = localPlayer.team;
        
        // Indicar que estamos cargando el juego
        this.loadingGame = true;

        // Iniciar carga de recursos (sin arrancar lockstep todavía)
        Game.play();
    },

    sendPlayerLoaded() {
        console.log("Enviando handshake player-loaded al servidor...");
        this.sendServerMessage({
            type: 'player-loaded'
        });
    },

    goLive() {
        console.log("goLive recibido. Activando interfaz de combate e iniciando loop lockstep.");
        Game.layerSwitchTo("GamePlay");
        Game.resizeWindow();
        mouseController.toControlAll();
        keyController.start();
        Game.initReplayRecording();
        this.startLockstep();
        Game.animation();
    },

    // --- Controladores de la UI de Sockets ---
    showLobbyUI() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.stopLockstep();
        
        // Crear contenedor HTML si no existe
        if ($('#GameLobby').length === 0) {
            $('body').append('<div id="GameLobby" class="GameLayer"></div>');
        }

        // Renderizar plantilla de la UI
        $('#GameLobby').html(`
            <div class="lobby-container">
                <div class="lobby-title">STARCRAFT MULTIJUGADOR</div>
                
                <!-- Panel de Conexión -->
                <div class="lobby-panel" id="lobby-login">
                    <h3>CONECTAR AL SERVIDOR</h3>
                    <div class="lobby-form-group">
                        <label>Dirección del Servidor:</label>
                        <input type="text" id="lobby-server-url" value="ws://${window.location.hostname || 'localhost'}:8080">
                    </div>
                    <div class="lobby-form-group">
                        <label>Apodo del Jugador:</label>
                        <input type="text" id="lobby-nickname" value="Comandante_${Math.floor(Math.random()*900)+100}">
                    </div>
                    <button class="lobby-btn" id="lobby-connect-btn">CONECTAR</button>
                    <button class="lobby-btn secondary" id="lobby-back-btn">VOLVER AL MENÚ</button>
                </div>

                <!-- Panel de Lista de Salas -->
                <div class="lobby-panel" id="lobby-rooms-panel" style="display:none;">
                    <div class="lobby-header-bar">
                        <span>Piloto: <strong id="lobby-connected-nick" style="color:var(--neon-cyan);"></strong></span>
                        <button class="lobby-btn danger" id="lobby-disconnect-btn" style="padding: 5px 10px; font-size:12px; margin:0;">SALIR</button>
                    </div>
                    <h3>SALAS DISPONIBLES</h3>
                    <div id="lobby-rooms-list" class="lobby-list-container">
                        <div class="lobby-empty-list">No hay salas disponibles en este momento.</div>
                    </div>
                    <div class="lobby-actions-row">
                        <button class="lobby-btn" id="lobby-create-room-btn">CREAR SALA</button>
                        <button class="lobby-btn secondary" id="lobby-refresh-rooms-btn">ACTUALIZAR</button>
                    </div>
                </div>

                <!-- Panel de Sala de Espera -->
                <div class="lobby-panel" id="lobby-room-detail" style="display:none;">
                    <h3 id="lobby-room-name">SALA: </h3>
                    <div class="lobby-room-layout">
                        <div class="lobby-players-section">
                            <h4>JUGADORES</h4>
                            <div id="lobby-players-list">
                                <!-- Renderizado dinámico -->
                            </div>
                        </div>
                        <div class="lobby-chat-section">
                            <h4>COMUNICACIONES</h4>
                            <div id="lobby-chat-messages" class="lobby-chat-box"></div>
                            <div class="lobby-chat-input-row">
                                <input type="text" id="lobby-chat-input" placeholder="Transmitir mensaje...">
                                <button class="lobby-btn" id="lobby-chat-send-btn" style="margin:0;">ENVIAR</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="lobby-form-group" style="margin-top: 15px;">
                        <label>Mapa de Combate:</label>
                        <select id="lobby-map-select">
                            <option value="Switchback">Switchback</option>
                            <option value="Volcanis">Volcanis</option>
                            <option value="TrenchWars">TrenchWars</option>
                            <option value="BloodBath">BloodBath</option>
                            <option value="OrbitalRelay">OrbitalRelay</option>
                            <option value="BigGameHunters">BigGameHunters</option>
                            <option value="TheHunters">TheHunters</option>
                            <option value="Grass">Grass</option>
                        </select>
                    </div>

                    <div class="lobby-actions-row" style="margin-top: 15px;">
                        <button class="lobby-btn success" id="lobby-start-game-btn" style="display:none;">INICIAR COMBATE</button>
                        <button class="lobby-btn" id="lobby-ready-btn">LISTO</button>
                        <button class="lobby-btn danger" id="lobby-leave-room-btn">ABANDONAR SALA</button>
                    </div>
                </div>
            </div>
        `);

        // Registrar Eventos de UI
        $('#lobby-back-btn').on('click', () => {
            Game.layerSwitchTo("GameStart");
        });

        $('#lobby-connect-btn').on('click', () => {
            const url = $('#lobby-server-url').val().trim();
            const nick = $('#lobby-nickname').val().trim();
            if (url && nick) {
                this.initSocket(url, nick);
            }
        });

        $('#lobby-disconnect-btn').on('click', () => {
            if (this.ws) this.ws.close();
        });

        $('#lobby-create-room-btn').on('click', () => {
            const rName = prompt("Nombre de la Sala:", `Sala de ${this.nickname}`);
            if (rName !== null) {
                const map = $('#lobby-map-select').val() || 'Switchback';
                this.sendServerMessage({
                    type: 'create-room',
                    name: rName,
                    map: map
                });
            }
        });

        $('#lobby-refresh-rooms-btn').on('click', () => {
            this.sendServerMessage({ type: 'join-lobby', name: this.nickname });
        });

        $('#lobby-leave-room-btn').on('click', () => {
            this.sendServerMessage({ type: 'leave-room' });
        });

        $('#lobby-ready-btn').on('click', () => {
            const localPlayer = this.currentRoom.players.find(p => p.id === this.playerId);
            if (localPlayer) {
                this.sendServerMessage({
                    type: 'update-player',
                    ready: !localPlayer.ready
                });
            }
        });

        $('#lobby-start-game-btn').on('click', () => {
            this.sendServerMessage({ type: 'start-game' });
        });

        // Chat
        $('#lobby-chat-send-btn').on('click', () => {
            this.sendChatFromInput();
        });
        $('#lobby-chat-input').on('keypress', (e) => {
            if (e.which === 13) this.sendChatFromInput();
        });

        // Mapa cambia sólo por host
        $('#lobby-map-select').on('change', function() {
            Multiplayer.sendServerMessage({
                type: 'update-player', // reutiliza actualización de sala con parámetros
                map: $(this).val()
            });
        });

        Game.layerSwitchTo("GameLobby");
    },

    sendChatFromInput() {
        const input = $('#lobby-chat-input');
        const text = input.val().trim();
        if (text) {
            this.sendServerMessage({
                type: 'chat-msg',
                message: text
            });
            input.val('');
        }
    },

    renderRoomsList(roomsList) {
        const container = $('#lobby-rooms-list');
        container.html('');
        if (roomsList.length === 0) {
            container.html('<div class="lobby-empty-list">No hay salas disponibles en este momento.</div>');
            return;
        }

        roomsList.forEach(room => {
            const card = $(`
                <div class="lobby-room-card">
                    <div class="lobby-room-info">
                        <span class="lobby-room-name">${room.name}</span>
                        <span class="lobby-room-meta">Mapa: ${room.map} | Jugadores: ${room.playersCount}/2</span>
                    </div>
                    <button class="lobby-btn" style="margin:0; padding:5px 15px;" ${room.playersCount >= 2 || room.status !== 'lobby' ? 'disabled' : ''}>UNIRSE</button>
                </div>
            `);
            card.find('button').on('click', () => {
                this.sendServerMessage({
                    type: 'join-room',
                    roomId: room.id
                });
            });
            container.append(card);
        });
    },

    showRoomUI() {
        $('#lobby-rooms-panel').hide();
        $('#lobby-room-detail').show();
        $('#lobby-chat-messages').html('');
        this.updateRoomDetails();
    },

    updateRoomDetails() {
        if (!this.currentRoom) return;

        $('#lobby-room-name').text('SALA: ' + this.currentRoom.name);
        
        // Habilitar selección de mapa sólo para el anfitrión
        const localPlayer = this.currentRoom.players.find(p => p.id === this.playerId);
        const isHost = localPlayer?.isHost;
        $('#lobby-map-select').val(this.selectedMap);
        $('#lobby-map-select').prop('disabled', !isHost);

        // Renderizar lista de jugadores
        const listContainer = $('#lobby-players-list');
        listContainer.html('');

        this.currentRoom.players.forEach(p => {
            const isLocal = p.id === this.playerId;
            const playerCard = $(`
                <div class="lobby-player-card ${p.ready ? 'ready' : ''}">
                    <div class="lobby-player-header">
                        <span class="lobby-player-name">${p.name} ${isLocal ? ' (Tú)' : ''} ${p.isHost ? '👑' : ''}</span>
                        <span class="lobby-player-status">${p.ready ? 'LISTO' : 'PREPARANDO'}</span>
                    </div>
                    <div class="lobby-player-controls">
                        <div class="lobby-control-item">
                            <label>Raza:</label>
                            <select class="lobby-race-select" ${!isLocal ? 'disabled' : ''}>
                                <option value="Terran" ${p.race === 'Terran' ? 'selected' : ''}>Terran</option>
                                <option value="Zerg" ${p.race === 'Zerg' ? 'selected' : ''}>Zerg</option>
                                <option value="Protoss" ${p.race === 'Protoss' ? 'selected' : ''}>Protoss</option>
                            </select>
                        </div>
                        <div class="lobby-control-item">
                            <label>Equipo:</label>
                            <select class="lobby-team-select" ${!isLocal ? 'disabled' : ''}>
                                <option value="0" ${p.team === 0 ? 'selected' : ''}>Equipo 0</option>
                                <option value="1" ${p.team === 1 ? 'selected' : ''}>Equipo 1</option>
                            </select>
                        </div>
                    </div>
                </div>
            `);

            // Eventos de configuración de jugador
            if (isLocal) {
                playerCard.find('.lobby-race-select').on('change', function() {
                    Multiplayer.sendServerMessage({
                        type: 'update-player',
                        race: $(this).val()
                    });
                });
                playerCard.find('.lobby-team-select').on('change', function() {
                    Multiplayer.sendServerMessage({
                        type: 'update-player',
                        team: parseInt($(this).val())
                    });
                });
            }

            listContainer.append(playerCard);
        });

        // Configurar botón "Listo"
        if (localPlayer) {
            $('#lobby-ready-btn').text(localPlayer.ready ? 'CANCELAR LISTO' : 'CONFIRMAR LISTO');
            $('#lobby-ready-btn').toggleClass('success', !localPlayer.ready);
        }

        // Mostrar / Ocultar botón de Iniciar Combate (sólo anfitrión)
        if (isHost) {
            // Verificar si ambos jugadores están listos y hay exactamente 2 jugadores
            const allReady = this.currentRoom.players.length === 2 && this.currentRoom.players.every(p => p.ready);
            $('#lobby-start-game-btn').toggle(true);
            $('#lobby-start-game-btn').prop('disabled', !allReady);
        } else {
            $('#lobby-start-game-btn').toggle(false);
        }
    },

    appendChatMessage(sender, message) {
        const box = $('#lobby-chat-messages');
        const isSelf = sender === this.nickname;
        box.append(`
            <div class="lobby-chat-msg">
                <span class="lobby-chat-sender" style="color: ${isSelf ? 'var(--neon-cyan)' : '#0077ff'};">${sender}:</span>
                <span class="lobby-chat-text">${message}</span>
            </div>
        `);
        box.scrollTop(box[0].scrollHeight);
    },

    // --- Dispatcher de Comandos del Juego ---
    parseTickCmd(msgObj) {
        if (!msgObj.cmds) return;
        if (!Game.commands[msgObj.tick]) Game.commands[msgObj.tick] = [];
        
        msgObj.cmds.forEach(cmdStr => {
            const cmd = JSON.parse(cmdStr);
            switch (cmd.type) {
                case 'rightClick':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.rightClickHandler(charas, cmd.pos, cmd.unlock, cmd.btn);
                    });
                    break;
                case 'stop':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.stopHandler(charas);
                    });
                    break;
                case 'hold':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.holdHandler(charas);
                    });
                    break;
                case 'magic':
                    if (cmd.duration) {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                let duration = cmd.duration;
                                if (Cheat.cwal) duration = 0;
                                Game.commandTimeout(() => {
                                    if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                        Magic[cmd.name].spell.call(owner);
                                    }
                                    delete owner.processing;
                                }, duration * 100);
                                owner.processing = {
                                    name: cmd.name,
                                    startTime: Game.mainTick,
                                    time: duration
                                };
                            }
                        });
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner) {
                                if (cmd.pos) {
                                    if (cmd.creditBill && window.Resource) owner.creditBill = cmd.creditBill;
                                    if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                        Magic[cmd.name].spell.call(owner, cmd.pos);
                                    }
                                } else {
                                    if (window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                        if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                            Magic[cmd.name].spell.call(owner);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    break;
                case 'upgrade':
                    if (cmd.duration) {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                let duration = cmd.duration;
                                if (Cheat.cwal) duration = 0;
                                Game.commandTimeout(() => {
                                    if (Upgrade[cmd.name] && Upgrade[cmd.name].effect) {
                                        Upgrade[cmd.name].effect(cmd.team);
                                    }
                                    delete owner.processing;
                                    if (cmd.team == Game.team) {
                                        if (Referee.voice && Referee.voice.upgrade && Referee.voice.upgrade[Game.race.selected]) {
                                            Referee.voice.upgrade[Game.race.selected].play();
                                        }
                                        if (Game.refreshInfo) Game.refreshInfo();
                                        if (Game.showMessage) Game.showMessage('Upgrade complete');
                                    }
                                }, duration * 100);
                                owner.processing = {
                                    name: cmd.name,
                                    startTime: Game.mainTick,
                                    time: duration
                                };
                            }
                        });
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            if (Upgrade[cmd.name] && Upgrade[cmd.name].effect) {
                                Upgrade[cmd.name].effect(cmd.team);
                            }
                        });
                    }
                    break;
                case 'unit':
                    if (cmd.evolve) {
                        switch (cmd.evolve) {
                            case 'archon':
                                Game.commands[msgObj.tick].push(() => {
                                    const chara = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                                    if (chara && window.Resource && window.Resource.paypal.call(chara, window.Resource.getCost(cmd.name))) {
                                        const evolveClass = (window.ProtossBuilding && window.ProtossBuilding[cmd.name + 'Evolve']) || 
                                                             (window.Building && window.Building.ProtossBuilding && window.Building.ProtossBuilding[cmd.name + 'Evolve']);
                                        if (evolveClass) {
                                            const evolve = chara.evolveTo(evolveClass);
                                            let duration = cmd.duration;
                                            Game.commandTimeout(() => {
                                                if (evolve.status != 'dead') {
                                                    const targetClass = window.Protoss && window.Protoss[cmd.name];
                                                    if (targetClass) {
                                                        evolve.evolveTo(targetClass);
                                                    }
                                                }
                                            }, duration * 100);
                                            evolve.processing = {
                                                name: cmd.name,
                                                startTime: Game.mainTick,
                                                time: duration
                                            };
                                        }
                                    }
                                });
                                break;
                            case 'zerg':
                                const exceptions = ['Guardian', 'Devourer'];
                                Game.commands[msgObj.tick].push(() => {
                                    const chara = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                                    if (chara && window.Resource && window.Resource.paypal.call(chara, window.Resource.getCost(cmd.name))) {
                                        const base = chara.owner;
                                        let egg;
                                        const ZergBuilding = window.ZergBuilding || (window.Building && window.Building.ZergBuilding);
                                        if (exceptions.indexOf(cmd.name) != -1) {
                                            egg = chara.evolveTo(ZergBuilding.Cocoon);
                                        } else {
                                            egg = chara.evolveTo(ZergBuilding.Egg);
                                            if (cmd.name == 'Lurker') egg.action = 18;
                                        }
                                        let duration = cmd.duration;
                                        if (Cheat.cwal) duration = 0;
                                        Game.commandTimeout(() => {
                                            if (egg.status != 'dead') {
                                                const targetClass = window.Zerg && window.Zerg[cmd.name];
                                                if (targetClass) {
                                                    egg.evolveTo(targetClass);
                                                }
                                            }
                                        }, duration * 100);
                                        egg.processing = {
                                            name: cmd.name,
                                            startTime: Game.mainTick,
                                            time: duration
                                        };
                                    }
                                });
                                break;
                        }
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                // Encontrar clase de raza
                                let Race;
                                const races = [window.Zerg, window.Terran, window.Protoss, window.Hero];
                                races.forEach(r => {
                                    if (r && r[cmd.name]) Race = r;
                                });
                                if (Race && Race[cmd.name]) {
                                    let duration = cmd.duration;
                                    if (Cheat.cwal) duration = 0;
                                    Game.commandTimeout(() => {
                                        let trainedUnit;
                                        if (Race[cmd.name].prototype.isFlying) {
                                            trainedUnit = new Race[cmd.name]({ x: owner.x, y: owner.y, team: owner.team });
                                        } else {
                                            trainedUnit = new Race[cmd.name]({ x: owner.x, y: owner.y + owner.height, team: owner.team });
                                        }
                                        delete owner.processing;
                                        if (owner.rallyPoint) trainedUnit.destination = owner.rallyPoint;
                                    }, duration * 100);
                                    owner.processing = {
                                        name: cmd.name,
                                        startTime: Game.mainTick,
                                        time: duration
                                    };
                                }
                            }
                        });
                    }
                    break;
                case 'build':
                    Game.commands[msgObj.tick].push(() => {
                        const farmer = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                        if (farmer && window.Resource && window.Resource.paypal.call(farmer, window.Resource.getCost(cmd.name))) {
                            farmer.buildName = cmd.name;
                            if (cmd.pos) {
                                farmer['build' + cmd.buildType](cmd.pos);
                            } else {
                                farmer['build' + cmd.buildType]();
                            }
                        }
                    });
                    break;
            }
        });
    },

    rightClickHandler(charas, pos, unlock, btn) {
        if (!charas.length) return;
        let selectedEnemy = Game.getSelectedOne(pos.x, pos.y, true); // true for enemy
        const hasSelectedWorker = charas.some(chara => chara && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe'));
        if (!(selectedEnemy instanceof Gobj) && hasSelectedWorker) {
            const mx = pos.x;
            const my = pos.y;
            const minerals = Game.getInRangeOnes(mx, my, 55, false, true, false, chara => {
                return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral) || (chara.name == 'Mineral');
            });
            if (minerals && minerals.length) {
                selectedEnemy = minerals[0];
            }
        }
        if (!(selectedEnemy instanceof Gobj)) {
            selectedEnemy = Game.getSelectedOne(pos.x, pos.y, false, false, null, chara => {
                return (chara instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
            });
        }
        charas.forEach(chara => {
            if (chara.sound && chara.sound.moving) chara.sound.moving.play();
            if (chara.destination) {
                if (chara.destination.next) chara.destination.next = null;
                delete chara.destination;
            }
            if (chara.hold) {
                delete chara.AI;
                delete chara.findNearbyTargets;
                delete chara.hold;
                if (typeof Button !== 'undefined' && Button.reset) Button.reset();
            }
            if ((selectedEnemy instanceof Gobj) && 
                ((typeof Neutral !== 'undefined' && selectedEnemy instanceof Neutral.Mineral) || 
                 selectedEnemy.name == 'Mineral' ||
                 ((selectedEnemy instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(selectedEnemy.name) !== -1)))
                && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe')) {
                if (chara.gather) chara.gather(selectedEnemy);
                return;
            }
            const attackOrMove = chara.attack ? (selectedEnemy instanceof Gobj && selectedEnemy.isEnemy) : false;
            if (attackOrMove) {
                if (chara.cannotMove && chara.cannotMove() && !chara.isInAttackRange(selectedEnemy)) return;
                chara.targetLock = true;
                chara.attack(selectedEnemy);
            } else {
                if (chara.cannotMove && chara.cannotMove()) return;
                if (chara.attack) chara.stopAttack();
                chara.targetLock = !unlock;
                chara.moveTo(pos.x, pos.y);
                if (btn == 'attack') {
                    chara.destination = { x: pos.x, y: pos.y };
                }
                if (btn == 'patrol') {
                    chara.destination = { x: pos.x, y: pos.y };
                    chara.destination.next = { x: chara.posX(), y: chara.posY(), next: chara.destination };
                }
            }
        });
    },

    stopHandler(charas) {
        charas.forEach(chara => {
            if (chara.attack) chara.stopAttack();
            chara.dock();
            delete chara._patrolRoute;
            if (chara.destination) {
                if (chara.destination.next) chara.destination.next = undefined;
                delete chara.destination;
            }
        });
    },

    holdHandler(charas) {
        Multiplayer.stopHandler(charas);
        charas.forEach(chara => {
            if (chara.hold) {
                delete chara.AI;
                delete chara.findNearbyTargets;
                delete chara.hold;
            } else {
                chara.AI = Building.Attackable.prototype.AI || (Building.Attackable.prototypePlus && Building.Attackable.prototypePlus.AI);
                chara.findNearbyTargets = Building.Attackable.prototype.findNearbyTargets || (Building.Attackable.prototypePlus && Building.Attackable.prototypePlus.findNearbyTargets);
                chara.dock();
                chara.hold = true;
            }
        });
        if (typeof Button !== 'undefined' && Button.reset) Button.reset();
    }
};

globalThis.Multiplayer = Multiplayer;

// Dynamic worker/building action wrappers for multiplayer/replay support
if (typeof Unit !== 'undefined' && Unit.prototype) {
    Unit.prototype.buildTerran = function (pos) {
        var buildName = this.buildName;
        var buildType = window.TerranBuilding && window.TerranBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.TerranBuilding, buildType, buildName, rect, duration, cost);
        }
    };
    Unit.prototype.buildProtoss = function (pos) {
        var buildName = this.buildName;
        var buildType = window.ProtossBuilding && window.ProtossBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.ProtossBuilding, buildType, buildName, rect, duration, cost);
        }
    };
    Unit.prototype.buildZerg = function (pos) {
        var buildName = this.buildName;
        var buildType = window.ZergBuilding && window.ZergBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.ZergBuilding, buildType, buildName, rect, duration, cost);
        }
    };
}
if (typeof Building !== 'undefined' && Building.prototype) {
    Building.prototype.buildMorph = function () {
        var buildName = this.buildName;
        var buildType = window.ZergBuilding && window.ZergBuilding[buildName];
        if (buildType) {
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            var egg = this.evolveTo(window.ZergBuilding.Egg || window.Building.ZergBuilding.Egg);
            Button.queueJob(egg, {
                name: buildName,
                time: duration,
                run: function () {
                    return egg.evolveTo(buildType);
                }
            });
        }
    };
}

// Support fallback in Archon evolve class resolution
if (globalThis.Multiplayer && globalThis.Multiplayer.parseTickCmd) {
    const origParseTickCmd = globalThis.Multiplayer.parseTickCmd;
    globalThis.Multiplayer.parseTickCmd = function (msgObj) {
        if (msgObj.cmds) {
            msgObj.cmds = msgObj.cmds.map(cmdStr => {
                try {
                    let cmd = JSON.parse(cmdStr);
                    if (cmd.type === 'unit' && (cmd.name === 'Archon' || cmd.name === 'DarkArchon')) {
                        if (window.ProtossBuilding && !window.ProtossBuilding[cmd.name + 'Evolve']) {
                            window.ProtossBuilding[cmd.name + 'Evolve'] = window.ProtossBuilding[cmd.name];
                        }
                    }
                    return cmdStr;
                } catch(e) {
                    return cmdStr;
                }
            });
        }
        return origParseTickCmd(msgObj);
    };
}

export default Multiplayer;
