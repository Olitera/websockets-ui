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
  indexRoom: number
}
