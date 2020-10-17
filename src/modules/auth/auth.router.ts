import {facebook, local} from './auth.service';
import {DocRouter} from '../../utils/router';
const router = new DocRouter({prefix: '/auth', name: 'Auth'});

router.$('POST /facebook',
  {
    summary: 'Gets/Creates user profile and returns a JWT',
  },
  async ctx => {
    ctx.body = await facebook(ctx.request.body);
  },
);

router.$('POST /local/signup',
  {
    summary: 'signup a user with local login',
    description: '',
    body: {
      user: {
        summary: 'user signup data',
        required: true,
      },
    },
  },
  async ctx => {
    ctx.body = await local.signup(ctx.request.body.user);
  },
);

router.$('POST /local/login',
  {
    summary: 'login a user with local login',
    description: '',
    body: {
      user: {
        summary: 'user login data',
        required: true,
      },
    },
  },
  async ctx => {
    ctx.body = await local.login(ctx.request.body.user);
  },
);

export default router;
