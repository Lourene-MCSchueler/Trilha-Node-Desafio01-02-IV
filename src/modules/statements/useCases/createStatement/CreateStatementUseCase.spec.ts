import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to create a statement operation", async () => {
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

    const result = await createStatementUseCase.execute({
      user_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit $200"
    })

    expect(result).toHaveProperty("id")
  })

  it("should not be able to create a statement operation to a non-existent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "3544b50e-8be3-4455-97ca-8b64ccf02e6c",
        type: OperationType.DEPOSIT,
        amount: 220,
        description: "Deposit $220"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should be able to withdraw if balance > amount", async () => {
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

    await createStatementUseCase.execute({
      user_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit $200"
    })

    const result = await createStatementUseCase.execute({
      user_id: token.user.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "WithDraw $50"
    })

    expect(result).toHaveProperty("id")
  })

  it("should be able to withdraw if balance > amount", () => {
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

      await createStatementUseCase.execute({
        user_id: token.user.id,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: "Deposit $200"
      })

      const result = await createStatementUseCase.execute({
        user_id: token.user.id,
        type: OperationType.WITHDRAW,
        amount: 350,
        description: "WithDraw $350"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

})
