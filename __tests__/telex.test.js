import request from "supertest";
import app from "../server.js";
import redisClient from "../database/redisClient.js";
import {
  checkIfNoChanges,
  sendNoChangesNotification,
} from "../service/checkIfNoChanges.js";

describe("GET /", () => {
  it("should return a 200 status and a welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Telex Drive Backup Notofier!");
  });
});

describe("POST /tick", () => {
  it("should return 400 if Folder ID is not provided", async () => {
    const res = await request(app).post("/tick").send({
      channel_id: "test_channel",
      return_url: "http://example.com",
      settings: [],
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Folder ID is required");
  });

  it("should return 202 and set Redis keys if Folder ID is provided", async () => {
    const res = await request(app)
      .post("/tick")
      .send({
        channel_id: "test_channel",
        return_url: "http://example.com",
        settings: [{ label: "Folder ID", default: "test_folder_id" }],
      });
    expect(res.statusCode).toEqual(202);
    // Add more assertions to check if Redis keys are set correctly
  });

  it("should return 500 if there is an internal server error", async () => {
    jest.spyOn(redisClient, "set").mockImplementationOnce(() => {
      throw new Error("Internal Server Error");
    });

    const res = await request(app)
      .post("/tick")
      .send({
        channel_id: "test_channel",
        return_url: "http://example.com",
        settings: [{ label: "Folder ID", default: "test_folder_id" }],
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty("message", "Internal Server Error");
  });
});

// Add more tests for other endpoints and functionalities as needed
describe("checkIfNoChanges", () => {
  it("should return true if no last change timestamp is found", async () => {
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(null);
    const result = await checkIfNoChanges();
    expect(result).toBe(true);
  });

  it("should return false if changes were made within the last 2 minutes", async () => {
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(Date.now().toString());
    const result = await checkIfNoChanges();
    expect(result).toBe(false);
  });

  it("should return true if no changes were made within the last 2 minutes", async () => {
    jest
      .spyOn(redisClient, "get")
      .mockResolvedValueOnce((Date.now() - 120001).toString());
    const result = await checkIfNoChanges();
    expect(result).toBe(true);
  });
});

afterAll(async () => {
  // Close Redis connection
  await redisClient.quit();
});
