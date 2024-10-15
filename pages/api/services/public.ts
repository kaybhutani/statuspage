import { NextApiRequest, NextApiResponse } from 'next';
import ServiceService from '../../../services/services';
import dbConnect from '../../../database/database';
import CompanyModel from '../../../database/models/company';
import ServiceEventLogModel from '../../../database/models/serviceEventLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const { companyId } = req.query;
    
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const services = await ServiceService.getServices(companyId);
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const events = await ServiceEventLogModel.find({ companyId }).sort({ _id: -1 }).lean().exec();

    const servicesMap = new Map(services.data.map(service => [service._id.toString(), service]));

    const populatedEvents = events.map(event => ({
      ...event,
      service: servicesMap.get(event.service_id.toString())
    }));

    res.status(200).json({
      company: {
        id: company._id,
        name: company.name,
      },
      services: services.data,
      events: populatedEvents,
    });
  } catch (error) {
    console.error('Error fetching services, company, and events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
