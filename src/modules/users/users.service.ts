import {User} from '../../entities/User';
import {DB} from '../../utils/db';

export const getUserById = (userId: string) =>
  DB.repo(User).findOne(userId);

export const deleteUserById = (userId: string) =>
  DB.repo(User).remove({id: userId} as User);

export const updateUser = (user: User) =>
  DB.repo(User).save(user);

export const clearSchool = (user: User) =>
  DB.repo(User).update({id: user.id}, {school: null});
