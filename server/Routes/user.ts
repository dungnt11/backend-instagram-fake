import { Context } from 'koa';
import { Types } from 'mongoose';
import Router from 'koa-router';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

import UserModel from '../models/user';
import PostModel from '../models/post';
import HistoryModel from '../models/history';
import { TUser } from '../models/user/type';

const router = new Router({ prefix: '/api' });
dotenv.config();

router.post('/register', async (ctx: Context) => {
  const {
    email,
    password,
    displayName,
    avatar,
  } = ctx.request.body as TUser;
  const newUser = new UserModel({
    email,
    password,
    displayName,
    avatar,
  });
  const userCreated = await newUser.save();
  ctx.status = 200;

  ctx.body = {
    _id: userCreated._id,
    email,
    displayName,
    avatar: userCreated.avatar,
  };
});

router.post('/login', async (ctx: Context) => {
  const { email, password, isAdmin } = ctx.request.body as TUser;
  const userDB = await UserModel.findOne({ email }).lean();
  if (!userDB) ctx.throw(404);
  if (userDB.password !== password) ctx.throw(404);
  if (userDB.isDisable) ctx.throw(404);
  if (typeof isAdmin !== 'undefined' && !userDB.isAdmin) ctx.throw(404);
  ctx.status = 200;
  ctx.body = {
    _id: userDB._id,
    email: userDB.email,
    displayName: userDB.displayName,
    avatar: userDB.avatar,
  };
});

router.get('/users', async (ctx: Context) => {
  const usersDB = await UserModel.find().lean();
  if (!usersDB) ctx.throw(404);
  ctx.status = 200;
  ctx.body = usersDB;
});

router.get('/all-post', async (ctx: Context) => {
  const postDB = await PostModel.find();
  ctx.body = postDB;
});

router.get('/comments/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  const postDB = await PostModel.findById(id).select(['comments']).lean();
  const contentComment = [];

  await Promise.all(postDB.comments.map(async (postItem) => {
    const userDBItem = await UserModel.findById(postItem.idUser).lean();
    const commentObj = {
      from: {
        id: userDBItem._id,
        displayName: userDBItem.displayName,
        avatar: userDBItem.avatar,
      },
      text: postItem.comment,
    };
    contentComment.push(commentObj);
  }));

  ctx.body = contentComment;
});

router.get('/feeds/:idUser', async (ctx: Context) => {
  const postUser = await PostModel.find().lean();
  if (!postUser) ctx.throw(404);

  const postsCreate = [];

  await Promise.all(postUser.reverse().map(async (userItem) => {
    const userDB = await UserModel.findById(userItem.userID).lean();
    if (userDB) {
      postsCreate.push({
        url: `${process.env.TUNNEL_URL}/${userItem.image}`,
        username: userDB.displayName,
        avatar: userDB.avatar,
        status: userItem.status,
        type: userItem.type,
        likes: userItem.likes,
        id: userItem._id,
        userID: userItem.userID,
        comments: { count: userItem.comments.length },
      });
    }
  }));
  ctx.body = postsCreate;
});

router.get('/users/self/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  const UserDB = await UserModel.findById(id).lean();
  const postsDB = await PostModel.find({ userID: Types.ObjectId(id) }).lean();
  if (UserDB) {
    ctx.body = {
      profile_picture: UserDB.avatar,
      data: postsDB.map((postItem) => ({
        ...postItem,
        image: `${process.env.TUNNEL_URL}/${postItem.image}`,
      })),
    };
  }
});

router.get('/test', async (ctx: Context) => {
  ctx.body = 'Hello world!';
});

router.post('/create-post', async (ctx: Context) => {
  const { body, files } = ctx.request as any;
  if (!body._id) ctx.throw(404);
  const userDB = await UserModel.findById(body._id).lean();

  if (!userDB) ctx.throw(404);

  if (files) {
    const dirSaveFile = path.join(__dirname, '/../../server/public');
    execSync(`mv ${files.file.path} ${dirSaveFile}/${files.file.name}`);

    const postContent = {
      userID: userDB._id,
      image: files.file.name,
      status: body.status,
      width: body.width,
      height: body.height,
      type: body.type,
    };

    const postDB = new PostModel(postContent);

    const postDBCreated = await postDB.save();

    ctx.body = Object.assign(postContent, {
      _id: postDBCreated._id,
      image: `${process.env.TUNNEL_URL}/${files.file.name}`,
      updatedAt: (postDBCreated as any).updatedAt,
    });
  }
});

