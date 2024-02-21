export interface IShipsData {
  type: string,
  data: IGameShips,
  id: number
}

export interface IGameShips {
  gameId: number,
  ships: IShip[],
  indexPlayer: number
}

export  interface IShip {
  position: {
    x: number,
    y: number
  },
  direction: boolean,
  length: number,
  type: "small"|"medium"|"large"|"huge"
}
