import { Image } from '@app/interfaces/image';
import { ObjectID } from 'bson';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import * as path from 'path';
import * as sinon from 'sinon';
import { DatabaseServiceMock } from './database.service.mock';
import { ImageService } from './image.service';
// tslint:disable: no-unused-expression

describe('Image Service', () => {
    let imageService: ImageService;
    const expectedMessage1: Image = { name: '6047ef87bbb4df3f2cdc5692', tags: ['test1'], _id: new ObjectID('6057ef87bbb4df3f2cdc5692') } as Image;
    const expectedMessage2: Image = { name: '6047ef87bbb4df3f2cdc5692', tags: ['test2'], _id: new ObjectID('6057fe3ebbb4df3f2cdc569f') } as Image;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start('database')) as MongoClient;
        // tslint:disable: no-any
        imageService = new ImageService(databaseService as any);
        await imageService.collection.insertOne(expectedMessage1);
        await imageService.collection.insertOne(expectedMessage2);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('getAllImages should return all images', async () => {
        const expectedResult: Image[] = [expectedMessage1, expectedMessage2];
        const actualResult = await imageService.getAllImages();
        expect(actualResult).to.deep.equal(expectedResult);
    });

    it('getImagesByTag should return images with corresponding tags', async () => {
        const expectedResult: Image[] = [expectedMessage1];
        const actualResult = await imageService.getImagesByTag(['test1']);
        expect(actualResult).to.deep.equal(expectedResult);
    });

    it('addImage should add a new image', async () => {
        const base64spy = sinon.spy(imageService, 'base64_decode');
        const newImage: Image = { name: 'test', tags: ['test1'], encoding: 'foss' } as Image;
        await imageService.addImage(newImage);
        const images = await imageService.collection.find({}).toArray();

        expect(images.length).to.equal(3);
        const huhu = images.find((x) => x.name === newImage.name) as Image;
        expect(huhu).not.to.be.undefined;
        expect(base64spy.calledOnce).to.be.true;
        base64spy.restore();
        const filePath = path.resolve(__dirname, '..', 'images', `${huhu._id.toHexString()}.png`);
        imageService.removeFile(path.resolve(filePath));
    });

    it('addImage should add a new image', async () => {
        const base64spy = sinon.spy(imageService, 'base64_decode');
        const newImage: Image = { name: 'test', tags: ['test1'], encoding: 'foss' } as Image;
        await imageService.addImage(newImage);
        const images = await imageService.collection.find({}).toArray();

        expect(images.length).to.equal(3);
        const huhu = images.find((x) => x.name === newImage.name) as Image;
        expect(huhu).not.to.be.undefined;
        expect(base64spy.calledOnce).to.be.true;
        base64spy.restore();
        const filePath = path.resolve(__dirname, '..', 'images', `${huhu._id.toHexString()}.png`);
        imageService.removeFile(filePath);
    });

    it('addImage should throw error if tag length is less than 1', async () => {
        const newImage: Image = { name: 'test', tags: [''], encoding: 'foss' } as Image;
        expect(imageService.addImage(newImage)).to.eventually.be.rejectedWith(Error);
    });

    it('addImage should not add a new image if it is invalid', async () => {
        const newImage: Image = { name: 'to', tags: ['test1'], encoding: 'foss' } as Image;
        try {
            await imageService.addImage(newImage);
        } catch {
            const images = await imageService.collection.find({}).toArray();
            expect(images.length).to.equal(2);
        }
    });

    it('should delete an existing image data if a valid id is sent', async () => {
        await imageService.deleteImage('6057ef87bbb4df3f2cdc5692');
        const images = await imageService.collection.find({}).toArray();
        expect(images.length).to.equal(1);
    });

    it('getImage should return the image with the corresponding id', async () => {
        const expectedResult: Image = expectedMessage1;
        const actualResult = await imageService.getImage('6057ef87bbb4df3f2cdc5692');
        expect(actualResult).to.deep.equal(expectedResult);
    });

    it('should not delete an image if it has an invalid id ', async () => {
        expect(imageService.deleteImage('6047ef87bbb4dW3f2cdc5692')).to.eventually.be.rejectedWith(Error);
    });

    it('validate image should return true if image is valid ', async () => {
        // tslint:disable: no-string-literal
        expect(imageService['validateImage'](expectedMessage1)).to.be.true;
    });

    it('filterWithServerImages should only return images that are both in the db and in the server ', async () => {
        const newImage: Image = { name: 'nameTest', tags: ['bonjus'], encoding: 'foss' } as Image;
        await imageService.addImage(newImage);
        const images = await imageService.collection.find({}).toArray();
        const huhu = images.find((x) => x.name === newImage.name) as Image;
        sinon
            .stub(ImageService.prototype, 'deleteImage')
            .onFirstCall()
            .returns({} as Promise<Image>)
            .onSecondCall()
            .returns({} as Promise<Image>);
        const expectedResult: Image[] = [expectedMessage1, expectedMessage2, huhu];
        const actualResult = imageService.filterWithServerImages(expectedResult);
        expect(actualResult.length).to.equal(1);
        imageService.removeFile(path.resolve(((__dirname + '../../images/' + huhu._id.toHexString()) as string) + '.png'));
        sinon.restore();
    });

    // Error handling
    describe('Error handling', async () => {
        it('should throw an error if we try to get all images on a closed connection', async () => {
            await client.close();
            expect(imageService.getAllImages()).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an error if we try to get a specific image on a closed connection', async () => {
            await client.close();
            expect(imageService.getImage('6057ef87bbb4df3f2cdc5692')).to.eventually.be.rejectedWith(Error);
        });

        it('getImage should not return an image if an invalid id is sent', async () => {
            expect(imageService.getImage('6057ef87bbb4df3f2cdc5693')).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an error if we try to delete a specific image on a closed connection', async () => {
            await client.close();
            expect(imageService.deleteImage('6057ef87bbb4df3f2cdc5692')).to.eventually.be.rejectedWith(Error);
        });

        it('deleteImage should not delete an image if an invalid id is sent', async () => {
            expect(imageService.deleteImage('6057ef87bbb4df3f2cdc5693')).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an error if we try to add an image on a closed connection', async () => {
            await client.close();
            const newImage: Image = { name: 'test', tags: ['test1'], encoding: 'foss' } as Image;
            expect(imageService.addImage(newImage)).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an error if we try to add an invalid image', async () => {
            const newImage: Image = { name: '', tags: ['', 'c', 'a', 'p'] } as Image;
            expect(imageService.addImage(newImage)).to.eventually.be.rejectedWith(Error);
        });

        it('should throw an error if we try to get all images of a specific tag on a closed connection', async () => {
            await client.close();
            expect(imageService.getImagesByTag(['test1'])).to.eventually.be.rejectedWith(Error);
        });
    });
});
