import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {
    let service: ClipboardService;
    let canvasStub: HTMLCanvasElement;
    let ctxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClipboardService);
        // const drawingService = new DrawingService(new ColorService(), new UndoRedoService());
        // const magnetismeService = new MagnetismeService(new GridService(drawingService));
        const drawingService = new DrawingService(new ColorService(), new UndoRedoService());
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            'drawImage',
            'addCommand',
            'initializeSelection',
            'endDrawing',
            'initializeImage',
            'getFullCanvasImage',
        ]);
        service.selectionService = selectionServiceSpy;
        selectionServiceSpy.drawingService = drawingService;

        service.shape = new Rectangle(2, 2);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        ctxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        service.selectionService.canvas = canvasStub;
        service.selectionService.ctx = ctxStub;
        service.selectionService.drawingService.baseCtx = ctxStub;
        service.selectionService.currentDimensions = { width: 2, height: 2 };
        service.selectionService.currentCorner = { x: 2, y: 2 };

        // tslint:disable: no-any
        // spyOn<any>(service.selectionService.ctx, 'drawImage');
        // spyOn<any>(service.selectionService.drawingService.baseCtx, 'drawImage');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should copy to clipboard', () => {
        service.selectionService.isSelected = true;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'getSelection');
        service.copy();
        expect(spy).toHaveBeenCalled();
    });

    it('should cut to clipboard', () => {
        service.selectionService.isSelected = true;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        const spyCopy = spyOn(service, 'copy');
        const spyDelete = spyOn(service, 'delete');
        service.cut();
        expect(spyCopy).toHaveBeenCalled();
        expect(spyDelete).toHaveBeenCalled();
    });

    it('should delete to clipboard', () => {
        service.selectionService.isSelected = true;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        spyOn<any>(service.selectionService.drawingService, 'saveCanvas');
        service.delete();
        expect(selectionServiceSpy.addCommand).toHaveBeenCalled();
    });

    it('shouldnt delete if isSelected is false', () => {
        service.selectionService.isSelected = false;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        const spy2 = spyOn(service.selectionService.drawingService, 'saveCanvas');
        service.delete();
        expect(selectionServiceSpy.addCommand).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
    });

    it('paste should call initializeSelection if image is defined', fakeAsync(() => {
        service.image = {} as HTMLImageElement;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        service.paste();
        tick();
        expect(selectionServiceSpy.initializeSelection).toHaveBeenCalled();
    }));

    it('paste with isSelected true should call endDrawing', () => {
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        service.image = {} as HTMLImageElement;
        service.selectionService.isSelected = true;
        service.paste();
        expect(selectionServiceSpy.endDrawing).toHaveBeenCalled();
    });

    it('paste with image undefined shouldnt call initializeSelection', fakeAsync(() => {
        service.paste();
        tick();
        expect(selectionServiceSpy.initializeImage).not.toHaveBeenCalled();
    }));

    it('copy should call getSelection if isSelected is true', () => {
        service.selectionService.isSelected = true;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        service.selectionService.shape = new Rectangle(2, 2);
        service.selectionService.currentDimensions = { width: 2, height: 2 };
        const spy = spyOn<any>(service, 'getSelection').and.callThrough();
        service.copy();
        expect(spy).toHaveBeenCalled();
    });

    it('copy should not call getSelection if isSelected is false', () => {
        service.selectionService.isSelected = false;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        service.selectionService.shape = new Rectangle(2, 2);
        service.selectionService.currentDimensions = { width: 2, height: 2 };
        const spy = spyOn<any>(service, 'getSelection').and.callThrough();
        service.copy();
        expect(spy).not.toHaveBeenCalled();
    });

    it('cut shouldnt call copy if isSelected is false', () => {
        service.selectionService.isSelected = false;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        const spy = spyOn<any>(service, 'copy');
        service.cut();
        expect(spy).not.toHaveBeenCalled();
    });

    it('cut should call copy if isSelected is true', () => {
        service.selectionService.isSelected = true;
        service.selectionService.selectedImage = new Image(0, 0);
        service.selectionService.selectedImage.src = '../../../../../../assets/stamp.svg';
        const spy = spyOn<any>(service, 'copy');
        const spyDelete = spyOn<any>(service, 'delete');
        service.cut();
        expect(spy).toHaveBeenCalled();
        expect(spyDelete).toHaveBeenCalled();
    });
});
