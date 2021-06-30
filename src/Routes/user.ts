import { Context } from 'koa';
import Router from 'koa-router';
import path from 'path';
import { execSync } from 'child_process';

import UserModel from '../models/user';
import { TUser } from '../models/user/type';

const router = new Router({ prefix: '/api' });

router.post('/register', async (ctx: Context) => {
  const { username, password } = ctx.request.body as TUser;
  const newUser = new UserModel({ username, password });
  const userCreated = await newUser.save();

  ctx.body = {
    user: userCreated,
  }
});

router.post('/login', async (ctx: Context) => {
  const { username, password } = ctx.request.body as TUser;
  const userDB = await UserModel.findOne({ username }).lean();
  if (!userDB) ctx.throw(404);
  if (userDB.password !== password) ctx.throw(404);
  ctx.status = 200;
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

router.get('/feeds', async (ctx: Context) => {
  ctx.body = [
    {
      url: 'https://1.bp.blogspot.com/-TljPpu4GhJM/YMbOCIkIgZI/AAAAAAADY0A/ifHPvTAIhJk-FE8II60oLgbnH-rSNYNNgCLcBGAsYHQ/s0/194622921_1821273241389552_3258353319147754296_n.jpg',
      username: 'Nguyen Dung',
      likes: 250,
      id: "1",
      comments: {
        count: 20,
      }
    },
  ]
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
  if (files) {
    const dirSaveFile = path.join(__dirname, '/../../public');
    execSync(`mv ${files.file.path} ${dirSaveFile}/${files.file.name}`);
  }
  console.log(body, files);
});

export { router };