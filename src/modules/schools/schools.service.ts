import {School} from '../../entities/School';
import {User} from '../../entities/User';
import {DB} from '../../utils/db';

export const createSchool = async (school: Partial<School>) => {
  const s = DB.repo(School).create(school);
  return DB.repo(School).save(s);
};

export const getStudentsFromSchool = async (school: School) =>
  DB.repo(User).find({where: {school}, relations: ['school']});

export const updateSchool = async (school: School) => {
  const s = DB.repo(School).create(school);
  return DB.repo(School).save(s);
};

export const deleteSchool = async (schoolId: string) => DB.repo(School).delete(schoolId);
