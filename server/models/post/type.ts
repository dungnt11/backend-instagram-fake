import { Document } from 'mongoose';
import { TPost } from 'src/type/post';

export type IPost = Document & TPost;
