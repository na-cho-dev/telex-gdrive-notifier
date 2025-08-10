import { createClient, RedisClientType } from "redis";

class RedisSubscriber {
  private subscriber: RedisClientType;
  private isConnected = false;

  constructor() {
    this.subscriber = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    this.subscriber.on("error", (err: Error) =>
      console.error("❌ Redis Subscriber Error:", err)
    );
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.subscriber.connect();
        this.isConnected = true;

        await this.subscriber.subscribe(
          "drive:configUpdated",
          async (message: string) => {
            // Import startDriveWatch dynamically to avoid circular dependency
            const { default: startDriveWatch } = await import(
              "../service/startDriveWatch"
            );
            await startDriveWatch();
          }
        );
      } catch (error) {
        console.error("❌ Redis Subscriber Connection Failed:", error);
        throw error;
      }
    }
  }

  async quit(): Promise<void> {
    if (this.isConnected) {
      await this.subscriber.quit();
      this.isConnected = false;
    }
  }
}

const subscriber = new RedisSubscriber();

export default subscriber;
