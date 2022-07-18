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
})
