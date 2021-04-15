import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Command } from '@app/classes/commands/command';
import { DEFAULT_LINE_THICKNESS, MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { Square } from '@app/classes/shapes/square';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { Shape } from '@app/interfaces/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ShapeService } from './shape.service';

class ShapeStub implements Shape {
    numberOfSides?: number;
    width: number;
    height: number;
    // tslint:disable: no-empty
    drawBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {}
    drawFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {}
    previewBorder(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {}
    previewFill(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {}
    previewContour(ctx: CanvasRenderingContext2D, drawingCoords: Vec2): void {}
}
// tslint:disable:no-any
describe('ShapeService', () => {
    let service: ShapeService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawShapeSpy: jasmine.Spy<any>;
    let previewShapeSpy: jasmine.Spy<any>;

    let mainShape: ShapeStub;
    let alternateShape: ShapeStub;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);
        mainShape = new ShapeStub();
        alternateShape = new ShapeStub();

        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(ShapeService);
        drawShapeSpy = spyOn<any>(service, 'drawShape').and.callThrough();
        previewShapeSpy = spyOn<any>(service, 'previewShape').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['mainShape'] = mainShape;
        service['alternateShape'] = alternateShape;
        service['drawingService'].colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        service['drawingService'].undoRedoService = { addCommand(command: Command): void {} } as UndoRedoService;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not set a line width under the mininum line width', () => {
        const valueLineThickness = -1;
        service.lineThickness = valueLineThickness;
        expect(service.lineThickness).toEqual(MIN_LINE_THICKNESS);
    });

    it('should not set a line width over the maximum line width', () => {
        const valueLineThickness = 1000000000;
        service.lineThickness = valueLineThickness;
        expect(service.lineThickness).toEqual(MAX_LINE_THICKNESS);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.startingCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawShape if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        const spy = spyOn(service, 'addCommand');

        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawShape if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(drawShapeSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call previewShape if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(previewShapeSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call previewShape if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(previewShapeSpy).not.toHaveBeenCalled();
    });

    it(' isAlternateShape should be true on shift down', () => {
        const keyEventShift = {
            key: 'Shift',
        } as KeyboardEvent;
        service.onKeyDown(keyEventShift);
        expect(service.isAlternateShape).toEqual(true);
    });

    it(' isAlternateShape should be false on shift up', () => {
        const keyEventShift = {
            key: 'Shift',
        } as KeyboardEvent;
        service.onKeyUp(keyEventShift);
        expect(service.isAlternateShape).toEqual(false);
    });

    it(' onMouseMove should  call previewFill of shape if filled is selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isFilled = true;
        service.isAlternateShape = false;
        const previewFillSpy = spyOn<any>(service['mainShape'], 'previewFill');
        service.onMouseMove(mouseEvent);
        expect(previewFillSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should  call previewBorder of shape if border is selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isBordered = true;
        service.isAlternateShape = false;
        const previewBorderSpy = spyOn<any>(service['mainShape'], 'previewBorder');
        service.onMouseMove(mouseEvent);
        expect(previewBorderSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call previewBorder of shape if border is not selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isBordered = false;
        service.isAlternateShape = false;
        const previewBorderSpy = spyOn<any>(service['mainShape'], 'previewBorder');
        service.onMouseMove(mouseEvent);
        expect(previewBorderSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should  call drawFill of shape if filled is selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isFilled = true;
        service.isAlternateShape = false;
        const spy = spyOn(service, 'addCommand');
        const previewFillSpy = spyOn<any>(service['mainShape'], 'drawFill');
        service.onMouseUp(mouseEvent);
        expect(previewFillSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should  call drawBorder of shape if border is selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isBordered = true;
        service.isAlternateShape = false;
        const spy = spyOn(service, 'addCommand').and.callThrough();
        const drawBorderSpy = spyOn<any>(service['mainShape'], 'drawBorder');
        service.onMouseUp(mouseEvent);
        expect(drawBorderSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should  not call drawBorder of shape if border is selected', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isBordered = false;
        service.isAlternateShape = false;
        const spy = spyOn(service, 'addCommand');
        const drawBorderSpy = spyOn<any>(service['mainShape'], 'drawBorder');
        service.onMouseUp(mouseEvent);
        expect(drawBorderSpy).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawShape of mainShape if shift not pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.isAlternateShape = false;
        service.mouseDown = true;
        const spy = spyOn(service, 'addCommand');
        service.onMouseUp(mouseEvent);
        const shape = drawShapeSpy.calls.mostRecent().args[0];
        expect(shape).toBe(mainShape);
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawShape of alternateShape if shift pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.isAlternateShape = true;
        service.mouseDown = true;
        const spy = spyOn(service, 'addCommand');
        service.onMouseUp(mouseEvent);
        const shape = drawShapeSpy.calls.mostRecent().args[0];
        expect(shape).toBe(alternateShape);
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseMove should call previewShape of mainShape if shift not pressed', () => {
        service.startingCoord = { x: 0, y: 0 };
        service.isAlternateShape = false;
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        const shape = previewShapeSpy.calls.mostRecent().args[0];
        expect(shape).toBe(mainShape);
    });

    it(' onMouseMove should call previewShape of alternateShape if shift pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.isAlternateShape = true;
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        const shape = previewShapeSpy.calls.mostRecent().args[0];
        expect(shape).toBe(alternateShape);
    });

    it(' Escape should call clearCanvas', () => {
        const keyEventEscape = {
            key: 'Escape',
        } as KeyboardEvent;
        service.onKeyDown(keyEventEscape);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' initializeProperties initialize baseCtx and previewCtx lineWidth to the default thickness at first', () => {
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
        expect(service['drawingService'].previewCtx.lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
    });

    it(' preview shape should be called on shift down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['alternateShape'] = new Square(0, 0);
        service.lastMousePosition = { x: 0, y: 0 };
        const keyEventShift = {
            key: 'Shift',
        } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyDown(keyEventShift);
        expect(previewShapeSpy).toHaveBeenCalled();
    });

    it(' preview shape should be called on shift down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['alternateShape'] = new Square(0, 0);
        service.lastMousePosition = { x: 0, y: 0 };
        const keyEventShift = {
            key: 'Shift',
        } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyUp(keyEventShift);
        expect(previewShapeSpy).toHaveBeenCalled();
    });

    it(' preview shape should not be called on shift down', () => {
        const keyEventShift = {
            key: 'Foss',
        } as KeyboardEvent;
        service.mouseDown = true;
        service.onKeyUp(keyEventShift);
        expect(previewShapeSpy).not.toHaveBeenCalled();
    });
    it(' endDrawing should restore context style', () => {
        const restoreSpy = spyOn<any>(service, 'restoreContextStyle').and.callThrough();
        const drawingSpy = spyOn<any>(service, 'endDrawing').and.callThrough();
        service.endDrawing();
        expect(restoreSpy).toHaveBeenCalled();
        expect(drawingSpy).toHaveBeenCalled();
    });
});
