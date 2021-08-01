import { Types } from 'mongoose';

export type TPost = {
  userID: Types.ObjectId,
  image: string,
  status: string,
  width: number,
  height: number,
  likes: string[],
  comments: {
    comment: string,
    idUser: string,
  }[],
  type: 'video' | 'image',
};
