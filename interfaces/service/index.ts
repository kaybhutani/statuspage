import { Document } from 'mongoose';

export enum ServiceStatus {
    OPERATIONAL = 'Operational',
    DEGRADED_PERFORMANCE = 'Degraded Performance',
    PARTIAL_OUTAGE = 'Partial Outage',
    MAJOR_OUTAGE = 'Major Outage',
}

export const inactiveStatus = [ServiceStatus.MAJOR_OUTAGE, ServiceStatus.PARTIAL_OUTAGE, ServiceStatus.DEGRADED_PERFORMANCE];
export const operationalStatus = [ServiceStatus.OPERATIONAL];

export interface IServiceModel extends Document {
    _id: string;
    companyId: string;
    name: string;
    description: string;
    status: ServiceStatus;
}
