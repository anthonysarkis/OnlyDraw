import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ImageHelperService } from './image-helper.service';

describe('ImageHelperService', () => {
    let service: ImageHelperService;
    let drawingService: DrawingService;
    let canvasTestHeler: CanvasTestHelper;

    beforeEach(() => {
        canvasTestHeler = new CanvasTestHelper();
        drawingService = new DrawingService({} as ColorService, {} as UndoRedoService);
        drawingService.canvas = canvasTestHeler.canvas;
        drawingService.baseCtx = canvasTestHeler.canvas.getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingService }],
        });
        service = TestBed.inject(ImageHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getClippedImage should call', () => {
        const image = new Image(2, 2);
        const shape = new Rectangle(1, 1);
        const dimensions = { width: 2, height: 2 };
        service.getClippedImage(image, shape, dimensions);
        expect(shape.width).toBe(dimensions.width);
    });

    it('drawOnBaseCtx', () => {
        const image = {} as HTMLImageElement;
        const dimensions = { width: 2, height: 2 };
        // tslint:disable-next-line: no-any
        const drawImageSpy = spyOn<any>(drawingService.baseCtx, 'drawImage');
        service.drawOnBaseCtx(image, { x: 1, y: 1 }, dimensions);
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('getting selected image should get the image URL and image data with defined dimensions', () => {
        // tslint:disable: no-any
        const spyURL = spyOn<any>(drawingService.baseCtx, 'getImageData').and.callThrough();
        const spyData = spyOn<any>(service, 'getImageURL').and.callThrough();
        service.getSelectedImage({ x: 0, y: 0 }, { width: 1, height: 1 });
        expect(spyURL).toHaveBeenCalled();
        expect(spyData).toHaveBeenCalled();
    });

    it('getting selected image should get the image URL and image data without defined dimensions', () => {
        const spyURL = spyOn<any>(drawingService.baseCtx, 'getImageData').and.callThrough();
        const spyData = spyOn<any>(service, 'getImageURL').and.callThrough();
        service.getSelectedImage({ x: 0, y: 0 });
        expect(spyURL).toHaveBeenCalled();
        expect(spyData).toHaveBeenCalled();
    });
});
