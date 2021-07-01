import { Context } from 'koa';
import Router from 'koa-router';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

import UserModel from '../models/user';
import PostModel from '../models/post';
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
  }
});

router.post('/login', async (ctx: Context) => {
  const { email, password } = ctx.request.body as TUser;
  const userDB = await UserModel.findOne({ email }).lean();
  if (!userDB) ctx.throw(404);
  if (userDB.password !== password) ctx.throw(404);
  ctx.status = 200;
  ctx.body = {
    _id: userDB._id,
    email: userDB.email,
    displayName: userDB.displayName,
    avatar: userDB.avatar,
  }
});

router.get('/comments/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  console.log(id);
  ctx.body = [
    {
      id: "12",
      from: { username: 'Trung Tran' },
      text: 'Xinh quá em ơi!',
    },
    {
      id: "13",
      from: { username: 'Hoan' },
      text: 'Vẫn thua em Duyên đô mi',
    },
  ]
});

router.get('/feeds/:idUser', async (ctx: Context) => {
  const { idUser } = ctx.params;
  console.log(idUser);
  const postUser = await PostModel.find().lean();
  if (!postUser) ctx.throw(404);

  const postsCreate = [];

  await Promise.all(postUser.map(async (userItem) => {
    const userDB = await UserModel.findById(userItem.userID).lean();
    if (userDB) {
      postsCreate.push({
        url: `${process.env.TUNNEL_URL}/${userItem.image}`,
        username: userDB.displayName,
        avatar: userDB.avatar,
        status: userItem.status,
        likes: userItem.likes,
        id: userItem._id,
        comments: { count: userItem.comments.length }
      });
    }
  }));
  ctx.body = postsCreate;
});

router.get('/users/self', async (ctx: Context) => {
  ctx.body = {
    profile_picture: 'https://1.bp.blogspot.com/-G8ph08uwTjU/YMbODHIrlJI/AAAAAAADY0M/YOzzvz4QF7I--LePsqivHt6oVtj-vLi9ACLcBGAsYHQ/s0/199117336_1821273348056208_1432593509381551511_n.jpg',
    data: [
      { url: 'https://1.bp.blogspot.com/-G8ph08uwTjU/YMbODHIrlJI/AAAAAAADY0M/YOzzvz4QF7I--LePsqivHt6oVtj-vLi9ACLcBGAsYHQ/s0/199117336_1821273348056208_1432593509381551511_n.jpg' }
    ]
  }
});

router.post('/create-post', async (ctx: Context) => {
  const { body, files } = ctx.request as any;
  if (!body._id) ctx.throw(404);
  const userDB = await UserModel.findById(body._id).lean();

  if (files) {
    const dirSaveFile = path.join(__dirname, '/../../public');
    execSync(`mv ${files.file.path} ${dirSaveFile}/${files.file.name}`);

    const postContent = {
      userID: userDB._id,
      image: files.file.name,
      status: body.status,
      width: body.width,
      height: body.height,
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

export { router };