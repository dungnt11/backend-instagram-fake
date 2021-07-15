import { model, Schema } from 'mongoose';
import { IPost } from './type';

const postSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    image: { type: String, default: '' },
    status: { type: String, default: '' },
    width: { type: Number, require: true },
    height: { type: Number, require: true },
    likes: { type: Array, default: [] },
    comments: { type: Array, default: [] },
    type: String,
  },
  { timestamps: true },
);

export default model<IPost>('post', postSchema);
