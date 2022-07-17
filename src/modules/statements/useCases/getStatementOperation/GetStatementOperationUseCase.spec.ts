import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"


let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to get statement operation", async () => {
    const user = {
      name: "User test",
      email: "user@test.com",
      password: "12345",
    };
    await createUserUseCase.execute(user)
    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit $200"
    })

    const result = await getStatementOperationUseCase.execute({
      user_id: token.user.id,
      statement_id: statement.id
    })

    expect(result).toHaveProperty("id")
  })

  it("should not be able to get a statement operation to non-existent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "3544b50e-8be3-4455-97ca-8b64ccf02e6c",
        statement_id: "00a91713-d0e0-4935-91ae-7fbfd4629225"
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get a statement operation to user with non-existent statement", () => {
    expect(async () => {
      const user = {
        name: "User test",
        email: "user@test.com",
        password: "12345",
      };
      await createUserUseCase.execute(user)
      const token = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });
      await getStatementOperationUseCase.execute({
        user_id: token.user.id,
        statement_id: "00a91713-d0e0-4935-91ae-7fbfd4629225"
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

})
