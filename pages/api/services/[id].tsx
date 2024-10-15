import { NextApiRequest, NextApiResponse } from 'next';
import { withAuthAndUser } from '../../../lib/auth0';
import ServiceService from '../../../services/services';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  switch (method) {
    case 'GET':
      await handleGet(id, res);
      break;
    case 'DELETE':
      await handleDelete(id, res);
      break;
    case 'PATCH':
      await handlePatch(id, req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(id: string, res: NextApiResponse) {
  try {
    const service = await ServiceService.getServiceById(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleDelete(id: string, res: NextApiResponse) {
  try {
    const deleted = await ServiceService.deleteService(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handlePatch(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }
    const updatedService = await ServiceService.updateService(id, { status });
    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuthAndUser(handler);
