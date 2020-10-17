import {InviteCode} from '../../entities/InviteCode';
import {School} from '../../entities/School';
import {User} from '../../entities/User';
import {DB} from '../../utils/db';
import {httpErr} from '../../utils/imports';

export const createSchoolTeacherCode = async (school: School) => {
  const ic = DB.repo(InviteCode).create();
  ic.data = {
    relations: {schoolId: school.id},
    role: 'teacher',
  };
  return (await DB.repo(InviteCode).save(ic)).code;
};

export const createSchoolStudentCode = async (school: School) => {
  const ic = DB.repo(InviteCode).create();
  ic.data = {
    relations: {schoolId: school.id},
    role: 'student',
  };
  return (await DB.repo(InviteCode).save(ic)).code;
};

export const deactivateInviteCode = async (codeId: string) => DB.repo(InviteCode).createQueryBuilder()
  .update(InviteCode)
  .set({isActive: false})
  .where({id: codeId})
  .execute();

export const applyCode = async (code: string, user: User) => {
  const c = await DB.repo(InviteCode).findOne({where: {code}});

  if (!c || !c.isActive)
    throw httpErr(404, 'Invalid code!');

  if (c.data.role)
    DB.repo(User).createQueryBuilder()
      .update(User)
      .set({role: c.data.role})
      .where({id: user.id})
      .execute();

  if (c.data.relations.schoolId)
    DB.repo(User).update({id: user.id}, {school: {id: c.data.relations.schoolId}});
};
