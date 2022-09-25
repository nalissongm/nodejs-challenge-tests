import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(`
      INSERT INTO users (id, name, email, password, created_at)
      VALUES ('${id}', 'Fake User', 'user@fake.com', '${password}', now())
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const authenticateResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@fake.com",
        password: "admin",
      });

    const { token } = authenticateResponse.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show a profile of a nonexistent user", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer fake-token`,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });
});
