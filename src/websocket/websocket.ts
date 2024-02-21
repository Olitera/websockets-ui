import { WebSocketServer, WebSocket } from 'ws'
import { IPlayerLogin } from '../interfaces/player-data';
import { IRoomIndex } from '../interfaces/room-data';
import { IGameShips } from '../interfaces/ships-data';

const wss = new WebSocketServer({port: 3000});
const players: IPlayerLogin[] = [];
const rooms: IRoomIndex[] = []

wss.on('connection', (ws) => {
  ws.on('message', (data: string) => {
    console.log(JSON.parse(data))

    const requestData = JSON.parse(data.toString())

    switch (requestData.type) {
      case 'reg':
        registerPlayer(ws, requestData.data);
        updateRoom(ws, requestData.data)
        updateWinners(ws, requestData.data);
        break;
      case 'create_room':
        updateRoom(ws, requestData.data);
        createRoom(ws, requestData.data);
        break
      case 'add_user_to_room':
        updateRoom(ws, requestData.data);
        break
      case 'add_ships':
        addShips(ws, requestData.data);
        break
      default:
        break
    }
  })
})

function registerPlayer(ws: WebSocket, data: IPlayerLogin) {
  players.push(data)
  const responseData = JSON.stringify({
    name: data.name,
    index: players.length - 1,
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

function createRoom(ws: WebSocket, data: IRoomIndex) {
  rooms.push(data)
  const responseData = JSON.stringify({
    idGame: rooms.length - 1,
    idPlayer: data.indexRoom
  })
  const response = {
    type: "create_game",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}

function updateRoom(ws: WebSocket, userData: IPlayerLogin) {
  const responseData = JSON.stringify(
    [ {
      roomId: 1,
      roomUsers: [
        {
          name: userData.name,
          index: 1
        }
      ]
    }]
  )
  const response = {
    type: "update_room",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
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

wss.on('listening', () => {
  console.log('WebSocket server started')
})

wss.on('close', () => {
  console.log('WebSocket server closed')
})
