import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { END, SELECTION_CONTAINER, START } from '@app/classes/constants';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { ClipboardKeys } from '@app/enums/clipboard-keys';
import { MouseButton } from '@app/enums/mouse-buttons';
import { SelectionShapeService } from './selection-shape.service';

describe('SelectionShapeService', () => {
    let service: SelectionShapeService;
    let keyboardEvent: KeyboardEvent;
    let mouseEvent: MouseEvent;

    // tslint:disable: no-any
    let onKeyUpSpy: jasmine.Spy<any>;
    let cancelSelectionSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionShapeService);

        mouseEvent = ({
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.Left,
            target: { className: SELECTION_CONTAINER },
        } as unknown) as MouseEvent;
        keyboardEvent = { key: ArrowKeys.Down } as KeyboardEvent;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable: no-string-literal
        onKeyUpSpy = spyOn<any>(service['shapeService'], 'onKeyUp');
        cancelSelectionSpy = spyOn<any>(service, 'cancelSelection').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        const canvasSize = 250;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;
        const shapeSize = 5;

        service['shapeService']['mainShape'] = new Rectangle(shapeSize, shapeSize);
        service['shapeService']['alternateShape'] = new Rectangle(shapeSize, shapeSize);
        service['selectionService'].canvas = canvasStub;
        service['selectionService'].ctx = previewCtxStub;
        service['selectionService'].shape = new Rectangle(shapeSize, shapeSize);
        service['selectionService'].currentDimensions = { width: 2, height: 2 };
        service['selectionService'].selectedImage = new Image(0, 0);
        spyOn<any>(service['selectionService']['drawingService'].baseCtx, 'drawImage');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onKeyUp should call shapeService.onKeyUp', () => {
        service.onKeyUp(keyboardEvent);
        expect(onKeyUpSpy).toHaveBeenCalled();
    });

    it('onKeyUp should not call shapeService.onKeyUp if isSelected is true', () => {
        service['selectionService'].isSelected = true;
        service.onKeyUp(keyboardEvent);
        expect(onKeyUpSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should call setContextStyle if isSelected is true', () => {
        service['selectionService'].isSelected = true;
        service.onMouseDown(mouseEvent);
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should not call setContextStyle if isSelected is false', () => {
        service['selectionService'].isSelected = false;
        service.onMouseDown(mouseEvent);
        expect(cancelSelectionSpy).not.toHaveBeenCalled();
    });

    it('cancelSelection in onMouseDown should call resetShapeDimensions', () => {
        service['selectionService'].isSelected = true;
        const newMouseEvent = ({
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.Left,
            target: { className: 'bonjus' },
        } as unknown) as MouseEvent;
        const resetShapeDimensionsSpy = spyOn<any>(service, 'resetShapeDimensions').and.callThrough();
        service.onMouseDown(newMouseEvent);
        expect(resetShapeDimensionsSpy).toHaveBeenCalled();
    });

    it('onMouseUp should not call restoreContextStyle if clickedOutside is true', () => {
        service['selectionService'].isSelected = true;
        service['selectionService'].isBorderSelected = false;
        const restoreContextStyleSpy = spyOn<any>(service, 'restoreContextStyle').and.callThrough();
        service.onMouseUp(mouseEvent);
        expect(restoreContextStyleSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call restoreContextStyle if clickedOutside is false and mouseDown is true', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        const restoreContextStyleSpy = spyOn<any>(service, 'restoreContextStyle').and.callThrough();
        service.onMouseUp(mouseEvent);
        expect(restoreContextStyleSpy).toHaveBeenCalled();
    });

    it('initialize properties should set baseCtx lineWidth to default', () => {
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(2);
    });

    it('onKeyDown should call shapeService.onKeyDown if isSelected is false', () => {
        service['selectionService'].isSelected = false;
        const onKeyDownSpy = spyOn<any>(service['shapeService'], 'onKeyDown');
        service.onKeyDown(keyboardEvent);
        expect(onKeyDownSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call shapeService.onKeyDown if isSelected is true', () => {
        service['selectionService'].isSelected = true;
        const onKeyDownSpy = spyOn<any>(service['shapeService'], 'onKeyDown');
        service.onKeyDown(keyboardEvent);
        expect(onKeyDownSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call endDrawing if isSelected is false and key is Escape', () => {
        service['selectionService'].isSelected = false;
        const endDrawingSpy = spyOn<any>(service, 'endDrawing');
        keyboardEvent = { key: 'Escape' } as KeyboardEvent;
        service.onKeyDown(keyboardEvent);
        expect(endDrawingSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call onClipboardKeyDown if mouseDown is true', () => {
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'onClipboardKeyDown');
        service.onKeyDown(keyboardEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onMouseMove should not call shapeService.onMouseMove if isSelected is true or mouseDown is false', () => {
        service.mouseDown = false;
        const spy = spyOn<any>(service['shapeService'], 'onMouseMove');
        service.onMouseMove(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call shapeService.onMouseMove if isSelected is false and mouseDown is true', () => {
        service.mouseDown = true;
        service['selectionService'].isSelected = false;
        const onMouseMoveSpy = spyOn<any>(service['shapeService'], 'onMouseMove');
        service.onMouseMove(mouseEvent);
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });
    it('endDrawing should call restoreContextStyle', () => {
        const restoreContextStyleSpy = spyOn<any>(service, 'restoreContextStyle').and.callThrough();
        service.endDrawing();
        expect(restoreContextStyleSpy).toHaveBeenCalled();
    });
    it('onMouseUp should set shape to alternateShape if isAlternateShape is true', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        service['shapeService'].isAlternateShape = true;
        service.onMouseUp(mouseEvent);
        expect(service.shape).toBe(service['shapeService'].alternateShape);
    });
    it('onMouseUp should set shape to mainShape if isAlternateShape is false', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        service['shapeService'].isAlternateShape = false;
        service.onMouseUp(mouseEvent);
        expect(service.shape).toBe(service['shapeService'].mainShape);
    });
    it('getPositionInCanvas should be canvasWidth if mousePosition.x is over canvasWidth', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        const mousePositionValue = 3000;
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: mousePositionValue, y: mousePositionValue });
        const canvasSize = 250;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;
        service.onMouseMove(mouseEvent);
        expect(service['corners'][END].x).toBe(canvasSize);
    });
    it('getPositionInCanvas should be 0 if mousePosition.x is negative', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: -2, y: -2 });
        const canvasSize = 250;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;
        service.onMouseMove(mouseEvent);
        expect(service['corners'][END].x).toBe(0);
    });
    it('getPositionInCanvas should be mousePosition.x if mousePosition.x is good value', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 2, y: 2 });
        const canvasSize = 250;
        canvasStub.width = canvasSize;
        canvasStub.height = canvasSize;
        service.onMouseMove(mouseEvent);
        expect(service['corners'][END].x).toBe(2);
    });
    it('swapCorners should be called if corners START > corners END', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        service['corners'][START] = { x: 2, y: 2 };
        service['corners'][END] = { x: 0, y: 0 };
        const swapCornersSpy = spyOn<any>(service['mathService'], 'swapCorners');
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 0, y: 0 });
        spyOn<any>(service['mathService'], 'calculateShiftedCorners');

        service.onMouseUp(mouseEvent);
        expect(swapCornersSpy).toHaveBeenCalled();
    });
    it('swapCorners should be not called if corners END > corners START', () => {
        service['selectionService'].isSelected = false;
        service.mouseDown = true;
        service['corners'][START] = { x: 0, y: 0 };
        const swapCornersSpy = spyOn<any>(service['mathService'], 'swapCorners');
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 2, y: 2 });
        spyOn<any>(service['mathService'], 'calculateShiftedCorners');

        service.onMouseUp(mouseEvent);
        expect(swapCornersSpy).not.toHaveBeenCalled();
    });
    it('resetShapeDimensions should not assign width value to shape if shape undefined', () => {
        service.endDrawing();
        expect(service.shape).not.toBeTruthy();
    });

    it('resetShapeDimensions should assign width value to 0 if shape is not undefined', () => {
        service.shape = new Rectangle(2, 2);
        service.endDrawing();
        expect(service.shape.width).toBe(0);
    });

    it('onClipboardKeyDown should delete', () => {
        const spy = spyOn<any>(service.clipboard, 'delete');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Delete,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should cut', () => {
        const spy = spyOn<any>(service.clipboard, 'cut');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Cut,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should copy', () => {
        const spy = spyOn<any>(service.clipboard, 'copy');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Copy,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('onClipboardKeyDown should paste', () => {
        const spy = spyOn<any>(service.clipboard, 'paste');
        service['onClipboardKeyDown']({
            key: ClipboardKeys.Paste,
            ctrlKey: true,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent);
        expect(spy).toHaveBeenCalled();
    });
});
