import { IShip } from '../interfaces/ships-data';

export interface IGamesData {
  gameId: number,
  players: IGamePlayer[],
  currentPlayer: number,
}

export interface IGamePlayer {
  playerId: number,
  ships: IShip[],
  matrix: boolean[][]
}
