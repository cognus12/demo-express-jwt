import { UserData, UserDTO, UserEditableData, UserModel, UserRepoStruct } from './interfaces'
import { userModel } from './user.model'

export class UserRepo implements UserRepoStruct {
  public constructor(private readonly userModel: UserModel) {
    this.userModel = userModel
  }

  findOne = async (filter: Partial<UserData>): Promise<UserDTO> => {
    const user = await this.userModel.findOne(filter)
    return user.getUserDTO()
  }

  create = async (data: UserData): Promise<UserDTO> => {
    const user = new this.userModel(data)
    await user.save()
    return user.getUserDTO()
  }

  update = async (_id: string, data: UserEditableData): Promise<UserDTO> => {
    const user = await this.userModel.findOne({ _id })
    await user.update({ $set: { ...data } })
    await user.save()
    return user.getUserDTO()
  }

  deleteOne = async (_id: string): Promise<void> => {
    await this.userModel.deleteOne({ _id })
  }
}

export const userRepo = new UserRepo(userModel)
