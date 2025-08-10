import { createClient, RedisClientType } from "redis";

class RedisClient {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    this.client.on("error", (err: Error) =>
      console.error("❌ Redis Error:", err)
    );
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log("✅ Redis Connected!");
      } catch (error) {
        console.error("❌ Redis Connection Failed:", error);
        throw error;
      }
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnection();
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    mode?: "EX" | "PX",
    duration?: number
  ): Promise<void> {
    await this.ensureConnection();
    if (mode && duration) {
      await this.client.set(key, value, { [mode]: duration });
    } else {
      await this.client.set(key, value);
    }
  }

  // Add the missing del method
  async del(key: string): Promise<number>;
  async del(keys: string[]): Promise<number>;
  async del(keyOrKeys: string | string[]): Promise<number> {
    await this.ensureConnection();
    if (Array.isArray(keyOrKeys)) {
      return this.client.del(keyOrKeys);
    }
    return this.client.del(keyOrKeys);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.ensureConnection();
    await this.client.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    await this.ensureConnection();
    await this.client.subscribe(channel, callback);
  }

  async ttl(key: string): Promise<number> {
    await this.ensureConnection();
    return this.client.ttl(key);
  }

  async quit(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  duplicate(): RedisClientType {
    return this.client.duplicate();
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
