import dbConnect from '../../../database/database';
import auth0 from '../../../lib/auth0';
import UserService from '../../../services/user';

export default async function me(req, res) {
  try {
    console.log('me api hit');
    console.log('trying to connect to db');
    await dbConnect();
    console.log('connected to db');
    const session = await auth0.getSession(req);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const auth0Id = session.user.sub;

    const user = await UserService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch(error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
