import { Document } from 'mongoose';

export type TPost = {
  userID: string,
  image: string,
  status: string,
  width: number,
  height: number,
  likes: number,
  comments: {
    displayName: string,
    comment: string,
    idUser: string,
  }[],
};

export type IPost = Document & TPost;
