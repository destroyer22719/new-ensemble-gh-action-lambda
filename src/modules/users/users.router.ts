/* eslint-disable @typescript-eslint/require-await */
import {getMe} from '../../mw/me';
import {loggedInGuard, roleGuard} from '../../mw/guards';
import {DocRouter} from '../../utils/router';
import {clearSchool, deleteUserById, getUserById, updateUser} from './users.service';
const router = new DocRouter({name: 'Users'});

router.$('GET /me',
  {
    summary: 'Gets the current user using the Authorization header',
    description: 'Middleware: getMe, loggedInGuard',
  },

  getMe(['subscribedCategories']), loggedInGuard,
  async ctx => {
    ctx.body = ctx.state.user;
  },
);

router.$('GET /users/{id}',
  {
    summary: 'Get a user by id',
    description: 'Middlewares: getMe, loggedInGuard',
    params: {
      id: {
        summary: 'The user id',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await getUserById(ctx.params.id);
  },
);

router.$('DELETE /users/{id}',
  {
    summary: 'Deletes a user by id',
    description: 'Middlewares: getMe, adminGuard',
    params: {
      id: {
        summary: 'The user id',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await deleteUserById(ctx.params.id);
  },
);

router.$('PUT /users',
  {
    summary: 'Updates a user by id',
    description: 'Middleware: getMe, adminGuard',
    body: {
      user: {
        summary: 'The user entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await updateUser(ctx.request.body.user);
  },
);

router.$('PUT /users/clear-school',
  {
    summary: 'Updates a user by id',
    description: 'Middleware: getMe, adminGuard',
    body: {
      user: {
        summary: 'The user entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await clearSchool(ctx.request.body.user);
  },
);

export default router;
