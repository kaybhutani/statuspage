import { ICompanyModel } from "../company";

export interface IUserModel extends Document {
    _id: string;
    companyId: string;
    name: string;
    auth0Id: string;
    email: string;
    company?: ICompanyModel;
  }