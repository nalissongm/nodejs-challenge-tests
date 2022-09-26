import request from "supertest";

import createConnection from "@database/index";
import { app } from "@src/app";
import { Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
let session: any;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();

    const id = v4();
    const password = await hash("passStrong", 8);

    await connection.query(
      `
        INSERT INTO users(id, name, email, password, created_at)
        VALUES ('${id}', 'Fake User', 'user@fake.com', '${password}', now())
      `
    );

    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "user@fake.com",
      password: "passStrong",
    });

    session = body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a statement of the type deposit", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 1212.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toEqual(session.user.id);
    expect(response.body.type).toEqual("deposit");
  });

  it("should be able to create a statement of the type withdraw", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1212.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toEqual(session.user.id);
    expect(response.body.type).toEqual("withdraw");
  });

  it("should not be possible to create a withdraw larger than the money in the account", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5000.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer ${session.token}`,
      });

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("Insufficient funds");
  });

  it("should not be possible to create a statement from a nonexistent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5000.0,
        description: "Description test",
      })
      .set({
        Authorization: `Bearer fake-token-user`,
      });

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });
});
