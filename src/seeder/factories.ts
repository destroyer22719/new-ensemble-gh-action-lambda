import {Question} from '../entities/Question';
import * as Faker from 'faker';
import {UserSocial} from '../entities/User';
import {Category} from '../entities/Category';
import {Medium} from '../entities/Medium';
import {DB} from '../utils/db';
import {School} from '../entities/School';

export const questionFactory = (userId: string, categoryId: string, mediumId?: string) => {
  const q = new Question();
  q.question = Faker.lorem.sentence();
  q.answers = [
    Faker.lorem.words(),
    Faker.lorem.words(),
    Faker.lorem.words(),
    Faker.lorem.words(),
  ];
  q.correctAnswers = [Math.floor(Math.random() * 4)];
  q.verifiedLevel = (Math.round(Math.random() * 2) - 1) as -1 | 0 | 1;
  q.verifiedBy = {id: userId} as UserSocial;
  q.createdBy = {id: userId} as UserSocial;
  q.category = {id: categoryId} as Category;
  q.medium = {id: mediumId} as Medium;
  return q;
};

export const userFactory = () => {
  const u = DB.repo(UserSocial).create();
  u.name = Faker.name.findName();
  u.socialId = 'facebook:' + Faker.random.uuid();
  u.avatarUrl = Faker.image.imageUrl();
  u.email = Faker.internet.email();
  return u;
};

export const categoryFactory = () => {
  const c = new Category();
  c.name = Faker.random.words(3);
  return c;
};

export const mediumFactory = (userId: string) => {
  const m = new Medium();
  m.createdBy = {id: userId} as UserSocial;
  return m;
};

export const schoolFactory = () => {
  const s = new School();
  s.name = Faker.name.firstName();
  return s;
};

