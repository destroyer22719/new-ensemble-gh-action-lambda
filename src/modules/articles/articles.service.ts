import {Article} from '../../entities/Article';
import {User} from '../../entities/User';
import {DB} from '../../utils/db';

export const createArticle = async (article: Partial<Article>, path: string, user: User) => {
  const a = DB.repo(Article).create(article);
  a.thumbnailPath = path;
  a.createdBy = user;
  return DB.repo(Article).save(a);
};

export const getArticleById = async (articleId: string) => DB.repo(Article).findOne(articleId);


export const getAllArticles = async () => DB.repo(Article).find();


export const updateArticles = async (article: Article) => {
  const a = DB.repo(Article).create(article);
  return DB.repo(Article).save(a);
};

export const deleteArticle = async (articleId: string) => DB.repo(Article).delete(articleId);
