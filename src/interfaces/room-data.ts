import { IPlayerLogin } from '../interfaces/player-data';

export interface IRoomData {
  type: string,
  data: string,
  id: number
}

export interface IUserToRoom {
  type: string,
  data: IRoomIndex,
  id: number
}

export interface IRoomIndex {
  indexRoom: number,
  users: { id: number }[]
}

export interface IRoom {
  roomId: number,
  roomUsers:
    [
      {
        name: string,
        index: number,
      }
    ],
}
