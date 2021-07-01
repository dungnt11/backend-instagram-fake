import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
// @ts-ignore
import formidable from 'koa2-formidable';
import koaStatic from 'koa-static';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router } from './Routes/user';
import errorHandle from './Routes/error';

dotenv.config();

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_CONNECTSTRING,
  PORT,
} = process.env;

const server = new Koa();

/** middleware */
server.use(formidable());
server.use(bodyParser());
server.use(koaStatic('public', {}));

server.use(errorHandle());
server.use(router.routes());

mongoose
  .connect(
    MONGO_CONNECTSTRING!,
    {
      user: MONGO_USER!,
      pass: MONGO_PASSWORD!,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
  )
  .then(() => {
    server.listen(PORT, () => {
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });