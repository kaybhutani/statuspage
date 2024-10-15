import CompanyModel from '../../database/models/company/';
import { ICompanyModel } from "../../interfaces/company";

class CompanyService {
  public async getCompanyById(id: string): Promise<ICompanyModel | null> {
    try {
      return await CompanyModel.findById(id);
    } catch (error) {
      console.error('Failed to get company by ID:', error);
      throw error;
    }
  }

  public async updateCompany(id: string, updateData: Partial<ICompanyModel>): Promise<ICompanyModel | null> {
    try {
      return await CompanyModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  }

}

export default new CompanyService();
