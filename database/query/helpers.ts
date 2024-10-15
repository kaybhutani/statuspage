import { Model } from "mongoose";
import { IBaseModel } from "../../interfaces/base";

interface HttpError extends Error {
  status: number;
  name: string;
  message: string;
}


export class UnexpectedDatabaseError implements HttpError {
  message: string;
  status: number;
  name: string = "Unexpected Database Error";
  stack?: string | undefined;
  constructor(message: string, status = 500) {
    this.message = message;
    this.status = status;
  }
}

export const getUpdatedModel = (existing: IBaseModel, req: Object) => {
  return { ...existing.toObject(), ...req };
};

export const updateModelAndReturn = (modelObj: Model<any>) => {
  return async (existing: IBaseModel, changes: Object) => {
    const updatedModel = getUpdatedModel(existing, changes);
    const res = await modelObj.updateOne(
      { _id: existing._id },
      { ...changes, updated: new Date() }
    );
    if (!res.acknowledged)
      throw new UnexpectedDatabaseError(
        `Unable to update ${modelObj.modelName}`
      );
    return updatedModel;
  };
};
