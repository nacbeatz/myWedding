import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectToDatabase, disconnectFromDatabase } from "./mongodb";

describe("MongoDB Connection", () => {
  it("should connect to MongoDB successfully", async () => {
    try {
      await connectToDatabase();
      expect(true).toBe(true);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await disconnectFromDatabase();
    } catch (error) {
      console.error("MongoDB disconnection error:", error);
    }
  });
});
