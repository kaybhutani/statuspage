import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../database/database';
import ServiceEventLogModel from '../../../../database/models/serviceEventLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

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
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const events = await ServiceEventLogModel.find({ companyId })
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    res.status(200).json({
      events: events.map(event => ({
        id: event._id,
        serviceId: event.serviceId,
        status: event.status,
        reason: event.reason,
        timestamp: event.timestamp,
        finishedAt: event.finishedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching service events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
