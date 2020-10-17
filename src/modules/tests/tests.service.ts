import {DB} from '../../utils/db';
import {Category} from '../../entities/Category';
import {makeTest} from './algo';

export const createCategoryWithTestPreset = (category: Partial<Category>) => {
  const c = DB.repo(Category).create(category);
  return DB.repo(Category).save(c);
};

export const getTest = async (categoryId: string) => {
  const {template} = await DB.repo(Category).findOne(categoryId);
  return makeTest(template);
};
