import { Document } from 'mongoose';
import { IServiceModel, ServiceStatus } from '../service';

export interface IServiceEventLogModel extends Document {
  _id: string;
  companyId: string;
  service_id: string;
  started_at: Date;
  finished_at: Date;
  reason: string;
  status?: ServiceStatus;
  service?: IServiceModel;
}

