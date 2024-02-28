import { WebSocketServer, WebSocket } from 'ws';
import { IPlayerLogin } from '../interfaces/player-data';
import { IRoom, IRoomIndex } from '../interfaces/room-data';
import { IAttack, IGameShips, IRandomAttack } from '../interfaces/ships-data';
import { IGamePlayer, IGamesData } from '../interfaces/games-data';
import { IWinsData } from '../interfaces/wins-data';
import { registerPlayer } from '../player';
import {createMatrix} from '../matrix';
import { createRoom } from '../room';

const wss = new WebSocketServer({port: 3000});
const users: IPlayerLogin[] = [];
const rooms: IRoom[] = [];
const games: IGamesData[] = [];
const wins: IWinsData[] = [];
let id = 0;
const wsMap: Map<number, WebSocket> = new Map();

wss.on('connection', (ws): void => {
  id = id + 1;
  const userId: number = id;
  wsMap.set(userId, ws);
  ws.on('message', (data: string): void => {
    const requestData = JSON.parse(data.toString())
    switch (requestData.type) {
      case 'reg':
        registerPlayer(ws, JSON.parse(requestData.data), userId, users);
        updateRoom()
        updateWinners();
        break;
      case 'create_room':
        createRoom(userId, users, rooms);
        updateRoom();
        break
      case 'add_user_to_room':
        addUserToRoom(JSON.parse(requestData.data), userId)
        updateRoom();
        createGame(JSON.parse(requestData.data), userId);
        break
      case 'add_ships':
        addShips(JSON.parse(requestData.data));
        break
      case 'attack':
        attack(JSON.parse(requestData.data));
        turn(JSON.parse(requestData.data));
        break
      case 'randomAttack':
        break
      case 'finish':
        finishGame(ws, JSON.parse(requestData.data));
        updateWinners()
        break
      default:
        break
    }
  })
})

function updateWinners(): void {
  const responseData = JSON.stringify(wins)
  const response = {
    type: "update_winners",
    data: responseData,
    id: 0,
  }
  wss.clients.forEach((ws) => {
    ws.send(JSON.stringify(response))
  })
}

function createGame(data: IRoomIndex, userId: number): void {
  const players: IGamePlayer[] = rooms.find((room => room.roomId === data.indexRoom))?.roomUsers
    .map((p)=> ({playerId: p.index, ships: [], matrix:[]})) as IGamePlayer[]
  games.push({
    gameId: games.length + 1,
    players,
    currentPlayer: userId
  })
  // console.log(games, '@games');
  players.forEach(p=> {
    const responseData = JSON.stringify({
      idGame: games.length,
      idPlayer: p.playerId
    })
    const response = {
      type: "create_game",
      data: responseData,
      id: 0,
    }
    wsMap.get(p.playerId)?.send(JSON.stringify(response))
  })
}

function updateRoom(): void {
  const responseData = JSON.stringify(rooms)
  const response = {
    type: "update_room",
    data: responseData,
    id: 0,
  }
  // console.log(JSON.stringify(rooms), '@ROOMS')
  wss.clients.forEach((ws) => {
    ws.send(JSON.stringify(response))
  })
}

function addUserToRoom(data: IRoomIndex, userId: number): void {
 const user = users.find(u => u.id === userId) as IPlayerLogin;
 const room = rooms.find(r => r.roomId === data.indexRoom) as IRoom;
 if (!room.roomUsers.find(u => u.index === userId)){
   room.roomUsers.push({name: user.name, index: user.id})
 }
 // console.log(JSON.stringify(room), userId, '@addUserToRoom')
}

function addShips(data: IGameShips): void {
  const game = games.find((g) => g.gameId === data.gameId) as IGamesData;
  const player = game.players.find(p => p.playerId === data.indexPlayer) as IGamePlayer;
  player.ships = data.ships;
  // console.log(data.indexPlayer, JSON.stringify(player), '@ GAME player')
  if(game.players.every(p => {
    return p.ships.length;})) {
    startGame(data.gameId);
  }
  player.matrix = createMatrix(data.ships);
}

function startGame(gameId: number): void {
  const game = games.find((g) => g.gameId === gameId) as IGamesData;
  game.players.forEach(p => {
    const responseData = JSON.stringify({
      ships: p.ships,
      currentPlayerIndex: p.playerId
    })
    const response = {
      type: "start_game",
      data: responseData,
      id: 0,
    }
    wsMap.get(p.playerId)?.send(JSON.stringify(response));
  })
}
function attack(data: IAttack): void {
  let status = '';
  const game = games.find((g) => g.gameId === data.gameId) as IGamesData;
  const player = game.players.find(p => p.playerId !== data.indexPlayer) as IGamePlayer;
  if (player.matrix[data.x][data.y]) {
    status = 'shot'
  } else {
    status = 'miss'
  }
  game.players.forEach(player => {
    const responseData = JSON.stringify({
      position: {
        x: data.x,
        y: data.y,
      },
      currentPlayer: data.indexPlayer,
      status
    })
    const response = {
      type: "attack",
      data: responseData,
      id: 0,
    }
    wsMap.get(player.playerId)?.send(JSON.stringify(response))
  });
}

function randomAttack(data: IRandomAttack): void {
}

function turn(data: IAttack): void {
  const game: IGamesData = games.find((g) => g.gameId === data.gameId) as IGamesData;
  game.currentPlayer = game.players.find(p => p.playerId !== data.indexPlayer)?.playerId as number;
  game.players.forEach(player => {
    const responseData: string = JSON.stringify({
      currentPlayer: game.currentPlayer
    })
    const response = {
      type: "turn",
      data: responseData,
      id: 0,
    }
    wsMap.get(player.playerId)?.send(JSON.stringify(response))
  })
}

function finishGame(ws: WebSocket, data: IAttack): void {
  const game: IGamesData = games.find((g) => g.gameId === data.gameId) as IGamesData;
  game.currentPlayer = game.players.find(p => p.playerId === data.indexPlayer)?.playerId as number;
  const roomPlayerName = rooms.map(r=> {
     return r.roomUsers.find(u => (u.index === data.indexPlayer))?.name as string
  })
  wins.push({
    name: roomPlayerName[0],
    wins: wins.length + 1
  })
  game.players.forEach(player => {
    const responseData = JSON.stringify({
      winPlayer: game.currentPlayer
    })
    const response = {
      type: "finish",
      data: responseData,
      id: 0,
    }
    wsMap.get(player.playerId)?.send(JSON.stringify(response))
  })
}

wss.on('listening', () => {
  console.log('WebSocket server started')
})

wss.on('close', () => {
  console.log('WebSocket server closed')
})
