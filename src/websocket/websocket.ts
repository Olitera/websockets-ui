import { WebSocketServer, WebSocket } from 'ws'
import { IPlayerData, IPlayerLogin } from '../interfaces/player-data';

const wss = new WebSocketServer({port: 3000})
const players: IPlayerLogin[] = []

wss.on('connection', (ws) => {
  ws.on('message', (data: string) => {
    console.log(JSON.parse(data))

    const requestData: IPlayerData = JSON.parse(data.toString())

    switch (requestData.type) {
      case 'reg':
        registerPlayer(ws, requestData.data)
        break;
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
  updateWinners(ws, data)
  ws.send(JSON.stringify(response))
}

function updateWinners(ws: WebSocket, data: IPlayerLogin) {
  const responseData = JSON.stringify({
    name: data.name,
    wins: 1
  },)
  const response = {
    type: "update_winners",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}

wss.on('listening', () => {
  console.log('WebSocket server started')
})

wss.on('close', () => {
  console.log('WebSocket server closed')
})
