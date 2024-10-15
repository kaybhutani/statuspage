import { IServiceModel, ServiceStatus } from '../../interfaces/service';
import ServiceModel from '../../database/models/service';
// import ServiceEventLogModel from '../../database/models/serviceEventLog';
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

  public async createServiceEventLog(serviceId: string, status: ServiceStatus, message: string): Promise<void> {
    try {
      const eventLog = new ServiceEventLogModel({
        _id: generateUuid(),
        serviceId,
        status,
        message,
        timestamp: new Date(),
      });
      await eventLog.save();

      // Update the service status
      await this.updateService(serviceId, { status });
    } catch (error) {
      console.error('Failed to create service event log:', error);
      throw error;
    }
  }

  public async getServiceEventLogs(serviceId: string, pagination: Pagination): Promise<BaseMultiResponse<any>> {
    try {
      const query = ServiceEventLogModel.find({ serviceId });

      const total = await query.countDocuments();
      const logs = await query
        .sort({ timestamp: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
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
