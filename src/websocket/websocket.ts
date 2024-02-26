import { WebSocketServer, WebSocket } from 'ws'
import { IPlayerLogin } from '../interfaces/player-data';
import { IRoom, IRoomIndex } from '../interfaces/room-data';
import { IAttack, IGameShips } from '../interfaces/ships-data';
import { IGamePlayer, IGamesData } from '../interfaces/games-data';
import { IWinsData } from '../interfaces/wins-data';

const wss = new WebSocketServer({port: 3000});
const users: IPlayerLogin[] = [];
const rooms: IRoom[] = [];
const games: IGamesData[] = [];
const wins: IWinsData[] = [];
let id = 0;
const wsMap: Map<number, WebSocket> = new Map();

wss.on('connection', (ws) => {
  console.log("CONNECTION")
  id = id + 1;
  const userId = id;
  wsMap.set(userId, ws);
  ws.on('message', (data: string) => {
    console.log(userId, '@createRoom');
    // console.log(JSON.parse(data))

    const requestData = JSON.parse(data.toString())
    // console.log(requestData, '@@@@@@@@@@@')

    switch (requestData.type) {
      case 'reg':
        registerPlayer(ws, JSON.parse(requestData.data), userId);
        updateRoom()
        updateWinners();
        break;
      case 'create_room':
        createRoom(userId);
        updateRoom();
        break
      case 'add_user_to_room':
        addUserToRoom(JSON.parse(requestData.data), userId)
        updateRoom();
        createGame(JSON.parse(requestData.data), userId);
        break
      case 'add_ships':
        addShips(JSON.parse(requestData.data));
        break
      case 'attack':
        attack(ws, requestData.data);
        break
      default:
        break
    }
  })
})

function registerPlayer(ws: WebSocket, data: IPlayerLogin, userId: number) {
  data.id = userId;
  users.push(data)
  const responseData = JSON.stringify({
    name: data.name,
    index: data.id,
    error: false,
    errorText: ''
  },)
  const response = {
    type: "reg",
      data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}

function updateWinners() {
  const responseData = JSON.stringify(wins)
  const response = {
    type: "update_winners",
    data: responseData,
    id: 0,
  }
  wss.clients.forEach((ws) => {
    ws.send(JSON.stringify(response))
  })
}

function createGame(data: IRoomIndex, userId: number) {
  const players: IGamePlayer[] = rooms.find((room => room.roomId === data.indexRoom))?.roomUsers
    .map((p)=> ({playerId: p.index, ships: []})) as IGamePlayer[]
  games.push({
    gameId: games.length + 1,
    players,
    currentPlayer: userId
  })
  console.log(games, '@games');
  players.forEach(p=> {
    const responseData = JSON.stringify({
      idGame: games.length,
      idPlayer: p.playerId
    })
    const response = {
      type: "create_game",
      data: responseData,
      id: 0,
    }
    wsMap.get(p.playerId)?.send(JSON.stringify(response))
  })
}

function createRoom(userId: number) {
  const name = users.find(((player)=> player.id === userId))?.name as string;
  const room: IRoom = {
    roomId: rooms.length + 1, roomUsers: [{ index: userId, name }]
  }
  rooms.push(room);
}

function updateRoom() {
  const responseData = JSON.stringify(rooms)
  const response = {
    type: "update_room",
    data: responseData,
    id: 0,
  }
  console.log(JSON.stringify(rooms), '@ROOMS')
  wss.clients.forEach((ws) => {
    ws.send(JSON.stringify(response))
  })
}

function addUserToRoom(data: IRoomIndex, userId: number) {
 const user = users.find(u => u.id === userId) as IPlayerLogin;
 const room = rooms.find(r => r.roomId === data.indexRoom) as IRoom;
 if (!room.roomUsers.find(u => u.index === userId)){
   room.roomUsers.push({name: user.name, index: user.id})
 }
 console.log(JSON.stringify(room), userId, '@addUserToRoom')
}

function addShips(data: IGameShips) {
  const game = games.find((g) => g.gameId === data.gameId) as IGamesData;
  // console.log(game, data, games, '@@@@@game')
  const player = game.players.find(p => p.playerId === data.indexPlayer) as IGamePlayer;
  player.ships = data.ships;
  console.log(data.indexPlayer, JSON.stringify(player), '@ GAME player')

  if(game.players.every(p => {
    return p.ships.length;})) {
    startGame(data.gameId)
  }
}

function startGame(gameId: number) {
  const game = games.find((g) => g.gameId === gameId) as IGamesData;
  wss.clients.forEach((ws) => {
    const responseData = JSON.stringify({
      ships: game.players[0].ships,
      currentPlayerIndex: game.currentPlayer
    })
    const response = {
      type: "start_game",
      data: responseData,
      id: 0,
    }
    ws.send(JSON.stringify(response));
  })
}

function attack(ws: WebSocket, data: IAttack) {
  const responseData = JSON.stringify({
    position: {
      x: data.x,
      y: data.y,
    },
    currentPlayer: data.indexPlayer,
    status: "miss"
  })
  const response = {
    type: "attack",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response));
}

wss.on('listening', () => {
  console.log('WebSocket server started')
})

wss.on('close', () => {
  console.log('WebSocket server closed')
})
