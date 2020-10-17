import {getMe} from '../../mw/me';
import {DocRouter} from '../../utils/router';
import {getTest} from './tests.service';

const router = new DocRouter({prefix: '/tests', name: 'Tests'});

router.$('GET /generate/{id}',
  {
    summary: 'Creates a test based on the provided category',
    description: 'Middleware: getMe, loggedInGuard',
    params: {
      id: {
        description: 'The id of the test category',
        required: true,
      },
    },
  },
  getMe(),
  async ctx => {
    ctx.body = await getTest(ctx.params.id);
  },
);

export default router;
