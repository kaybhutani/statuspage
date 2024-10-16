import { NextApiRequest, NextApiResponse } from 'next';
import { withAuthAndUser } from '../../../lib/auth0';
import UserService from '../../../services/user';
import { Pagination } from '../../../interfaces/base';

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user } = req;
  const  companyId  = user.companyId

  if (!user || !user.companyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const users = await UserService.getUsers(companyId as string);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuthAndUser(handler);

