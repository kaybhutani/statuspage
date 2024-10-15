import { Types } from "mongoose";

const generateUuid = () => new Types.ObjectId().toString();

export default generateUuid;
