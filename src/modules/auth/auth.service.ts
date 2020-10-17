/* eslint-disable camelcase */
import {User, UserLocal} from '../../entities/User';
import * as jwt from 'jsonwebtoken';
import * as FB from './facebook.strategy';
import {getUser, tryCreateUser} from './local.strategy';

export function getJWT (user: User): {access_token: string} {
  const payload = {
    id: user.id,
  };

  return {
    access_token: jwt.sign(payload, process.env.JWT_SECRET),
  };
}

export async function facebook (body) {
  const profile = await FB.getProfile(body);
  const user = await FB.getOrCreateUser(profile);
  return getJWT(user);
}

export const local = {
  login: async (user: Partial<UserLocal>) => {
    const lUser = await getUser(user);
    return getJWT(lUser);
  },
  signup: async (user: Partial<UserLocal>) => {
    const lUser = await tryCreateUser(user);
    return getJWT(lUser);
  },
};
