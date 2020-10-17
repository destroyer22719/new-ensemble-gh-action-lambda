import {Middleware} from 'koa';
import {CTX, STATE} from '../utils/ctx';
import * as fs from 'fs';

export const deleteFileOnFail: Middleware<STATE, CTX> = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (ctx.request.files?.image?.path)
      await fs.promises.unlink(ctx.request.files.image.path);

    throw err;
  }
};
