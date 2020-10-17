import {config} from 'dotenv';
config();
import {userFactory, categoryFactory, questionFactory} from './factories';
import {DB} from '../utils/db';
import {User} from '../entities/User';
import {Category} from '../entities/Category';
import {Question} from '../entities/Question';
import {TreeUtils} from '../utils/closure';

export const seeder = async () => {
  await DB.connect();

  const users = [];
  for (const _ of Array(10).keys())
    users.push(userFactory());

  const userIds = (await DB.repo(User).save(users)).map(x => x.id);

  const categories = [];
  for (const _ of Array(10).keys())
    categories.push(categoryFactory());

  for (const category of categories)
    await TreeUtils(Category).insertTreeNode(category);

  const categoryIds = (await DB.repo(Category).find()).map(x => x.id);

  const questions = [];
  for (const _ of Array(100).keys()) {
    const randomUserId = userIds[Math.floor(Math.random() * 10)];
    const randomCategoryId = categoryIds[Math.floor(Math.random() * 10)];
    questions.push(questionFactory(randomUserId, randomCategoryId));
  }

  const _questionIds = (await DB.repo(Question).save(questions)).map(x => x.id);
};

seeder();
