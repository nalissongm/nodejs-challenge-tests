import { User } from "modules/users/entities/User";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `
        INSERT INTO users(id, name, email, password, created_at)
        VALUES ('${id}', 'Fake User', 'user@fake.com', '${password}', now())
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@fake.com",
      password: "admin",
    });

    expect(response.status).toBe(200);
  });

  it("should not be able authenticate a nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "nonexistentuser@fake.com",
      password: "admin",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });

  it("should not be able authenticate a user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@fake.com",
      password: "incorrect_pass",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });
});
