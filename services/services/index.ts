import { IServiceModel, ServiceStatus } from '../../interfaces/service';
import ServiceModel from '../../database/models/service';
import ServiceEventLogModel from '../../database/models/serviceeventlog';
import { BaseMultiResponse, Pagination } from '../../interfaces/base';
import generateUuid from '../../database/common';

export class ServiceService {
  private static instance: ServiceService;

  public static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  public async createService(name: string, description: string, companyId: string): Promise<IServiceModel> {
    try {
      const service = new ServiceModel({
        _id: generateUuid(),
        name,
        description,
        companyId,
        status: ServiceStatus.ACTIVE,
        created: new Date(),
        updated: new Date(),
        deleted: false,
      });
      await service.save();
      return service;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  public async getServiceById(id: string): Promise<IServiceModel | null> {
    try {
      return await ServiceModel.findById(id);
    } catch (error) {
      console.error('Failed to get service by ID:', error);
      throw error;
    }
  }

  public async updateService(id: string, updateData: Partial<IServiceModel>): Promise<IServiceModel | null> {
    try {
      return await ServiceModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  }

  public async deleteService(id: string): Promise<boolean> {
    try {
      const result = await ServiceModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  }

  public async getServices(companyId: string): Promise<BaseMultiResponse<IServiceModel>> {
    try {
      let query = ServiceModel.find();
      
      if (companyId) {
        query = query.where('companyId').equals(companyId);
      }
      const services = await query.exec();

      return {
        data: services,
        total: services.length
      };
    } catch (error) {
      console.error('Failed to get services:', error);
      throw error;
    }
  }

  public async changeServiceStatus(serviceId: string, newStatus: ServiceStatus, reason?: string): Promise<IServiceModel | null> {
    try {
      const service = await this.getServiceById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      if (newStatus === ServiceStatus.INACTIVE) {
        if (!reason) {
          throw new Error('Reason is required when changing status to inactive');
        }
        await this.createServiceEventLog(serviceId, newStatus, reason);
      } else if (newStatus === ServiceStatus.ACTIVE) {
        const latestInactiveLog = await ServiceEventLogModel.findOne({ 
          service_id: serviceId, 
          finished_at: null 
        }).sort({ timestamp: -1 });
        console.log( "latestInactiveLog", latestInactiveLog);
        if (latestInactiveLog) {
          latestInactiveLog.finished_at = new Date();
          await latestInactiveLog.save();
        }
      }

      return await this.updateService(serviceId, { status: newStatus });
    } catch (error) {
      console.error('Failed to change service status:', error);
      throw error;
    }
  }

  public async createServiceEventLog(serviceId: string, status: ServiceStatus, message: string): Promise<void> {
    try {
      const service = await this.getServiceById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

    //   console.log( "SSSSS",  service.companyId, serviceId, status, message);
      const eventLog = new ServiceEventLogModel({
        _id: generateUuid(),
        created: new Date(),
        updated: new Date(),
        companyId: service.companyId,
        service_id: serviceId,
        status: status,
        reason: message,
        started_at: new Date(),
        finished_at: null,
        deleted: false,
      });
      await eventLog.save();
    } catch (error) {
      console.error('Failed to create service event log:', error);
      throw error;
    }
  }

  public async getServiceEventLogs(serviceId: string, pagination: Pagination): Promise<BaseMultiResponse<any>> {
    try {
      const query = ServiceEventLogModel.find({ service_id: serviceId });

      const total = await query.countDocuments();
      const logs = await query
        .sort({ started_at: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('service')
        .exec();

      return {
        data: logs,
        total
      };
    } catch (error) {
      console.error('Failed to get service event logs:', error);
      throw error;
    }
  }
}

export default ServiceService.getInstance();
