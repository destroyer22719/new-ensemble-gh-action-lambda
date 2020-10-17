import {getMe} from '../../mw/me';
import {DocRouter} from '../../utils/router';
import {createSchool, deleteSchool, getStudentsFromSchool, updateSchool} from './schools.service';
import {roleGuard} from '../../mw/guards';

const router = new DocRouter({prefix: '/schools', name: 'Schools'});

router.$('POST /',
  {
    summary: 'Add a school to the database',
    description: 'Middlewares: getMe, adminGuard',
    body: {
      school: {
        summary: 'The school entity',
        required: true,
      },
    },
  },
  getMe(),
  async ctx => {
    ctx.body = await createSchool(ctx.request.body.school);
  },
);

router.$('GET /getStudens',
  {
    summary: 'Gets all the users from a given school',
    description: 'Middlewares: getMe, teacherGuard',
  },
  getMe(['school']), roleGuard(['teacher', 'schoolAdmin']),
  async ctx => {
    ctx.body = await getStudentsFromSchool(ctx.state.user.school);
  },

);

router.$('PUT /',
  {
    summary: 'Updates a school',
    description: 'Middleware: getMe, adminGuard',
    body: {
      school: {
        summary: 'The school entity to be updated',
        required: true,
      },
    },
  },
  getMe(), roleGuard(['schoolAdmin']),
  async ctx => {
    if (ctx.request.body.school.id)
      ctx.body = await updateSchool(ctx.request.body.school);
    else
      ctx.throw(400);
    
  },
);

router.$('DELETE /{id}',
  {
    summary: 'Deletes a school by the given ID',
    description: 'Middlewares: getMe, adminGaurd',
    params: {
      id: {
        summary: 'The ID of the school',
        required: true,
      },
    },
  },
  getMe(), roleGuard(),
  async ctx => {
    ctx.body = await deleteSchool(ctx.params.id);
  },
);

export default router;
