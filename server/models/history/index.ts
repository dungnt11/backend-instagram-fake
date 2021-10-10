import { model, Schema } from 'mongoose';
import { THistory } from './type';

const historySchema = new Schema(
  {
    myID: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    toID: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    messenger: String,
  },
  { timestamps: true },
);

export default model<THistory>('history', historySchema);
