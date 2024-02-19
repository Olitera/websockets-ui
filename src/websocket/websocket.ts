import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({port: 3000})

wss.on('connection', (ws) => {
  ws.on('message', (data: string) => {
    console.log(JSON.parse(data))
  })
  console.log('client connected');
})

wss.on('listening', () => {
  console.log('WebSocket server started')
})

wss.on('close', () => {
  console.log('WebSocket server closed')
})
