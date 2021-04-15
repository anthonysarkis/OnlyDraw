import { HttpException } from '@app/classes/http-exception';
import { Image } from '@app/interfaces/image';
import { HttpStatus } from '@common/http-status-codes/http-status-codes';
import { ObjectID } from 'bson';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { ImageService } from '../services/image.service';
import { TYPES } from '../types';

// tslint:disable:no-any

describe('ImageController', () => {
    let imageService: Stubbed<ImageService>;
    let app: Express.Application;
    const expectedMessage: Image = { name: 'test', tags: ['test'], _id: new ObjectID('6057ef87bbb4df3f2cdc5692') } as Image;
    const expectedArray = [expectedMessage];

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.ImageService).toConstantValue({
            getImage: sandbox.stub(),
            base64_encode: sandbox.stub(),
            getImagesByTag: sandbox.stub().resolves(expectedArray),
            filterWithServerImages: sandbox.stub().returns(expectedArray),
            getAllImages: sandbox.stub(),
            addImage: sandbox.stub(),
            removeFile: sandbox.stub(),
            deleteImage: sandbox.stub(),
        });
        imageService = container.get(TYPES.ImageService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return image from image on get request with id', async () => {
        imageService.getImage.resolves(expectedMessage);

        return supertest(app)
            .get('/api/image/id/6057ef87bbb4df3f2cdc5692')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                expect(response.body.name).to.deep.equal(expectedMessage.name);
            });
    });

    it('should delete image from image on get delete with id', async () => {
        imageService.deleteImage.resolves(expectedMessage);

        return supertest(app)
            .delete('/api/image/6057ef87bbb4df3f2cdc5692')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('should return image from imageservice on get request with tag', async () => {
        imageService.getImagesByTag.resolves(expectedArray);

        return supertest(app)
            .get('/api/image/tag/?tags=be')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                expect(response.body).to.be.a('array');
            });
    });

    it('should return all images from imageservice on get request with all', async () => {
        imageService.getAllImages.resolves(expectedArray);

        return supertest(app)
            .get('/api/image/')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                expect(response.body).to.be.a('array');
            });
    });

    it('should add image with imageservice on post request', async () => {
        imageService.addImage.resolves();

        return supertest(app).post('/api/image/').send(expectedMessage).expect(HttpStatus.OK);
    });

    it('should return an error as a message on get image fail', async () => {
        imageService.getImage.rejects(new Error('service error'));

        return supertest(app)
            .get('/api/image/id/6057ef87bbb4df3f2cdc5692')
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should return an error as a message on post fail', async () => {
        const error = new HttpException(HttpStatus.NOT_FOUND, 'service error');
        imageService.addImage.rejects(error);
        return supertest(app)
            .post('/api/image')
            .send(expectedMessage)
            .then((response: any) => {
                expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should return an error as a message on get tag fail', async () => {
        const error = new HttpException(HttpStatus.NOT_FOUND, 'service error');
        imageService.getImagesByTag.rejects(error);

        return supertest(app)
            .get('/api/image/tag/?tags=be')
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should return an error as a message on get all fail', async () => {
        const error = new HttpException(HttpStatus.NOT_FOUND, 'service error');
        imageService.getAllImages.rejects(error);

        return supertest(app)
            .get('/api/image/')
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should send an error when deleting invalid image', async () => {
        const error = new HttpException(HttpStatus.NOT_FOUND, 'service error');
        imageService.deleteImage.rejects(error);
        return supertest(app)
            .delete('/api/image/id')
            .then((response: any) => {
                expect(response.status).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});
