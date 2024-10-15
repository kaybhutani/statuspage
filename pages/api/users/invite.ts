import { NextApiRequest, NextApiResponse } from 'next';
import { withAuthAndUser } from '../../../lib/auth0';
import UserService from '../../../services/user';

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user } = req;
  const { name, email, password } = req.body;

  if (!user || !user.companyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const newUser = await UserService.createUserForExistingCompany(
      user.companyId,
      name,
      email,
      password
    );

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuthAndUser(handler);
