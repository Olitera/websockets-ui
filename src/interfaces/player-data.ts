import exp from 'constants';

export interface IPlayerData {
  type: string,
  data: IPlayerLogin,
  id: number
}

export interface IPlayerLogin {
  name: string,
  password: string
}

