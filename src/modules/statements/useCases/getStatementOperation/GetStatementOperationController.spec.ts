import { Connection } from "typeorm";
import createConnection from '../../../../database/index'
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return a statement", async () => {
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

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 46,
        description: "Deposit $46"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementId = responseStatement.body.id

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.type).toBe('deposit')
    expect(response.status).toBe(200)
  });

})
