import { model, Schema } from 'mongoose';
import { IUser } from './type';

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    disable: { type: Boolean, default: false },
    displayName: { type: String, required: true },
    avatar: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Aw08EMIINuHN2E_m6rmNBJSn9pdAUsNBKrjMc8SQKeeNjJ_rYdUUGq2QZP3R87Seg_c&usqp=CAU' },
  },
  { timestamps: true },
);

export default model<IUser>('user', userSchema);
