import { model, Schema, models } from "mongoose";
import { CompanyScopedSchema } from "../base";
import { IUserModel } from "../../../interfaces/user";


const UserSchema = new CompanyScopedSchema<IUserModel>({
  auth0Id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
}, {
  versionKey: false
});

const UserModel = models.User ?? model<IUserModel>("User", UserSchema);

export default UserModel;
