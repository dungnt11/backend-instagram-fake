import next from 'next';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import formidable from 'koa2-formidable';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import protecedRouter from './Routes/user';

dotenv.config();

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_CONNECTSTRING,
  PORT,
} = process.env;

const server = new Koa();
const router = new Router();
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const handler = nextApp.getRequestHandler();

/** middleware */
server.use(formidable());
server.use(bodyParser());

(async () => {
  try {
    await nextApp.prepare();

    server
      .use(protecedRouter.routes())
      .use(protecedRouter.allowedMethods());

    router.get('(.*)', async (ctx) => {
      await handler(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    });

    server.use(router.routes());

    await mongoose
      .connect(
        MONGO_CONNECTSTRING,
        {
          user: MONGO_USER,
          pass: MONGO_PASSWORD,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true,
        },
      );

    server.listen(PORT, () => {
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit();
  }
})();
