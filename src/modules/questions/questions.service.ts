import {Question, VerifiedLevel} from '../../entities/Question';
import {User} from '../../entities/User';
import {DB} from '../../utils/db';
import {QuestionAnswer} from '../../entities/QuestionAnswer';
import {Medium, MediumPassage, MediumPhoto} from '../../entities/Medium';
import {TreeUtils} from '../../utils/closure';
import {Category} from '../../entities/Category';
import * as createError from 'http-errors';

export const createQuestionWithoutMedium = (question: Partial<Question>, user: User) => {
  const q = DB.repo(Question).create(question);
  q.createdBy = user;

  return DB.repo(Question).save(q);
};


export const createQuestionsWithMedium = async <T extends Medium>(
  mediumType: 'passage' | 'photo',
  medium: Partial<T>,
  questions: Partial<Question>[],
  user: User,
) => {
  const m: Medium = await {
    'passage': async () => {
      const p = DB.repo(MediumPassage).create(medium);
      p.createdBy = user;
      return DB.repo(MediumPassage).save(p);
    },
    'photo': async () => {
      const p = DB.repo(MediumPhoto).create(medium);
      p.createdBy = user;
      return DB.repo(MediumPhoto).save(p);
    },
  }[mediumType]();
  
  const qs = [];
  for (const question of questions) {
    const q = DB.repo(Question).create(question);
    q.createdBy = user;
    q.medium = {id: m.id} as Medium;
    qs.push(q);
  }
  
  return DB.repo(Question).save(qs);
};

export const updateQuestion = (question: Partial<Question>) => {
  question.verifiedLevel = +question.verifiedLevel as VerifiedLevel;
  const q = DB.repo(Question).create(question);
  return DB.repo(Question).save(q);
};

export const getUnverifiedQuestions = async () => DB.repo(Question).find({where: {verifiedLevel: 0}});

export const getVerifiedQuestions = async () => DB.repo(Question).find({where: {verifiedLevel: 1}});

export const getFeed = async (query: {seed, page, category}, user: User) => {
  query.seed = +query.seed;
  query.page = +query.page;

  const perPage = 2;
  if (!query.seed && query.seed !== 0) throw createError(400);
  
  query.seed = +query.seed.toFixed(2);

  const questions =
    await DB.conn().transaction('SERIALIZABLE', async em => {
      await em.query('SELECT setseed($1);', [query.seed]);
      return em.query(`
        SELECT q.*, qac.count AS "answerCount"

        FROM(
          SELECT 
            q.*,
            json_agg(json_build_object('id', cat.id, 'name', cat.name) ORDER BY c.depth DESC)
              AS categories
          FROM question q

          ${TreeUtils(Category).queries.doubleJoinClosure('cat', 'c')}

          ${/* Disable based on a filter? */ ''}
          LEFT OUTER JOIN (
            SELECT qa."questionId"
            FROM ${DB.tableName(QuestionAnswer)} qa
            WHERE qa."answeredById" = $4
          ) AS qa
          ON qa."questionId" = q.id

          WHERE q."verifiedLevel" = 1
          AND q."categoryId" IN (
            ${TreeUtils(Category).queries.getDescendantsIds(3)}
          )
          AND qa."questionId" IS null

          GROUP BY q.id
          ORDER BY random()
          LIMIT $1
          OFFSET $2
        ) AS q

        LEFT OUTER JOIN (
          SELECT qa."questionId", COUNT(*)
          FROM question_answer qa
          GROUP BY qa."questionId"
        ) AS qac
        ON qac."questionId" = q.id
        `, [perPage, (query.page - 1) * perPage, query.category, user.id],
      );
    });

  return questions;
};

export const createQuestionAnswers = (questionAnswers: Partial<QuestionAnswer>[], user: User) => {
  const qas = [];
  for (const questionAnswer of questionAnswers) {
    const qa = DB.repo(QuestionAnswer).create(questionAnswer);
    qa.answeredBy = user;
    qas.push(qa);
  }

  return DB.repo(QuestionAnswer).save(qas);
};

export const getMediumWithQuestions = (mediumId: string) =>
  DB.repo(Medium).createQueryBuilder('m')
    .leftJoinAndMapMany('m.questions', 'm.questions', 'questions')
    .addSelect('m.type')
    .where('m.id = :id', {id: mediumId})
    .getOne();

export const getQuestionById = (questionId: string) =>
  DB.repo(Question).findOne(questionId);

export const deleteQuestionById = (questionId: string) =>
  DB.repo(Question).createQueryBuilder()
    .delete()
    .from(Question)
    .where({id: questionId})
    .execute();
