import { DATABASE_NAME } from '@app/constants';
import { injectable } from 'inversify';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';
// Inspiré de l'exemple du cours
@injectable()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url, this.options);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    get database(): Db {
        return this.db;
    }
}
