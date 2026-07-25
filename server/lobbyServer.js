const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });
console.log('Lobby Server WebSocket iniciado en el puerto 8080');

// Almacén global de salas y conexiones
const rooms = {}; // roomId -> { id, name, map, players: [], status, ticks: {} }
const clients = {}; // wsId -> { ws, name, roomId }
let nextClientId = 1;
let nextRoomId = 1;

wss.on('connection', (ws) => {
    const clientId = 'player_' + (nextClientId++);
    clients[clientId] = { ws, name: 'Sin Nombre', roomId: null };
    console.log(`Cliente conectado: ${clientId}`);

    // Enviar id inicial al cliente
    sendTo(ws, { type: 'welcome', id: clientId });
    broadcastLobbyRooms();

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(clientId, data);
        } catch (e) {
            console.error('Error al procesar mensaje:', e);
        }
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado: ${clientId}`);
        const client = clients[clientId];
        if (client && client.roomId) {
            handleLeaveRoom(clientId, client.roomId);
        }
        delete clients[clientId];
        broadcastLobbyRooms();
    });
});

function sendTo(ws, messageObj) {
    if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify(messageObj));
    }
}

function broadcastLobbyRooms() {
    // Filtrar información pública de las salas en el lobby
    const lobbyRooms = Object.values(rooms).map(r => ({
        id: r.id,
        name: r.name,
        map: r.map,
        playersCount: r.players.length,
        status: r.status
    }));

    Object.values(clients).forEach(c => {
        if (!c.roomId) {
            sendTo(c.ws, { type: 'lobby-rooms', rooms: lobbyRooms });
        }
    });
}

function broadcastToRoom(room, messageObj) {
    room.players.forEach(p => {
        const client = clients[p.id];
        if (client) {
            sendTo(client.ws, messageObj);
        }
    });
}

function handleMessage(clientId, data) {
    const client = clients[clientId];
    if (!client) return;

    switch (data.type) {
        case 'join-lobby':
            client.name = data.name || 'Sin Nombre';
            broadcastLobbyRooms();
            break;

        case 'create-room': {
            const roomId = 'room_' + (nextRoomId++);
            rooms[roomId] = {
                id: roomId,
                name: data.name || `Partida de ${client.name}`,
                map: data.map || 'Switchback',
                players: [{
                    id: clientId,
                    name: client.name,
                    race: 'Terran',
                    team: 0,
                    ready: false,
                    isHost: true
                }],
                status: 'lobby',
                ticks: {} // tickNum -> { playerCmds: { id: [] }, count: 0 }
            };
            client.roomId = roomId;
            sendTo(client.ws, { type: 'create-room-success', room: rooms[roomId] });
            broadcastLobbyRooms();
            break;
        }

        case 'join-room': {
            const room = rooms[data.roomId];
            if (room && room.status === 'lobby' && room.players.length < 2) {
                // Asignar equipo alternativo por defecto
                const existingTeam = room.players[0].team;
                const nextTeam = existingTeam === 0 ? 1 : 0;
                
                room.players.push({
                    id: clientId,
                    name: client.name,
                    race: 'Terran',
                    team: nextTeam,
                    ready: false,
                    isHost: false
                });
                client.roomId = data.roomId;
                sendTo(client.ws, { type: 'join-room-success', room: room });
                broadcastToRoom(room, { type: 'room-updated', room: room });
                broadcastLobbyRooms();
            } else {
                sendTo(client.ws, { type: 'error', message: 'No se pudo unir a la sala (llena o inexistente)' });
            }
            break;
        }

        case 'leave-room':
            if (client.roomId) {
                handleLeaveRoom(clientId, client.roomId);
                client.roomId = null;
                sendTo(client.ws, { type: 'leave-room-success' });
                broadcastLobbyRooms();
            }
            break;

        case 'update-player':
            if (client.roomId) {
                const room = rooms[client.roomId];
                if (room) {
                    const p = room.players.find(player => player.id === clientId);
                    if (p) {
                        if (data.race) p.race = data.race;
                        if (data.team !== undefined) p.team = data.team;
                        if (data.ready !== undefined) p.ready = data.ready;
                        broadcastToRoom(room, { type: 'room-updated', room: room });
                    }
                }
            }
            break;

        case 'start-game':
            if (client.roomId) {
                const room = rooms[client.roomId];
                if (room && room.players.find(p => p.id === clientId)?.isHost) {
                    // Generar semilla aleatoria inicial determinista
                    const seed = Math.floor(Math.random() * 1000000) + 1;
                    room.status = 'playing';
                    room.ticks = {}; // Limpiar ticks anteriores
                    room.loadedPlayers = {};
                    room.loadedCount = 0;
                    broadcastToRoom(room, {
                        type: 'start-game',
                        seed: seed,
                        players: room.players,
                        map: room.map
                    });
                    broadcastLobbyRooms();
                }
            }
            break;

        case 'player-loaded':
            if (client.roomId) {
                const room = rooms[client.roomId];
                if (room && room.status === 'playing') {
                    if (!room.loadedPlayers[clientId]) {
                        room.loadedPlayers[clientId] = true;
                        room.loadedCount++;
                        console.log(`Jugador cargado en sala ${client.roomId}: ${clientId} (${room.loadedCount}/${room.players.length})`);
                        
                        if (room.loadedCount === room.players.length) {
                            console.log(`Todos los jugadores cargados en sala ${client.roomId}. Emitiendo go-live.`);
                            broadcastToRoom(room, {
                                type: 'go-live'
                            });
                        }
                    }
                }
            }
            break;

        case 'tick-cmd':
            if (client.roomId) {
                const room = rooms[client.roomId];
                if (room && room.status === 'playing') {
                    const tick = data.tick;
                    if (!room.ticks[tick]) {
                        room.ticks[tick] = {
                            playerCmds: {},
                            count: 0
                        };
                    }
                    // Registrar comandos del jugador para este tick
                    if (room.ticks[tick].playerCmds[clientId] === undefined) {
                        room.ticks[tick].playerCmds[clientId] = data.cmds || [];
                        room.ticks[tick].count++;
                    }

                    // Si todos los jugadores enviaron sus comandos para este tick
                    if (room.ticks[tick].count === room.players.length) {
                        broadcastToRoom(room, {
                            type: 'tick-data',
                            tick: tick,
                            cmds: room.ticks[tick].playerCmds
                        });
                        // Limpiar memoria de ticks antiguos (ej. mantener los últimos 10 por seguridad si fuese necesario, o borrar directamente)
                        delete room.ticks[tick];
                    }
                }
            }
            break;

        case 'chat-msg':
            if (client.roomId) {
                const room = rooms[client.roomId];
                if (room) {
                    broadcastToRoom(room, {
                        type: 'chat-msg',
                        sender: client.name,
                        message: data.message
                    });
                }
            }
            break;
    }
}

function handleLeaveRoom(clientId, roomId) {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter(p => p.id !== clientId);
    if (room.players.length === 0) {
        delete rooms[roomId];
        console.log(`Sala eliminada por estar vacía: ${roomId}`);
    } else {
        // Si el host se va, transferir host
        if (!room.players.some(p => p.isHost)) {
            room.players[0].isHost = true;
        }
        broadcastToRoom(room, { type: 'room-updated', room: room });
        // Si la partida estaba en curso, terminarla o notificar desconexión
        if (room.status === 'playing') {
            broadcastToRoom(room, { type: 'opponent-disconnected' });
            room.status = 'lobby';
        }
    }
}
