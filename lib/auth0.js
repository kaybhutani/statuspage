import { initAuth0 } from '@auth0/nextjs-auth0';
import config from './config';
import UserService from '../services/user';
import dbConnect from '../database/database';

const auth0 = initAuth0({
  clientId: config.AUTH0_CLIENT_ID,
  clientSecret: config.AUTH0_CLIENT_SECRET,
  scope: config.AUTH0_SCOPE,
  domain: config.AUTH0_DOMAIN,
  redirectUri: config.REDIRECT_URI,
  postLogoutRedirectUri: config.POST_LOGOUT_REDIRECT_URI,
  session: {
    cookieSecret: config.SESSION_COOKIE_SECRET,
    cookieLifetime: config.SESSION_COOKIE_LIFETIME,
    storeIdToken: true,
    storeRefreshToken: true,
    storeAccessToken: true
  }
});



export const withAuthAndUser = (handler) => async (req, res) => {
  try {
    await dbConnect();
    const session = await auth0.getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth0Id = session.user.sub;
    const user = await UserService.getUserByAuth0Id(auth0Id);

    if (!user) {
      
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    return handler(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default auth0;