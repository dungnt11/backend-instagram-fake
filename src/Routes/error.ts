import { Context, Next } from 'koa';
import dotenv from 'dotenv';

dotenv.config();
const { NODE_ENV } = process.env;

export default () => async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    const errCode = error.status || 500;
    ctx.status = errCode;
    const isDev = NODE_ENV === 'development';
    const errorName = isDev ? error.toString() : 'Server error, contact: nihilism.core@gmail.com, thank you so much ♥️';

    ctx.status = errCode;
    ctx.body = { msg: errorName };
  }
};