router.get('/reaction/:idPost/:idUser', async (ctx: Context) => {
  const { idPost, idUser } = ctx.params;
  const postDB = await PostModel.findById(idPost).lean();
  if (!postDB) ctx.throw(404);

  if (postDB.likes.includes(idUser)) {
    // dislike
    const newPostLikeDB = postDB.likes.filter((postID) => postID !== idUser);
    await PostModel.findByIdAndUpdate(idPost, { likes: newPostLikeDB });
  } else {
    const newPostLikeDB = postDB.likes.concat([idUser]);
    await PostModel.findByIdAndUpdate(idPost, { likes: newPostLikeDB });
    // history
    await HistoryModel.findOneAndUpdate({
      myID: String(idUser),
      toID: String(postDB.userID),
    },
    {
      myID: idUser,
      toID: String(postDB.userID),
      messenger: 'Đã thích bài viết của bạn',
    },
    { upsert: true },
    );
  }
  
  ctx.status = 200;
});

router.post('/comment/:idPost/:idUser', async (ctx: Context) => {
  const { idPost, idUser } = ctx.params;
  const { comment } = ctx.request.body as { comment: string };
  const commentObj = {
    comment,
    idUser,
  };

  const postDBUpdate = await PostModel.findByIdAndUpdate(idPost, { $push: { comments: commentObj } }, { new: true });
  const contentComment = [];

  await Promise.all(postDBUpdate.comments.map(async (postItem) => {
    const userDBItem = await UserModel.findById(postItem.idUser).lean();
    const commentObjPush = {
      from: {
        id: userDBItem._id,
        displayName: userDBItem.displayName,
        avatar: userDBItem.avatar,
      },
      text: postItem.comment,
    };
    contentComment.push(commentObjPush);
  }));

  // history
  await HistoryModel.findOneAndUpdate({
    myID: String(idUser),
    toID: String(postDBUpdate.userID),
  },
  {
    myID: idUser,
    toID: String(postDBUpdate.userID),
    messenger: 'Đã comment bài viết của bạn',
  },
  { upsert: true },
  );

  ctx.body = contentComment;
});

router.get('/video/:url', async (ctx: Context) => {
  const { url } = ctx.params;
  const src = fs.createReadStream(`/home/dung/instagram-app/public/${url}`);
  const videoSize = fs.statSync(`/home/dung/instagram-app/public/${url}`);
  ctx.status = 304;
  console.log(videoSize.size);
  ctx.header['content-length'] = String(videoSize.size);
  ctx.body = src;
});

router.post('/user-admin', async (ctx: Context) => {
  const { email, password } = ctx.request.body as { email: string, password: string };
  const userDB = await UserModel.findOne({ email, isAdmin: true, password }).lean();

  if (!userDB) ctx.throw(404);

  if (userDB) {
    ctx.status = 200;
  }
});

router.get('/toggle-user/:idUser', async (ctx: Context) => {
  const { idUser } = ctx.params as { idUser: string };
  const currentUserDB = await UserModel.findById(idUser).lean();

  const userDB = await UserModel.findByIdAndUpdate(idUser, { isDisable: !currentUserDB.isDisable }, { new: true });
  ctx.body = userDB;
});

router.get('/friend', async (ctx: Context) => {
  const allUser = await UserModel.find().select(['avatar', 'displayName']).lean();

  ctx.body = allUser;
});

router.get('/history/:id', async(ctx: Context) => {
  const id = ctx.params.id;
  const historyByID = await HistoryModel.find({
    toID: id,
  })
  .populate('myID', 'displayName avatar', UserModel)
  .populate('toID', 'displayName avatar', UserModel);
  ctx.body = historyByID;
});

export default router;
