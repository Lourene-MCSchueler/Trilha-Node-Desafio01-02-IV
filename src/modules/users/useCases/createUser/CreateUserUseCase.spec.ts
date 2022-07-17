import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { hash } from 'bcryptjs';
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create User UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able create new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com.br",
      password: await hash("12345", 8)
    })

    expect(user).toHaveProperty("id")
  })

  it("should not be able create new user with an existing mail  ", async () => {
    expect(async () => {
      const user1 = await createUserUseCase.execute({
        name: "User test 01",
        email: "user01@test.com.br",
        password: await hash("12345", 8)
      })
      const user2 = await createUserUseCase.execute({
        name: "User test 02",
        email: "user01@test.com.br",
        password: await hash("56789", 8)
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })

})
