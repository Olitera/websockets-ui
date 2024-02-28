import { IShip } from './interfaces/ships-data';

export function createMatrix(ships: IShip[]): boolean[][] {
  const gameBoard: boolean[][] = Array.from({length: 10}, () => Array(10).fill(false));
  const coordinates: { x: number, y: number}[] = [];
  ships.forEach(ship => {
    if(ship.direction) {
      for(let y = 0; y < ship.length; y++) {
        coordinates.push({x: ship.position.x, y: y + ship.position.y })
      }
    } else {
      for(let x = 0; x < ship.length; x++) {
        coordinates.push({x: x + ship.position.x, y: ship.position.y})
      }
    }
  })
  coordinates.forEach(coordinate => gameBoard[coordinate.x][coordinate.y] = true);
  return gameBoard
}
