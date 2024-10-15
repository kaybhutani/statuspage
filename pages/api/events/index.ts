import { NextApiRequest, NextApiResponse } from 'next';
import { withAuthAndUser } from '../../../lib/auth0';
import ServiceEventLogModel from '../../../database/models/serviceeventlog';
import dbConnect from '../../../database/database';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await handleGet(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    const { companyId, limit = 10 } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const events = await ServiceEventLogModel.find({ companyId })
      .sort({ started_at: -1 })
      .limit(Number(limit))
      .lean()
      .exec();

    res.status(200).json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuthAndUser(handler);
