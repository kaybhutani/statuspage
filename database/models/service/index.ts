import { model, Schema, models } from "mongoose";
import { CompanyScopedSchema } from "../base";
import { IServiceModel, ServiceStatus } from "../../../interfaces/service";

const ServiceSchema = new CompanyScopedSchema<IServiceModel>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: Object.values(ServiceStatus), 
    default: ServiceStatus.ACTIVE,
    required: true 
  },
}, {
  versionKey: false
});

const ServiceModel = models.Service ?? model<IServiceModel>("Service", ServiceSchema);

export default ServiceModel;
