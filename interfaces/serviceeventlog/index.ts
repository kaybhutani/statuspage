import { Document } from 'mongoose';
import { IServiceModel } from '../service';

export interface IServiceEventLogModel extends Document {
  _id: string;
  companyId: string;
  service_id: string;
  started_at: Date;
  finished_at: Date;
  reason: string;
  service?: IServiceModel;
}

