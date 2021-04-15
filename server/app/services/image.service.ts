import { HttpException } from '@app/classes/http-exception';
import { DATABASE_COLLECTION, MIN_NAME_LENGTH } from '@app/constants';
import { Image } from '@app/interfaces/image';
import { TYPES } from '@app/types';
import { HttpStatus } from '@common/http-status-codes/http-status-codes';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { Collection, FilterQuery, FindAndModifyWriteOpResultObject, ObjectId } from 'mongodb';
import * as path from 'path';
import 'reflect-metadata';
import { DatabaseService } from './database.service';

@injectable()
export class ImageService {
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

    get collection(): Collection<Image> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async getAllImages(): Promise<Image[]> {
        return this.collection
            .find({})
            .toArray()
            .then((images: Image[]) => {
                return images;
            })
            .catch(() => {
                throw new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Échec de la tentative de recherche de dessins. Veuillez réessayer plus tard',
                );
            });
    }

    async getImage(imageId: string): Promise<Image> {
        return this.collection
            .findOne({ _id: new ObjectId(imageId) })
            .then((image: Image) => {
                if (!image) {
                    throw new HttpException(
                        HttpStatus.NOT_FOUND,
                        'Échec de la tentative de recherche du dessin. Veuillez choisir un autre ou réessayer plus tard',
                    );
                }
                return image;
            })
            .catch(() => {
                throw new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Échec de la tentative de recherche du dessin. Veuillez choisir un autre ou réessayer plus tard',
                );
            });
    }

    async getImagesByTag(tagNames: string[]): Promise<Image[]> {
        const filterQuery: FilterQuery<Image> = { tags: { $in: tagNames } };
        return this.collection
            .find(filterQuery)
            .toArray()
            .then((image: Image[]) => {
                return image;
            })
            .catch(() => {
                throw new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Échec de la tentative de recherche de dessins. Veuillez réessayer plus tard',
                );
            });
    }

    async addImage(imageToAdd: Image): Promise<void> {
        const message: Image = { name: imageToAdd.name, tags: imageToAdd.tags, _id: imageToAdd._id };
        let id;
        if (this.validateImage(message)) {
            await this.collection
                .insertOne(message)
                .then((result) => {
                    id = result.insertedId;
                })
                .catch(() => {
                    throw new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Échec de la tentative d'insertion du dessin. Veuillez réessayer plus tard",
                    );
                });
            this.base64_decode(imageToAdd.encoding as string, path.resolve(__dirname, '..', 'images', `${id}.png`));
        } else {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Échec de la tentative d'insertion du dessin. Image non valide.");
        }
    }

    async deleteImage(imageId: string): Promise<Image> {
        return this.collection
            .findOneAndDelete({ _id: new ObjectId(imageId) })
            .then((res: FindAndModifyWriteOpResultObject<Image>) => {
                if (!res.value)
                    throw new HttpException(HttpStatus.NOT_FOUND, 'Échec de la tentative de suppression du dessin. Veuillez réessayer plus tard.');
                return res.value;
            })
            .catch(() => {
                throw new HttpException(HttpStatus.NOT_FOUND, 'Échec de la tentative de suppression du dessin. Veuillez réessayer plus tard.');
            });
    }

    private validateImage(image: Image): boolean {
        return this.validateName(image.name) && this.validateTags(image.tags);
    }

    private validateName(name: string): boolean {
        return name.length >= MIN_NAME_LENGTH;
    }

    private validateTags(tags: string[]): boolean {
        for (const tag of tags) {
            if (tag.length < 1) return false;
        }
        return true;
    }

    // https://gist.github.com/crspiccin/790796a68e7178404de4
    base64_encode(file: string): string {
        const bitmap = fs.readFileSync(file);
        return Buffer.from(bitmap).toString('base64');
    }

    base64_decode(base64str: string, file: string): void {
        const bitmap = Buffer.from(base64str, 'base64');
        fs.writeFileSync(file, bitmap);
    }

    removeFile(filePath: string): void {
        fs.unlink(filePath, (error) => {
            if (error) throw new Error('Échec de la tentative de suppression du dessin. Veuillez réessayer plus tard');
        });
    }

    checkIfFileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    filterWithServerImages(images: Image[]): Image[] {
        const newImages: Image[] = [];
        for (const image of images) {
            const filePath = path.resolve(__dirname, '..', 'images', `${image._id}.png`).toString();
            if (this.checkIfFileExists(filePath)) {
                const file = path.resolve(filePath);
                if (file) {
                    image.encoding = this.base64_encode(file);
                    newImages.push(image);
                }
            } else {
                this.deleteImage(image._id.toHexString());
            }
        }
        return newImages;
    }
}
