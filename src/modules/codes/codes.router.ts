import {roleGuard} from '../../mw/guards';
import {getMe} from '../../mw/me';
import {DocRouter} from '../../utils/router';
import {applyCode, createSchoolStudentCode, createSchoolTeacherCode} from './codes.service';

const router = new DocRouter({prefix: '/codes', name: 'Codes'});

router.$('POST /SchoolTeacher',
  {
    summary: 'Creates and return a registragion code for teachers',
    description: 'Middlewares: getMe, schoolAdminGuard',
  },
  getMe(['school']), roleGuard(['schoolAdmin']),
  async ctx => {
    ctx.body = await createSchoolTeacherCode(ctx.state.user.school);
  },
);

router.$('POST /SchoolStudent',
  {
    summary: 'Creates and return a registragion code for students',
    description: 'Middlewares: getMe, teacherGuard',
  },
  getMe(['school']), roleGuard(['teacher', 'schoolAdmin']),
  async ctx => {
    ctx.body = await createSchoolStudentCode(ctx.state.user.school);
  },
);

router.$('PUT /apply',
  {
    summary: 'Creates and return a registragion code for students',
    description: 'Middlewares: getMe, teacherGuard',
    query: {
      code: {},
    },
  },
  getMe(),
  async ctx => {
    ctx.body = await applyCode(ctx.query.code, ctx.state.user);
  },
);

export default router;
