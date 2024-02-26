import { WebSocket } from 'ws';
import { IPlayerLogin } from './interfaces/player-data';

export function registerPlayer(ws: WebSocket, data: IPlayerLogin, userId: number, users: IPlayerLogin[]): void {
  data.id = userId;
  users.push(data)
  const responseData: string = JSON.stringify({
    name: data.name,
    index: data.id,
    error: false,
    errorText: ''
  },)
  const response: { data: string; id: number; type: string } = {
    type: "reg",
    data: responseData,
    id: 0,
  }
  ws.send(JSON.stringify(response))
}
