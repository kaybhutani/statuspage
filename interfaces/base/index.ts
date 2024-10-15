import { Document } from "mongoose";

export interface IBaseModel extends Document {
  id: string;
  _id: string;
  created: Date;
  updated: Date;
  deleted: boolean;
}

export interface ICompanyScopedMdoel extends IBaseModel {
  companyId: string;
  companyScopedQuery: (companyId: string) => any;
}

export interface BaseRequest<T> {
  body: T;
}

export interface BaseMultiResponse<T> {
  data: Array<T>;
  total?: number;
}

export class Pagination {
  page: number;
  size: number;
  skip: number;
  limit: number;
  constructor(page: number = 0, size: number = 20) {
    this.page = isNaN(page) ? 0 : page ?? 0;
    this.size = isNaN(size) ? 50 : size ?? 20;
    this.skip = this.page * this.size;
    this.limit = this.size;
  }
}
