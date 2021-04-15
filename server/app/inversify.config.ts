import { Container } from 'inversify';
import { Application } from './app';
import { ImageController } from './controllers/image.controller';
import { Server } from './server';
import { DatabaseService } from './services/database.service';
import { ImageService } from './services/image.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.ImageController).to(ImageController);

    container.bind(TYPES.ImageService).to(ImageService);
    container.bind(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();

    return container;
};
