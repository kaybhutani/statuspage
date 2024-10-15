import { IUserModel } from '../../interfaces/user';
import UserModel from '../../database/models/user';
import { BaseMultiResponse, Pagination } from '../../interfaces/base';
import CompanyModel from '../../database/models/company';
import generateUuid from '../../database/common';

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async createUserWithCompany(companyName: string, userName: string, email: string, password: string): Promise<IUserModel> {
    try {
      // Create user in Auth0 using fetch
      const auth0Response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuth0Token()}`,
        },
        body: JSON.stringify({
          name: userName,
          connection: 'Username-Password-Authentication',
          email: email,
          password: password,
        }),
      });
      console.log(auth0Response);
      if (!auth0Response.ok) {
        const errorResponse = await auth0Response.json();
        throw new Error(`Failed to create user in Auth0: ${errorResponse.message}`);
      }

      const auth0User = await auth0Response.json();

      // Create company
      const company = new CompanyModel({
        _id: generateUuid(),
        name: companyName,
        created: new Date(),
        updated: new Date(),
        deleted: false,
      });
      await company.save();

      // Create user in our database
      const user = new UserModel({
        _id: generateUuid(),
        auth0Id: auth0User.user_id,
        name: auth0User.name || email.split('@')[0], // Use email username if name not provided
        email: email,
        companyId: company._id,
        created: new Date(),
        updated: new Date(),
        deleted: false
      });
      await user.save();

      // Populate company information
      user.company = company;

      return user;
    } catch (error) {
      console.error('Failed to create user or company:', error);
      throw error;
    }
  }


  public async getUserById(id: string): Promise<IUserModel | null> {
    try {
      return await UserModel.findById(id).populate('company');
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  public async getUserByAuth0Id(auth0Id: string): Promise<IUserModel | null> {
    try {
      const user = await UserModel.findOne({ auth0Id });
      if (user && user.companyId) {
        const company = await CompanyModel.findById(user.companyId);
        if (company) {
          user.company = company;
        }
      }
      return user;
    } catch (error) {
      console.error('Failed to get user by Auth0 ID:', error);
      throw error;
    }
  }

  public async updateUser(id: string, updateData: Partial<IUserModel>): Promise<IUserModel | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).populate('company');
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  public async getUsers(pagination: Pagination, companyId?: string): Promise<BaseMultiResponse<IUserModel>> {
    try {
      let query = UserModel.find();
      
      if (companyId) {
        query = query.where('companyId').equals(companyId);
      }

      const total = await query.countDocuments();
      const users = await query
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('company')
        .exec();

      return {
        data: users,
        total
      };
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }
  private async getAuth0Token(): Promise<string> {
    try {
      const axios = require("axios").default;

      const options = {
        method: 'POST',
        url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AUTH0_M2M_CLIENT_ID??"",
          client_secret: process.env.AUTH0_M2M_CLIENT_SECRET??"",
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
        })
      };

      const response = await axios.request(options);
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Auth0 token:', error);
      throw error;
    }
  }
}

export default UserService.getInstance();
