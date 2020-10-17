import {createConnection, getConnection, getRepository} from 'typeorm';
import {User, UserLocal, UserSocial} from '../entities/User';
import {Question} from '../entities/Question';
import {Medium, MediumPhoto, MediumPassage} from '../entities/Medium';
import {Category} from '../entities/Category';
import {QuestionAnswer} from '../entities/QuestionAnswer';
import {Article} from '../entities/Article';
import {School} from '../entities/School';
import {CategoryClosure} from '../entities/CategoryClosure';
import {InviteCode} from '../entities/InviteCode';

export const DB = {
  connect: async () => {
    try {
      getConnection();
      return;
    } catch (err) {
      await createConnection({
        type: 'postgres',
        name: 'default',
        url: process.env.DB_URL,
        entities: [
          User,
          UserSocial,
          UserLocal,
          Question,
          Medium,
          Category,
          CategoryClosure,
          MediumPassage,
          MediumPhoto,
          QuestionAnswer,
          Article,
          School,
          InviteCode,
        ],
        synchronize: process.env.NODE_ENV === 'development',
        dropSchema: process.env.DROP_DB === 'true',

        // logging: true,
      });
    }
  },
  repo: getRepository,
  conn: getConnection,
  tableName: (entt: new () => unknown) => getRepository(entt).metadata.tableName,
};
