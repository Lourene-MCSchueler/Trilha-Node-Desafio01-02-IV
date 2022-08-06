import { Connection } from "typeorm";
import createConnection from '../../../../database/index'
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create statement - Deposit", async () => {
    const user = {
      name: "User test",
      email: "user@test.com.br",
      password: "12345",
    }
    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password
    })
    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 400,
        description: "Deposit $400"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id")

  });

  it("should be able to create statement - Withdraw", async () => {
    const user = {
      name: "User test",
      email: "user@test.com.br",
      password: "12345",
    }
    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password
    })
    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 400,
        description: "Deposit $400"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "Withdraw $200"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id")

  });

  it("should be able to create statement - Transfer", async () => {
    const user1 = {
      name: "User1 test",
      email: "user1@test.com.br",
      password: "12345",
    }
    const user2 = {
      name: "User2 test",
      email: "user2@test.com.br",
      password: "12345",
    }
    await request(app).post("/api/v1/users").send({
      name: user1.name,
      email: user1.email,
      password: user1.password,
    });
    await request(app).post("/api/v1/users").send({
      name: user2.name,
      email: user2.email,
      password: user2.password,
    });

    const responseTokenUser01 = await request(app).post("/api/v1/sessions").send({
      email: user1.email,
      password: user1.password
    })
    const { token } = responseTokenUser01.body;

    const responseTokenUser02 = await request(app).post("/api/v1/sessions").send({
      email: user2.email,
      password: user2.password
    })
    const { id } = responseTokenUser02.body.user;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 400,
        description: "Deposit $400"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${id}`)
      .send({
        amount: 100,
        description: "Transfer $100"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id")

  });
})
