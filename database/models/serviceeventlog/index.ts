import { model, Schema, models } from "mongoose";
import { CompanyScopedSchema } from "../base";
import { IServiceEventLogModel } from "../../../interfaces/serviceeventlog";
import { ServiceStatus } from "../../../interfaces/service";

const ServiceEventLogSchema = new CompanyScopedSchema<IServiceEventLogModel>({
  service_id: { type: String, required: true, trim: true },
  started_at: { type: Date, required: true },
  finished_at: { type: Date, required: false },
  reason: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: Object.values(ServiceStatus), 
    required: false
  },
}, {
  versionKey: false
});

const ServiceEventLogModel = models.ServiceEventLog ?? model<IServiceEventLogModel>("ServiceEventLog", ServiceEventLogSchema);

export default ServiceEventLogModel;
