import { NextApiRequest, NextApiResponse } from 'next';
import ServiceService from '../../../services/services';
import dbConnect from '../../../database/database';
import CompanyModel from '../../../database/models/company';

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

    res.status(200).json({
      company: {
        id: company._id,
        name: company.name,
      },
      services: services.data,
    });
  } catch (error) {
    console.error('Error fetching services and company:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
