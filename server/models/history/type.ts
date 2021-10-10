import { Document } from 'mongoose';

type THistoryBase = {
  myID: string,
  toID: string,
  messenger: string,
}

export type THistory = Document & THistoryBase;
