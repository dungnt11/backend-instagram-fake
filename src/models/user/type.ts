import { Document } from 'mongoose';

export type TUser = {
  username: string,
  password: string,
};

export type IUser = Document & TUser;
