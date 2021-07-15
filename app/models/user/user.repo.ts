import { FilterData, UserData, UserDTO, UserEditableData, UserModel, UserRepoStruct } from './interfaces'
import { userModel } from './user.model'

export class UserRepo implements UserRepoStruct {
  public constructor(private readonly userModel: UserModel) {
    this.userModel = userModel
  }

  findOne = async (filter: FilterData): Promise<UserDTO> => {
    const user = await this.userModel.findOne(filter)

    if (!user) {
      return undefined
    }

    return user.getUserDTO()
  }

  create = async (data: UserData): Promise<UserDTO> => {
    const user = new this.userModel(data)
    await user.save()
    return user.getUserDTO()
  }

  update = async (_id: string, data: UserEditableData): Promise<UserDTO | null> => {
    const user = await this.userModel.findOneAndUpdate({ _id }, { $set: { ...data } }, { new: true })

    if (!user) {
      return null
    }

    await user.save()

    return user.getUserDTO()
  }

  deleteOne = async (_id: string): Promise<void> => {
    await this.userModel.deleteOne({ _id })
  }

  getPasswordHash = async (email: string): Promise<{ passwordHash: string; user: UserDTO } | undefined> => {
    const user = await this.userModel.findOne({ email })

    if (!user) {
      return undefined
    }

    return {
      passwordHash: user.password,
      user: user.getUserDTO(),
    }
  }
}

export const userRepo = new UserRepo(userModel)
