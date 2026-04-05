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
import {
  setupTestDB,
  clearDB,
  teardownDB,
  seedAdmin,
  seedUser,
  seedProduct,
} from "./helpers/setup.js";

beforeAll(async () => {
  await setupTestDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});

describe("GET /api/v1/products", () => {
  it("harus berhasil menampilkan list products", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    expect(res.body.data.products).toBeDefined();
  });

  it("harus bisa filter dengan search query", async () => {
    const res = await request(app).get("/api/v1/products?search=sepatu");
    expect(res.status).toBe(200);
    expect(res.body.data.products).toBeDefined();
  });
});

describe("GET /api/v1/products/:id", () => {
  let product;

  beforeEach(async () => {
    product = await seedProduct();
  });

  it("harus berhasil menampilkan detail product", async () => {
    const res = await request(app).get(`/api/v1/products/${product.id}`);
    expect(res.status).toBe(200);
  });

  it("harus gagal jika product tidak ditemukan (404)", async () => {
    const res = await request(app).get("/api/v1/products/999999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/products", () => {
  beforeEach(async () => {
    await seedAdmin();
    await seedUser();
  });

  it("harus berhasil membuat product baru (sebagai admin)", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@gmail.com",
      password: "admin123",
    });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Tas Alto",
        price: 200000,
        stock: 10,
      });

    expect(res.status).toBe(201);
  });

  it("harus gagal jika tidak ada token (401", async () => {
    const res = await request(app).post("/api/v1/products").send({
      name: "Tas Alto",
      price: 200000,
      stock: 10,
    });

    expect(res.status).toBe(401);
  });

  it("harus gagal jika token bukan admin (403)", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "budi@gmail.com",
      password: "password123",
    });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Tas Alto",
        price: 200000,
        stock: 10,
      });

    expect(res.status).toBe(403);
  });

  it("harus gagal jika input tidak valid (400)", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@gmail.com",
      password: "admin123",
    });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "A",
        price: 0,
        stock: -1,
      });

    expect(res.status).toBe(400);
  });
});
