import { HttpException } from '@app/classes/http-exception';
import { Image } from '@app/interfaces/image';
import { ImageService } from '@app/services/image.service';
import { HttpStatus } from '@common/http-status-codes/http-status-codes';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { TYPES } from '../types';

@injectable()
export class ImageController {
    router: Router;

    constructor(@inject(TYPES.ImageService) private imageService: ImageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            this.imageService
                .getAllImages()
                .then((images: Image[]) => {
                    res.json(this.imageService.filterWithServerImages(images));
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });

        this.router.get('/id/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.imageService
                .getImage(req.params.id)
                .then((image: Image) => {
                    const filePath = path.resolve(__dirname, '..', 'images', `${image._id}.png`);
                    const base64Str = this.imageService.base64_encode(filePath);
                    image.encoding = base64Str;
                    res.json(image);
                })
                .catch((error: HttpException) => {
                    res.status(HttpStatus.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/tag/', async (req: Request, res: Response, next: NextFunction) => {
            const tags = req.query.tags.split(',');
            this.imageService
                .getImagesByTag(tags)
                .then((images: Image[]) => {
                    res.json(this.imageService.filterWithServerImages(images));
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            this.imageService
                .addImage(req.body)
                .then(() => {
                    res.send();
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });

        this.router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.imageService
                .deleteImage(req.params.id)
                .then((image: Image) => {
                    const filePath = path.resolve(__dirname, '..', 'images', `${image._id}.png`);
                    this.imageService.removeFile(filePath);
                    res.send();
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });
    }
}
