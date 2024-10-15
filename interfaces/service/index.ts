import { Document } from 'mongoose';

export enum ServiceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface IServiceModel extends Document {
    _id: string;
    companyId: string;
    name: string;
    description: string;
    status: ServiceStatus;
}
