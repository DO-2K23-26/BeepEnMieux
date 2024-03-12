export type User = UserModel;

export class UserModel {
  id: string
  pseudo: string
  socketId?: string

  /*password: string;*/
}