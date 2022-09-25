import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Fake User Name",
      email: "user@fake.com",
      password: "fake_password",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a user with the same email", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Fake User Name",
      email: "user@fake.com",
      password: "fake_password",
    });

    expect(response.status).toBe(400);
  });
});
