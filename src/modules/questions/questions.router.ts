import {getMe} from '../../mw/me';
import {loggedInGuard, roleGuard} from '../../mw/guards';
import {deleteFileOnFail} from '../../mw/deleteFileOnFail';
import {createQuestionWithoutMedium, getUnverifiedQuestions, updateQuestion, getFeed, createQuestionsWithMedium, getMediumWithQuestions, createQuestionAnswers, getVerifiedQuestions, deleteQuestionById, getQuestionById} from './questions.service';
import {MediumPassage, MediumPhoto} from '../../entities/Medium';
import {DocRouter} from '../../utils/router';
const router = new DocRouter({prefix: '/questions', name: 'Questions'});

// submit

router.$('POST /',
  {
    summary: 'Inserts a single Question OR multiple Questions linked to a Medium',
    description: `
      **Use from-data for this request!**
      The request accepts a single optional image.
      Middleware: getMe, loggedInGuard, deleteFileOnFail    
    `,
    body: {
      passage: {
        summary: 'The MediumPassage entity',
      },
      questions: {
        summary: 'The Questions linked to the Medium',
      },
      question: {
        summary: 'The single Question',
      },
    },
  },
  getMe(), roleGuard(['teacher']), deleteFileOnFail,
  async ctx => {
    if (ctx.request.body.passage)
      ctx.body = await createQuestionsWithMedium('passage',
        ctx.request.body.passage as MediumPassage,
        ctx.request.body.questions,
        ctx.state.user,
      );
    else if (ctx.request.files.image) {
      ctx.request.body.questions = JSON.parse(ctx.request.body.questions);
      ctx.body = await createQuestionsWithMedium('photo', {
        path: ctx.request.files.image.path,
      } as MediumPhoto,
      ctx.request.body.questions,
      ctx.state.user);
    } else
      ctx.body = await createQuestionWithoutMedium(ctx.request.body.question, ctx.state.user);
  },
);

router.$('POST /answers',
  {
    summary: 'Inserts QuestionAnswer entities',
    description: 'Middleware: getMe, adminGuard',
    body: {
      questionAnswers: {
        summary: 'An array of QuestionAnswer entities',
        required: true,
      },
    },
    bodyExamples: {
      'single answer': {
        questionAnswers: [
          {
            isCorrect: true,
            answeredBy: {
              id: 12345,
            },
            question: {
              id: 67890,
            },
          },
        ],
      },
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await createQuestionAnswers(ctx.request.body.questionAnswers, ctx.state.user);
  },
);

router.$('PUT /',
  {
    summary: 'Updates a Question',
    description: 'Middleware: getMe(), adminGuard',
    body: {
      question: {
        summary: 'The Question entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    if (ctx.request.body.question.id)
      ctx.body = await updateQuestion(ctx.request.body);
    else ctx.throw(400);
  },
);

router.$('GET /unverified',
  {
    summary: 'Gets ALL unverified Questions',
    description: 'Middleware: getMe(), adminGuard',
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await getUnverifiedQuestions();
  },
);

router.$('GET /verified',
  {
    summary: 'Gets ALL verified Questions',
    description: 'Middleware: getMe, adminGuard',
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await getVerifiedQuestions();
  },
);

router.$('GET /feed',
  {
    summary: 'Gets the random feed',
    query: {
      page: {
        description: 'The feed page',
        required: true,
      },
      seed: {
        description: 'The seed for the RNG',
        required: true,
      },
      category: {},
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await getFeed(ctx.request.query, ctx.state.user);
  },
);

router.$('GET /medium/{id}',
  {
    summary: 'Gets the given Medium and all Questions that are linked to it',
    params: {
      id: {
        description: 'The ID of the medium',
        required: true,
      },
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await getMediumWithQuestions(ctx.params.id);
  },
);

router.$('GET /single/{id}',
  {
    summary: 'Gets a single Question by its ID',
    params: {
      id: {
        description: 'the ID of the question',
        required: true,
      },
    },
  },
  getMe(), loggedInGuard,
  async ctx => {
    ctx.body = await getQuestionById(ctx.params.id);
  },
);

router.$('DELETE /{id}',
  {
    summary: 'Deletes a Question by its ID',
    params: {
      id: {
        description: 'the ID of the question',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await deleteQuestionById(ctx.params.id);
  },
);
export default router;
