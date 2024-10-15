import { BaseRequest, IBaseModel } from "../base";

export interface ICompanySettings {
  // Add specific settings properties here
}

export interface ICompanyModel extends IBaseModel {
  name: string;
  settings: ICompanySettings;
}

export interface ICompanyUpdateRequest
  extends BaseRequest<Partial<ICompanyModel>> {}
