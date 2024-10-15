export class QueryContext {
  toCompanyScoped = (companyId: string) => {
    return new CompanyScopedQueryContext(companyId);
  };
}

export class CompanyScopedQueryContext extends QueryContext {
  companyId: string;
  constructor(companyId: string) {
    super();
    this.companyId = companyId;
  }
}
