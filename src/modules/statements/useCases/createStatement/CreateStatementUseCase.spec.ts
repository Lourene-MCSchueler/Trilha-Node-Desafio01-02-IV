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

  it("should be able to create a deposit", async () => {
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
      sender_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit $200",
      user_id: undefined
    })

    expect(result).toHaveProperty("id")
  })

  it("should be able to create a transfer", async () => {
    const user1 = {
      name: "User 01",
      email: "user1@test.com",
      password: "1234"
    }
    const user2 = {
      name: "User 02",
      email: "user2@test.com",
      password: "1234"
    }
    await createUserUseCase.execute(user1)
    const user2Created = await createUserUseCase.execute(user2)

    const token = await authenticateUserUseCase.execute({
      email: user1.email,
      password: user1.password,
    });

    await createStatementUseCase.execute({
      sender_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit $80",
      user_id: undefined
    });

    const statement = await createStatementUseCase.execute({
      user_id: user2Created.id as string,
      sender_id: token.user.id as string,
      type: OperationType.TRANSFER,
      amount: 50,
      description: "Transfer $50 to user 2",
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a statement operation to a non-existent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        sender_id: "3544b50e-8be3-4455-97ca-8b64ccf02e6c",
        type: OperationType.DEPOSIT,
        amount: 220,
        description: "Deposit $220",
        user_id: undefined
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
      sender_id: token.user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit $200",
      user_id: undefined
    })

    const result = await createStatementUseCase.execute({
      sender_id: token.user.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "WithDraw $50",
      user_id: undefined
    })

    expect(result).toHaveProperty("id")
  })

  it("should not be able to withdraw if balance < amount", () => {
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
        sender_id: token.user.id,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: "Deposit $200",
        user_id: undefined
      })

      await createStatementUseCase.execute({
        sender_id: token.user.id,
        type: OperationType.WITHDRAW,
        amount: 350,
        description: "WithDraw $350",
        user_id: undefined
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

})
