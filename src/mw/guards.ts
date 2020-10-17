import {Middleware} from 'koa';
import {CTX, STATE} from '../utils/ctx';

export const loggedInGuard: Middleware<STATE, CTX> = async (ctx, next) => {
  if (ctx.state.user) await next();
  else
    ctx.throw(401);
};

export const roleGuard: (roles?: string[]) => Middleware<STATE, CTX> = (roles = []) => async (ctx, next) => {  
  if (roles.includes(ctx.state.user?.role) || ctx.state.user?.role === 'admin')
    await next();
  
  else
    ctx.throw(401);
};
