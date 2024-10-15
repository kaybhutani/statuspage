import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../database/database';
import UserService from '../../services/user';

export default async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { companyName, username, email, password } = req.body;

  if (!companyName || !username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Use the UserService to create user and company
    const user = await UserService.createUserWithCompany(companyName, username, email, password);

    res.status(201).json({ message: 'User and company registered successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
}
