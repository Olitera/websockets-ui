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

export interface IAttackData {
  type: string,
  data: IAttack,
  id: number
}

export interface IAttack {
  gameId: number,
  x: number,
  y: number,
  indexPlayer: number
}
