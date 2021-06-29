import { model, Schema } from 'mongoose';
import { IUser } from './type';

const sectionSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    disable: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IUser>('user', sectionSchema);
