import { Schema, SchemaDefinition, SchemaOptions } from "mongoose";

class BaseSchema<T> extends Schema<T> {
  BaseFields: SchemaDefinition;
  constructor(definition?: SchemaDefinition<T>, options?: SchemaOptions) {
    // @ts-ignore
    super(definition, options);
    this.BaseFields = {
      _id: { type: String, required: true },
      created: { type: Date, required: true },
      updated: { type: Date, required: true },
      deleted: { type: Boolean, required: true },
    };
    // @ts-ignore
    this.add(this.BaseFields);
  }
}

class CompanyScopedSchema<T> extends BaseSchema<T> {
  constructor(definition?: SchemaDefinition<T>, options?: SchemaOptions) {
    super(definition, {
      ...options,
      query: {
        companyScopedQuery(companyId: string) {
          // @ts-ignore
          return this.where({ companyId: companyId });
        },
      },
    });
    // @ts-ignore
    this.add({ companyId: { type: String, required: true, trim: true } });
  }
}

export { BaseSchema, CompanyScopedSchema };
