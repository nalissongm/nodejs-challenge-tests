import { Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";

import { app } from "@src/app";
import createConnection from "@database/index";
import { Statement } from "@modules/statements/entities/Statement";

interface ISession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

type Statements = Array<Statement>;

let connection: Connection;
let session: ISession;
let statemants: Statements;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();

    const id = v4();
    const password = await hash("admin", 8);

    await connection.query(
      `
        INSERT INTO users(id, name, email, password, created_at)
        VALUES ('${id}', 'Fake User', 'user@fake.com', '${password}', now())
      `
    );

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@fake.com",
      password: "admin",
    });

    session = response.body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance equal to zero if it has no statements", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    expect(response.status).toEqual(200);
    expect(response.body.balance).toEqual(0);
  });

  it("should be able to get balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 1000.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    expect(response.status).toEqual(200);
    expect(response.body.balance).toEqual(500);
    expect(response.body.statement[0].type).toEqual("deposit");
    expect(response.body.statement[0].amount).toEqual(1000);
    expect(response.body.statement[1].type).toEqual("withdraw");
    expect(response.body.statement[1].amount).toEqual(500);
  });

  it("should not be able to get balance without access token", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });

  it("should not be able to get balance from a nonexistent user", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: "Bearer invalid-token",
    });

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });
});
