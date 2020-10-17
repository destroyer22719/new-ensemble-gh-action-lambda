/* eslint-disable camelcase */
import Axios from 'axios';
import {DB} from '../../utils/db';
import {UserSocial} from '../../entities/User';
import {Obj} from '../../utils/globals';

export async function getProfile (body) {
  const access_token = (
    await Axios
      .get('https://graph.facebook.com/v6.0/oauth/access_token', {
        params: {
          client_id: process.env.FB_APP_ID,
          redirect_uri: body.redirect_uri,
          client_secret: process.env.FB_APP_SECRET,
          code: body.code,
        },
      })
  ).data.access_token;

  const profile = (
    await Axios
      .get('https://graph.facebook.com/me', {
        params: {
          fields: ['id', 'email', 'name', 'picture'].join(','),
          access_token,
        },
      })
  ).data;
  return profile;
}

export async function getOrCreateUser (profile: Obj) {
  const socialId = 'facebook:' + profile.id;

  let user = await DB.repo(UserSocial).findOne({where: {socialId}});
  if (!user) {
    user = DB.repo(UserSocial).create({
      name: profile.name,
      socialId,
      avatarUrl: profile.picture.data.url,
      email: profile.email,
    });
    await DB.repo(UserSocial).save(user);
  }

  return user;
}
