import { IRoom } from './interfaces/room-data';
import { IPlayerLogin } from './interfaces/player-data';

export function createRoom(userId: number, users: IPlayerLogin[], rooms: IRoom[]): void {
  const name: string = users.find(((player)=> player.id === userId))?.name as string;
  const room: IRoom = {
    roomId: rooms.length + 1, roomUsers: [{ index: userId, name }]
  }
  rooms.push(room);
}
