import { model, Schema, models } from "mongoose";
import { ICompanyModel } from "../../../interfaces/company"; // Updated path
import { BaseSchema } from "../base";
const CompanySchema = new BaseSchema<ICompanyModel>({
  name: { type: String, trim: true, required: true },
  settings: { type: Schema.Types.Mixed, default: {} },
}, {
  versionKey: false
});

const CompanyModel = models.Company ?? model<ICompanyModel>("Company", CompanySchema);

export default CompanyModel;
