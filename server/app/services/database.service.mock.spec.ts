import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { DatabaseServiceMock } from './database.service.mock';
chai.use(chaiAsPromised); // this allows us to test for rejection

// Inspiré de l'exemple du cours
describe('Database mock service', () => {
    let databaseService: DatabaseServiceMock;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();

        // Start a local test server
        mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        // tslint:disable: no-string-literal
        if (databaseService['client'] && databaseService['client'].isConnected()) {
            await databaseService['client'].close();
        }
    });

    // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        chai.expect(databaseService['client']).to.not.be.undefined;
        chai.expect(databaseService.database.databaseName).to.equal('database');
    });

    it('should not connect to the database when start is called with a defined client', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const spyConnect = sinon.spy(MongoClient.prototype, 'connect');
        await databaseService.start(mongoUri);
        chai.expect(spyConnect.calledOnce).to.be.false;
        spyConnect.restore();
    });

    it('should connect to the database when start is called with an undefined client', async () => {
        const spyConnect = sinon.spy(MongoClient.prototype, 'connect');
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        chai.expect(spyConnect.calledOnce).to.be.true;
        spyConnect.restore();
    });

    it('should resolve even if client is undefined', async () => {
        const connectionSpy = sinon.spy(Promise, 'resolve');
        await databaseService.closeConnection();
        chai.expect(connectionSpy.calledOnce).to.be.true;
        connectionSpy.restore();
    });

    it('should no longer be connected if close is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        chai.expect(databaseService['client'].isConnected()).to.be.false;
    });
});
