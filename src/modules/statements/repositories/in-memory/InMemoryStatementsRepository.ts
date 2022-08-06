import { OperationType, Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create({
    user_id,
    amount,
    description,
    type,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    if (type === OperationType.TRANSFER) {
      const sender = Object.assign(statement, {
        user_id: sender_id,
        amount,
        description,
        type
      })

      const receiver = Object.assign(statement, {
        user_id,
        sender_id,
        amount,
        description,
        type
      })

      this.statements.push(sender);
      this.statements.push(receiver);

      return receiver
    }

    Object.assign(statement, {
      user_id: sender_id,
      amount,
      description,
      type
    });

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    > {
    const statement = this.statements.filter(operation => operation.user_id === user_id);

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === OperationType.DEPOSIT) {
        return acc + Number(operation.amount);
      } else if (operation.type === OperationType.WITHDRAW) {
        return acc - Number(operation.amount);
      } else {
        if (operation.sender_id) {
          return acc + Number(operation.amount);
        }
        return acc - Number(operation.amount);
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
