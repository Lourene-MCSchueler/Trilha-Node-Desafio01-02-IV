import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";

let authenticateUserUseCase: AuthenticateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Show User Profile  UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it("should be able to find an user by id", async () => {
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

    const result = await showUserProfileUseCase.execute(token.user.id)

    expect(result).toHaveProperty("id")
  })

  it("should not be able to find a non-existent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("3544b50e-8be3-4455-97ca-8b64ccf02e6c")
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
