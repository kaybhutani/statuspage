import mongoose, { ConnectOptions } from "mongoose";

async function dbConnect() {
  try {
    const mongooseOptions: ConnectOptions = {
      autoCreate: true,
      autoIndex: true,
    };
    function setRunValidators(this: any) {
      this.setOptions({ runValidators: true });
    }
    function filterDeleted(this: any) {
      this.where({ deleted: false });
    }
    mongoose.plugin((schema) => {
      schema.pre("findOneAndUpdate", setRunValidators);
      schema.pre("updateMany", setRunValidators);
      schema.pre("updateOne", setRunValidators);
      schema.pre("find", filterDeleted);
      schema.pre("findOne", filterDeleted);
    });
    console.log('dbConnect hit', process.env.MONGO_URI);
    const db = await mongoose.connect(process.env.MONGO_URI!, mongooseOptions);
    console.log("> Database is connected to: ", db.connection.name);
  } catch (error) {
    console.error(error);
  }
}

export default dbConnect;