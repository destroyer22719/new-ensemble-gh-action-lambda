import {Middleware} from 'koa';

import * as jwt from 'jsonwebtoken';
import {CTX, STATE} from '../utils/ctx';
import {DB} from '../utils/db';
import {User} from '../entities/User';

export const getMe: (relations?: string[]) => Middleware<STATE, CTX> = relations => async (ctx, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
    ctx.state.user = await DB.repo(User).findOne({where: {id: process.env.DEV_USER_ID}, relations});
    await next();
    return;
  }

  const rawjwt = ctx.headers.authorization?.split(' ')[1];
  if (rawjwt) {
    const payload = jwt.verify(rawjwt, process.env.JWT_SECRET) as {id: string};
    ctx.state.user = await DB.repo(User).findOne({where: {id: payload.id}, relations});
  }
  await next();
};


