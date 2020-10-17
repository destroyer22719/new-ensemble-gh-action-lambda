import {getMe} from '../../mw/me';
import {loggedInGuard, roleGuard} from '../../mw/guards';
import {createCategory, deleteCategory, getCategories, getCategoryById, subscribeToCategory, unsubscribeFromCategory, updateCategory} from './categories.service';
import {DocRouter} from '../../utils/router';
const router = new DocRouter({prefix: '/categories', name: 'Categories'});

// submit
router.$('POST /',
  {
    summary: 'Inserts a Category',
    description: 'Middleware: getMe, adminGuard',
    body: {
      category: {
        summary: 'The Category',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await createCategory(ctx.request.body.category);
  },
);

router.$('GET /',
  {
    summary: 'Gets ALL Categories',
    description: 'Middleware: getMe, loggedInGuard',
    query: {
      roots: {
        description: 'Gets only the roots instead',
      },
      notSubscribed: {
        description: 'Gets only the categories this user has not subscribed to',
      },
    },
  },
  getMe(['subscribedCategories']), loggedInGuard,
  async ctx => {
    ctx.body = await getCategories(
      ctx.query.roots === 'true',
      ctx.query.notSubscribed === 'true', ctx.state.user,
    );
  },
);


router.$('GET /single/{id}',
  {
    summary: 'Gets a single category by its ID',
    params: {
      id: {
        description: 'the ID of the category',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await getCategoryById(ctx.params.id);
  },
);

router.$('PUT /',
  {
    summary: 'Get a category by id and updates',
    description: 'Middleware: getMe, adminGuard',
    body: {
      category: {
        summary: 'The Category entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    if (ctx.request.body.category.id)
      ctx.body = await updateCategory(ctx.request.body.category);
    else ctx.throw(400);
  },
);

router.$('DELETE /{id}',
  {
    summary: 'Delete a category by id',
    description: 'Middleware: getMe, adminGuard',
    params: {
      id: {},
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await deleteCategory(ctx.params.id);
  },
);

router.$('POST /subscription/{id}',
  {
    summary: 'Subscribes to a give category id',
    description: 'Middleware: getMe, loggedIn',
    params: {
      id: {
        description: 'The id that the user will subscribe to',
        required: true,
      },
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await subscribeToCategory(ctx.params.id, ctx.state.user);
  },
);

router.$('DELETE /subscription/{id}',
  {
    summary: 'Deletes a subscription from a category',
    description: 'Middleware: getMe, loggedIn',
    params: {
      id: {
        description: 'The id of the category to unsubscribe from',
        required: true,
      },
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await unsubscribeFromCategory(ctx.params.id, ctx.state.user);
  },
);

export default router;
