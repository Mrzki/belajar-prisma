import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { setupTestDB, clearDB, teardownDB } from "./helpers/setup";

beforeAll(async () => {
  await setupTestDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});

describe("POST /api/v1/auth/register", () => {
  it("harus berhasil register user baru", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("budi@gmail.com");
    expect(res.body.data.password).toBeUndefined();
  });

  it("harus gagal jika email sudah digunakan", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Budi Lain",
      email: "budi@gmail.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("harus gagal jika input tidak valid", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "A",
      email: "bukan-email",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: "password123",
    });
  });

  it("harus berhasil login dan dapat token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "budi@gmail.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("budi@gmail.com");
  });

  it("harus gagal jika password salah", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "budi@gmail.com",
      password: "passwordsalah",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("harus gagal jika email tidak terdaftar", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "tidakada@gmail.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
