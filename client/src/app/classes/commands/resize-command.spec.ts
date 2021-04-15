import { fakeAsync, tick } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { RESIZE_DELAY } from '@app/classes/constants';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { ResizeCommand } from './resize-command';

// tslint:disable:no-string-literal
describe('ResizeCommand', () => {
    let command: ResizeCommand;
    let canvasOperationsSpy: jasmine.SpyObj<CanvasOperationsService>;
    let imageSpy: jasmine.SpyObj<ImageHelperService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas', 'fillCanvasWhite']);
        canvasOperationsSpy = jasmine.createSpyObj('CanvasOperationsService', ['dragSelectMove', 'dragSelectEnd', 'updateCanvasDimensions']);
        imageSpy = jasmine.createSpyObj('ImageHelperService', ['getSelectedImage']);
        imageSpy.drawingService = drawServiceSpy;
        canvasOperationsSpy.canvasDimensions = { width: 0, height: 0 };
        canvasOperationsSpy.imageService = imageSpy;
        command = new ResizeCommand(canvasOperationsSpy, { width: 0, height: 0 });
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });

    it('should clear image and load image when executing command', fakeAsync(() => {
        // tslint:disable: no-any
        const spy = spyOn<any>(command, 'loadImage');
        command.execute();
        expect(spy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    }));

    it('should update canvas dimensions with the right dimensions when calling assign et restore state', () => {
        command.assignState();
        expect(canvasOperationsSpy.updateCanvasDimensions).toHaveBeenCalledWith(
            command['currentDimensions'].width,
            command['currentDimensions'].height,
        );
        command.restoreState();
        expect(canvasOperationsSpy.updateCanvasDimensions).toHaveBeenCalledWith(command['savedDimensions'].width, command['savedDimensions'].height);
    });

    it('should save the right dimensions when calling save state', () => {
        canvasOperationsSpy.canvasDimensions.width = 2;
        canvasOperationsSpy.canvasDimensions.height = 2;
        command.saveState();
        expect(command['savedDimensions']).toEqual(canvasOperationsSpy.canvasDimensions);
    });

    it('should draw image on base ctx when loading image in command', fakeAsync(() => {
        const canvasHelper = new CanvasTestHelper();
        drawServiceSpy.canvas = canvasHelper.canvas;
        const baseCtxStub = canvasHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy.baseCtx = baseCtxStub;
        const spy = spyOn<any>(baseCtxStub, 'drawImage');
        command.loadImage({} as HTMLImageElement);
        tick(RESIZE_DELAY);
        expect(spy).toHaveBeenCalled();
    }));

    it('should be saved', () => {
        command.saveCanvas();
        expect(drawServiceSpy.saveCanvas).toHaveBeenCalled();
    });
});
