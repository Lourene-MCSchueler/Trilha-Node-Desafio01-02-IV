import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO) {

    const userTo = await this.usersRepository.findById(user_id);

    const sender = await this.usersRepository.findById(sender_id);

    if (type === 'transfer' && !userTo) {
      throw new CreateStatementError.UserNotFound();
    }

    if (!sender) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === 'withdraw' || type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id: String(sender_id) });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id
    });

    return statementOperation;
  }
}
