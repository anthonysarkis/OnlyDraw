import * as http from 'http';
import { inject, injectable } from 'inversify';
import { Application } from './app';
import { ALTERNATIVE_PORT, DATABASE_URL } from './constants';
import { DatabaseService } from './services/database.service';
import { TYPES } from './types';

@injectable()
export class Server {
    private readonly baseDix: number = 10;
    private readonly appPort: string | number | boolean = this.normalizePort(process.env.PORT || ALTERNATIVE_PORT);
    private server: http.Server;

    constructor(
        @inject(TYPES.Application) private application: Application,
        @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    ) {}

    async init(): Promise<void> {
        this.application.app.set('port', this.appPort);

        this.server = http.createServer(this.application.app);

        this.server.listen(this.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        try {
            await this.databaseService.start(DATABASE_URL);
            console.log('Database connection successful !');
        } catch {
            console.error('Database connection failed !');
            process.exit(1);
        }
    }

    private normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof this.appPort === 'string' ? 'Pipe ' + this.appPort : 'Port ' + this.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address();
        // tslint:disable-next-line:no-non-null-assertion
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr!.port}`;
        // tslint:disable-next-line:no-console
        console.log(`Listening on ${bind}`);
    }
}
