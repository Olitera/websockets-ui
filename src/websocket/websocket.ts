import { WebSocketServer, WebSocket } from 'ws'
import { IPlayerLogin } from '../interfaces/player-data';
import { IRoom, IRoomIndex } from '../interfaces/room-data';
import { IAttack, IGameShips } from '../interfaces/ships-data';

const wss = new WebSocketServer({port: 3000});
const players: IPlayerLogin[] = [];
const rooms: IRoom[] = [];
const games = [];
const wins = [];
let id = 0;

wss.on('connection', (ws) => {
  const userId = id + 1;
  ws.on('message', (data: string) => {
    console.log(JSON.parse(data))

    const requestData = JSON.parse(data.toString())
    console.log(requestData, '@@@@@@@@@@@')

    switch (requestData.type) {
      case 'reg':
        registerPlayer(ws, JSON.parse(requestData.data), userId);
        updateRoom()
        updateWinners(ws, requestData.data);
        break;
      case 'create_room':
        createRoom(userId);
        updateRoom();
        break
      case 'add_user_to_room':
        updateRoom();
        createGame(ws, JSON.parse(requestData.data), userId);
        break
      case 'add_ships':
        addShips(ws, requestData.data);
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
  players.push(data)
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

function updateWinners(ws: WebSocket, data: IPlayerLogin) {
  const responseData = JSON.stringify({
    name: data.name,
    wins: 1
  })
  const response = {
    type: "update_winners",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}

function createGame(ws: WebSocket, data: IRoomIndex, userId: number) {
  // data.users.push({id: userId })
  // rooms.push(data);
  games.push({
    idGame: games.length + 1,
    idPlayer: data.indexRoom
  })
  const responseData = JSON.stringify({
    idGame: games.length - 1,
    idPlayer: data.indexRoom
  })
  const response = {
    type: "create_game",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}

function createRoom(userId: number) {
  const name = players.find(((player)=> player.id === userId))?.name as string;
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
  wss.clients.forEach((ws) => {
    ws.send(JSON.stringify(response))
  })
}

function addShips(ws: WebSocket, data: IGameShips) {
  const responseData = JSON.stringify({
    ships:
      [
        {
          position: {
            x: 1,
            y: 1,
          },
          direction: true,
          length: 1,
          type: "small",
        }
      ],
    currentPlayerIndex: 1
  })
  const response = {
    type: "start_game",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response));
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
