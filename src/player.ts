import { WebSocket } from 'ws';
import { IPlayerLogin } from './interfaces/player-data';

export function registerPlayer(ws: WebSocket, data: IPlayerLogin, userId: number, users: IPlayerLogin[]) {
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
