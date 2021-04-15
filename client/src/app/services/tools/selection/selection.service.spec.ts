import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { LassoShape } from '@app/classes/shapes/lasso-shape';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionService } from './selection.service';

describe('SelectionService', () => {
    let service: SelectionService;
    let mouseEvent: MouseEvent;
    let keyboardEvent: KeyboardEvent;
    let canvasStub: HTMLCanvasElement;
    let ctxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    // tslint:disable: no-any
    let drawImageSpy: jasmine.Spy<any>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;
    let setKeyDownValueSpy: jasmine.Spy<any>;
    let drawSelectionSpy: jasmine.Spy<any>;
    let setDimensionsSpy: jasmine.Spy<any>;
    let startShiftingSpy: jasmine.Spy<any>;
    let clearShiftingSpy: jasmine.Spy<any>;
    let undoRedoSpy: jasmine.SpyObj<any>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let imageHelperSpy: jasmine.SpyObj<ImageHelperService>;

    beforeEach(() => {
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        imageHelperSpy = jasmine.createSpyObj('ImageHelperServe', ['drawOnBaseCtx', 'getSelectedImage', 'getClippedImage']);
        TestBed.configureTestingModule({
            providers: [{ provide: UndoRedoService, useValue: undoRedoSpy }],
        });
        service = TestBed.inject(SelectionService);
        canvasTestHelper = new CanvasTestHelper();
        canvasStub = canvasTestHelper.canvas as HTMLCanvasElement;
        ctxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        drawImageSpy = spyOn<any>(service, 'drawImage').and.callThrough();
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();
        setKeyDownValueSpy = spyOn<any>(service, 'setKeyDownValue').and.callThrough();
        drawSelectionSpy = spyOn<any>(service, 'drawSelection').and.callThrough();
        setDimensionsSpy = spyOn<any>(service, 'setDimensions');
        startShiftingSpy = spyOn<any>(service, 'startShifting').and.callThrough();
        clearShiftingSpy = spyOn<any>(service, 'clearShifting').and.callThrough();
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['saveCanvas', 'clearCanvas']);
        drawingServiceSpy.colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        drawingServiceSpy.undoRedoService = undoRedoSpy;
        service.imageService = imageHelperSpy;
        // tslint:disable:no-string-literal
        service['ctx'] = ctxStub;
        service.canvas = canvasStub;
        drawingServiceSpy.baseCtx = baseCtxStub;
        drawingServiceSpy.previewCtx = previewCtxStub;
        service['drawingService'] = drawingServiceSpy;
        service['oldCorner'] = { x: 0, y: 0 };
        service.currentCorner = { x: 1, y: 1 };
        service.mouseDownCoord = { x: 2, y: 2 };
        service.currentDimensions = { width: 100, height: 100 };
        service['oldDimensions'] = { width: 100, height: 100 };
        service.currentCorner = { x: 5, y: 5 };
        service.shape = new Rectangle(1, 1);
        service.initialShapeCoord = { x: 2, y: 2 };
        service.selectedImage = new Image(0, 0);
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        keyboardEvent = {
            key: ArrowKeys.Right,
        } as KeyboardEvent;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('initialize image should call drawImage', () => {
        const image = {} as HTMLImageElement;
        const shape = new Rectangle(1, 1);
        spyOn<any>(baseCtxStub, 'drawImage');
        service.initializeImage(image, shape, false);
        expect(drawImageSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should not call getPositionFromMouse if not selected', () => {
        service.isSelected = false;
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should call getPositionFromMouse if isSelected', () => {
        service.isSelected = true;
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });
    it('onMouseUp should not call getPositionFromMouse if not mouseDown', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });
    it('onMouseUp should call getPositionFromMouse if mouseDown', () => {
        spyOn<any>(service['ctx'], 'drawImage').and.callFake(() => {
            return;
        });
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });
    it('onMouseMove shouldnt call getPositionFromMouse if mouseDown false', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });
    it('onMouseMove should call getPositionFromMouse if mouseDown true', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });
    it('onKeyDown should not call setKeyDownValue if isSelected is False', () => {
        spyOn<any>(service, 'endDrawing');
        keyboardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.isSelected = false;
        service.onKeyDown(keyboardEvent);

        expect(setKeyDownValueSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should call setKeyDownValue if isSelected is True, key is down, and keyBindings has key', () => {
        service.resizeService.isShiftDown = false;
        keyboardEvent = {
            key: 'Shift',
        } as KeyboardEvent;
        service.isSelected = true;
        service['keyMoveInterval'] = 0;
        service.onKeyDown(keyboardEvent);
        expect(setKeyDownValueSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should not call startShifting if keyMoveInterval is not 0', () => {
        service['keyMoveInterval'] = 1;
        service.onKeyDown(keyboardEvent);
        expect(startShiftingSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should call startShifting if keyMoveInterval is 0 and isSelected is true', () => {
        service.isSelected = true;
        service['keyMoveInterval'] = 0;
        service.onKeyDown(keyboardEvent);
        expect(startShiftingSpy).toHaveBeenCalled();
    });
    it('onKeyUp should not call setKeyDownValue if isSelected is False', () => {
        service.isSelected = false;
        service.onKeyUp(keyboardEvent);
        expect(setKeyDownValueSpy).not.toHaveBeenCalled();
    });
    it('onKeyUp should call setKeyDownValue if isSelected is True and keyBindings has key', () => {
        service.isSelected = true;
        service.onKeyUp(keyboardEvent);
        expect(setKeyDownValueSpy).toHaveBeenCalled();
    });
    it('onKeyUp should not call clearShifting if checkIfAnyKeyIsPressed returns true', () => {
        service.isSelected = true;
        spyOn<any>(service, 'checkIfAnyKeyIsPressed').and.callFake(() => {
            return true;
        });
        service.onKeyUp(keyboardEvent);
        expect(clearShiftingSpy).not.toHaveBeenCalled();
    });
    it('onKeyUp should call clearShifting if checkIfAnyKeyIsPressed returns false', () => {
        service.isSelected = true;
        service.onKeyUp(keyboardEvent);
        expect(clearShiftingSpy).toHaveBeenCalled();
    });
    it('endDrawing should not call drawSelection if isSelected is False', () => {
        service.isSelected = false;
        const canvasSpy = spyOn<any>(service.canvas, 'toDataURL');
        service.selectedImage = new Image(0, 0);
        service.endDrawing();
        expect(drawSelectionSpy).not.toHaveBeenCalled();
        expect(canvasSpy).not.toHaveBeenCalled();
    });
    it('endDrawing should call drawSelection if isSelected is True', () => {
        service.isSelected = true;
        spyOn<any>(baseCtxStub, 'drawImage');
        const canvasSpy = spyOn<any>(service.canvas, 'toDataURL');
        service.selectedImage = new Image(0, 0);
        service.endDrawing();
        expect(drawSelectionSpy).toHaveBeenCalled();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('setDimensions should be called through', () => {
        const newHeight = 200;
        const newDimensions = { width: 1, height: newHeight };
        const setDimensionsSpyCallThrough = setDimensionsSpy.and.callThrough();
        service.setDimensions(newDimensions);
        expect(setDimensionsSpyCallThrough).toHaveBeenCalled();
    });
    it('setCorners should change oldCorner y', () => {
        const newCorners = { x: 2, y: 2 };
        service.setCorners(newCorners);
        expect(service['oldCorner'].y).toBe(2);
    });
    it('selectAll should be called through', fakeAsync(() => {
        const selectAllSpy = spyOn<any>(service, 'selectAll').and.callThrough();
        service.drawingService.canvas = canvasStub;
        const newSize = 500;
        canvasStub.width = newSize;
        canvasStub.height = newSize;
        const spyImage = spyOn<any>(service, 'initializeImage');
        service.selectAll();
        tick();
        expect(selectAllSpy).toHaveBeenCalled();
        expect(imageHelperSpy.getSelectedImage).toHaveBeenCalled();
        expect(spyImage).toHaveBeenCalled();
    }));
    it('addCommand should call undoRedo addCommand if checkIfSelectionMoved returns false', () => {
        service.isSelected = true;
        spyOn<any>(service, 'hasSelectionBeenMoved').and.returnValue(true);
        spyOn<any>(baseCtxStub, 'drawImage');
        const canvasSpy = spyOn<any>(service.canvas, 'toDataURL');
        service.selectedImage = new Image(0, 0);
        service.endDrawing();
        expect(undoRedoSpy.addCommand).toHaveBeenCalled();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('addCommand should not call undoRedo addCommand if checkIfSelectionMoved returns true', () => {
        service.isSelected = true;
        spyOn<any>(service, 'hasSelectionBeenMoved').and.returnValue(false);
        spyOn<any>(baseCtxStub, 'drawImage');
        const canvasSpy = spyOn<any>(service.canvas, 'toDataURL');
        service.selectedImage = new Image(0, 0);
        service.endDrawing();
        expect(undoRedoSpy.addCommand).not.toHaveBeenCalled();
        expect(canvasSpy).toHaveBeenCalled();
    });
    it('checkIfSelectionMoved should call addCommandSpy', () => {
        const addCommandSpy = spyOn<any>(service, 'addCommand').and.callThrough();
        service.addCommand();
        expect(addCommandSpy).toHaveBeenCalled();
    });
    it('applyTransformation should call applyTransformation', () => {
        service.xTransformation = true;
        service.yTransformation = true;
        const spy = spyOn<any>(ctxStub, 'setTransform').and.callThrough();
        service.applyTransformation(ctxStub);
        expect(spy).toHaveBeenCalled();
    });
    it('should context fill if lasso shape on fillShapeWhite', () => {
        service.shape = new LassoShape([{ x: 0, y: 0 }]);
        const spy = spyOn<any>(baseCtxStub, 'fill');
        service.fillShapeWhite();
        expect(spy).toHaveBeenCalled();
    });
    it('should jumpSquare on translate canvas if key jump', () => {
        const spyMagnet = spyOn<any>(service, 'shouldApplyMagnetKeyJump').and.returnValue(true);
        const spyJumpSquare = spyOn<any>(service.magnetism, 'jumpSquare');
        service['translateCanvas']({ x: 0, y: 0 }, 'test');
        expect(spyMagnet).toHaveBeenCalled();
        expect(spyJumpSquare).toHaveBeenCalled();
    });
    it('should call fill shape white if it is result of paste', () => {
        const image = {} as HTMLImageElement;
        const shape = new Rectangle(1, 1);
        spyOn<any>(baseCtxStub, 'drawImage');
        const spy = spyOn<any>(service, 'fillShapeWhite');
        service.initializeImage(image, shape, true);
        expect(drawImageSpy).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });
});
