import {deleteFileOnFail} from '../../mw/deleteFileOnFail';
import {roleGuard} from '../../mw/guards';
import {getMe} from '../../mw/me';
import {DocRouter} from '../../utils/router';
import {createArticle, getArticleById, getAllArticles, updateArticles, deleteArticle} from './articles.service';

const router = new DocRouter({prefix: '/articles', name: 'Articles'});

router.$('POST /',
  {
    summary: 'Insert a article post linked to a medium',
    description: 'Middleware: getMe, adminGuard, deleteFileOnFail',
    body: {
      image: {
        summary: 'The thumbnail of the article',
        required: true,
      },
      article: {
        summary: 'The article post',
        required: true,
      },
    },
  },
  getMe(), roleGuard(), deleteFileOnFail,
  async ctx => {
    ctx.request.body.article = JSON.parse(ctx.request.body.article);
    ctx.body = await createArticle(ctx.request.body.article, ctx.request.files.image.path, ctx.state.user);
  },
);

router.$('GET /',
  {
    summary: 'Gets all articles',
  },
  async ctx => {
    ctx.body = await getAllArticles();
  },
);

router.$('GET /{id}',
  {
    summary: 'Gets a single article by its ID',
    params: {
      id: {
        description: 'the ID of the article',
        required: true,
      },
    },
  },
  async ctx => {
    ctx.body = await getArticleById(ctx.params.id);
  },
);


router.$('PUT /',
  {
    summary: 'Updates a article',
    description: 'Middleware: getMe, adminGuard',
    body: {
      article: {
        summary: 'The article entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    if (ctx.request.body.article.id) ctx.body = await updateArticles(ctx.request.body.article);
    ctx.throw(400);
  },
);

router.$('DELETE /{id}',
  {
    summary: 'Deletes a article post by its ID',
    description: 'Middleware: getMe, adminGuard',
    params: {
      id: {
        summary: 'The ID of the article',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await deleteArticle(ctx.params.id);
  },
);

export default router;
