import {DB} from '../../utils/db';
import {UserLocal, User} from '../../entities/User';
import * as argon2 from 'argon2';

export const tryCreateUser = async (localUser: Partial<UserLocal>) => {
  if (await DB.repo(User).findOne({where: {email: localUser.email}}))
    throw new Error('Email exists');
  
  const localU = DB.repo(UserLocal).create(localUser);
  localU.password = await argon2.hash(localU.password);
  localU.role = 'none';
  return DB.repo(UserLocal).save(localU);
};

export const getUser = async (localUser: Partial<UserLocal>) => {
  const foundUser = await DB.repo(UserLocal).findOne({
    where: {email: localUser.email},
    select: ['id', 'password'],
  });
  if (!foundUser)
    throw new Error('incorrect email');
  
  if (await argon2.verify(foundUser.password, localUser.password))
    return foundUser;
   
  throw new Error('incorrect password');
  
};
