import { Document } from 'mongoose';

export type TUser = {
  email: string,
  password: string,
  displayName: string,
  avatar: string,
  isAdmin: boolean,
  isDisable: boolean,
};

export type IUser = Document & TUser;
