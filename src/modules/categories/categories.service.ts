import {DB} from '../../utils/db';
import {Category} from '../../entities/Category';
import {User} from '../../entities/User';
import {TreeUtils} from '../../utils/closure';
import * as createError from 'http-errors';

export const createCategory = (category: Partial<Category>) => {
  const c = DB.repo(Category).create(category);
  return TreeUtils(Category).insertTreeNode(c);
};

export const getCategories = async (rootsOnly: boolean, notSubscribedOnly: boolean, user: User) => {
  let cats: Category[] = rootsOnly ? await TreeUtils(Category).getRoots() : await DB.repo(Category).find();
  if (notSubscribedOnly)
    cats = cats.filter(x => !user.subscribedCategories.find(y => y.id === x.id));
  return cats;
};

export const getCategoryById = (categoryId: string) =>
  DB.repo(Category).findOne(categoryId);

export const updateCategory = (category: Partial<Category>) =>
  DB.repo(Category).save(category);

export const deleteCategory = (categoryId: string) =>
  DB.repo(Category).createQueryBuilder()
    .delete()
    .from(Category)
    .where({id: categoryId})
    .execute();

export const subscribeToCategory = async (categoryId: string, user: User) => {
  const relationExists = await DB.repo(User).createQueryBuilder('user')
    .leftJoinAndSelect('user.subscribedCategories', 'sc')
    .where('user.id = :userId AND sc.id = :categoryId', {userId: user.id, categoryId})
    .getCount();

  if (relationExists)
    throw createError(422);
  
  if (!await TreeUtils(Category).isRoot(categoryId))
    throw createError(422);

  return DB.conn()
    .createQueryBuilder()
    .relation(User, 'subscribedCategories')
    .of(user)
    .add(categoryId);
};

export const unsubscribeFromCategory = (categoryId: string, user: User) =>
  DB.conn()
    .createQueryBuilder()
    .relation(User, 'subscribedCategories')
    .of(user)
    .remove(categoryId);
