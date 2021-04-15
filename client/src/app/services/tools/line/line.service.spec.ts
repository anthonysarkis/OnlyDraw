import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Command } from '@app/classes/commands/command';
import {
    DEFAULT_LINE_CAP,
    DEFAULT_LINE_THICKNESS,
    MAX_LINE_THICKNESS,
    MAX_POINT_DIAMETER,
    MIN_LINE_THICKNESS,
    MIN_POINT_DIAMETER,
} from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineService } from './line.service';

// tslint:disable:no-any
describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawSpy: jasmine.Spy<any>;
    let drawAllSegmentsSpy: jasmine.Spy<any>;
    let drawHoveringLineSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSlideToggleModule, MatSliderModule, FormsModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(LineService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        service['drawingService'].undoRedoService = {
            addCommand(command: Command): void {
                return;
            },
        } as UndoRedoService;

        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        drawAllSegmentsSpy = spyOn<any>(service, 'drawAllSegments').and.callThrough();
        drawHoveringLineSpy = spyOn<any>(service, 'drawHoveringLine').and.callThrough();
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
            preventDefault: () => {
                return;
            },
        } as MouseEvent;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' onMouseDown should set mouseDownCoord to correct position if mouse event was a left click', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
    });
    it(' onMouseDown should only call drawAllSegments and drawHoveringLine if mouse event was a left click', () => {
        service.onMouseDown(mouseEvent);
        expect(drawAllSegmentsSpy).toHaveBeenCalled();
        expect(drawHoveringLineSpy).toHaveBeenCalled();
        const rightMouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
            preventDefault: () => {
                return;
            },
        } as MouseEvent;
        service.onMouseDown(rightMouseEvent);
    });
    it(' onMouseDown should call drawAllSegments and drawPoint if mouse event was a left click', () => {
        const arcSpy = spyOn<any>(service['drawingService'].previewCtx, 'arc').and.callThrough();
        const drawPointSpy = spyOn<any>(service, 'drawPoint').and.callThrough();
        service.showJunctionPoints = true;
        service.pathData = [{ x: 0, y: 10 }];
        service.onMouseDown(mouseEvent);

        expect(drawAllSegmentsSpy).toHaveBeenCalled();
        expect(drawPointSpy).toHaveBeenCalled();
        expect(drawHoveringLineSpy).toHaveBeenCalled();
        expect(arcSpy).toHaveBeenCalled();
    });
    it(' onMouseDown should increment pathData length if mouse event was a left click', () => {
        service.pathData = [];
        const expectedPathDataLength = service.pathData.length;
        service.onMouseDown(mouseEvent);
        expect(service.pathData.length).toEqual(expectedPathDataLength + 1);
    });
    it(' onMouseDown should add the correct position if left click and shift was not already down', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.pathData[service.pathData.length - 1]).toEqual(expectedResult);
    });
    it(' onMouseDown should add the correct position if left click and shift was already down', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.shiftedPosition = expectedResult;
        service.shiftDown = true;
        service.onMouseDown(mouseEvent);
        expect(service.pathData[service.pathData.length - 1]).toEqual(expectedResult);
    });
    it(' onMouseMove should set mouseDownCoord to correct position if pathData contains at least one point', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.pathData = [{ x: 0, y: 0 }];
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });
    it(' onMouseMove should call draw if pathData contains at least one point', () => {
        const moveToSpy = spyOn<any>(service['drawingService'].previewCtx, 'moveTo').and.callThrough();
        const lineToSpy = spyOn<any>(service['drawingService'].previewCtx, 'lineTo').and.callThrough();
        service.pathData = [{ x: 25, y: 25 }];
        service.onMouseMove(mouseEvent);
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });
    it(" onMouseMove should not call draw if pathData doesn't contain any points", () => {
        service.pathData = [];
        service.onMouseMove(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });
    it(' onDoubleClick should call drawAllSegments if pathData contains at least two points', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ];
        const spy = spyOn(service, 'addCommand').and.callThrough();
        service.onDoubleClick(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawAllSegmentsSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
    it(' onDoubleClick should not call drawAllSegments if pathData contains less than two points', () => {
        service.pathData = [];
        service.onDoubleClick(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(drawAllSegmentsSpy).not.toHaveBeenCalled();
    });
    it(' onDoubleClick should set mouseDownCoord to the correct position if shiftDown was not already pressed', () => {
        const expectedResult = { x: 25, y: 25 };
        const spy = spyOn(service, 'addCommand');
        service.shiftDown = false;
        service.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ];
        service.onDoubleClick(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(service.mouseDownCoord).toEqual(expectedResult);
        expect(spy).toHaveBeenCalled();
    });
    it(' onDoubleClick should set mouseDownCoord to the correct position if shiftDown was already pressed', () => {
        const notExpectedResult = { x: 25, y: 25 };
        service.shiftDown = true;
        service.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ];
        const spy = spyOn(service, 'addCommand');
        service.onDoubleClick(mouseEvent);
        expect(service.pathData[service.pathData.length - 1]).not.toEqual(notExpectedResult);
        expect(spy).toHaveBeenCalled();
    });
    it(' onDoubleClick should clear the pathData if it contains contains at least two points', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ];
        const spy = spyOn(service, 'addCommand');
        service.onDoubleClick(mouseEvent);
        expect(service.pathData).toEqual([]);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawAllSegmentsSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
    it(' onKeyDown should call onBackspaceEvent if pathData contains at least one point', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.mouseDownCoord = { x: 2, y: 2 };
        const onBackspaceEventSpy = spyOn<any>(service, 'onBackspaceEvent').and.callThrough();
        const keyBoardEvent = { key: 'Backspace' } as KeyboardEvent;
        service.onKeyDown(keyBoardEvent);
        expect(onBackspaceEventSpy).toHaveBeenCalled();
        service.pathData = [{ x: 2, y: 2 }];
        service.onKeyDown(keyBoardEvent);
        expect(service.pathData.length).toBe(1);
    });
    it(" onKeyDown should not call any events if pathData doesn't contain any points", () => {
        service.pathData = [];
        const onBackspaceEventSpy = spyOn<any>(service, 'onBackspaceEvent').and.callThrough();
        const onShiftEventSpy = spyOn<any>(service, 'onShiftEvent').and.callThrough();
        const onEscapeEventSpy = spyOn<any>(service, 'onEscapeEvent').and.callThrough();
        const keyBoardEvent = { key: 'Backspace' } as KeyboardEvent;
        service.onKeyDown(keyBoardEvent);
        expect(onBackspaceEventSpy).not.toHaveBeenCalled();
        expect(onEscapeEventSpy).not.toHaveBeenCalled();
        expect(onShiftEventSpy).not.toHaveBeenCalled();
    });
    it(' onKeyDown should call onEscapeEvent if pathData contains at least one point', () => {
        service.pathData = [{ x: 0, y: 0 }];
        const keyBoardEvent = { key: 'Escape' } as KeyboardEvent;
        const onEscapeEventSpy = spyOn<any>(service, 'onEscapeEvent').and.callThrough();
        service.onKeyDown(keyBoardEvent);
        expect(onEscapeEventSpy).toHaveBeenCalled();
    });
    it(' onKeyDown should call onShiftEvent if pathData contains at least one point', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData = [service.mouseDownCoord];
        const onShiftEventSpy = spyOn<any>(service, 'onShiftEvent').and.callThrough();
        const keyBoardEvent = { key: 'Shift' } as KeyboardEvent;
        service.onKeyDown(keyBoardEvent);
        expect(service.shiftDown).toEqual(true);
        expect(onShiftEventSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
        service.shiftDown = true;
        service.onKeyDown(keyBoardEvent);
        expect(service.shiftDown).toEqual(true);
    });
    it(' onKeyUp should set shiftDown to false if shiftDown was already true and shift is not pressed', () => {
        const keyBoardEvent = { shiftKey: false } as KeyboardEvent;
        service.shiftDown = true;
        service.onKeyUp(keyBoardEvent);
        expect(service.shiftDown).toEqual(false);
    });
    it(' onKeyUp should not set shiftDown to false if shiftDown was already false or shift is pressed', () => {
        const keyBoardEvent = { shiftKey: true } as KeyboardEvent;
        service.shiftDown = true;
        service.onKeyUp(keyBoardEvent);
        expect(service.shiftDown).toEqual(true);
    });
    it(' onKeyUp should call draw if pathData contains at least one point', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData = [service.mouseDownCoord];
        service.shiftDown = true;
        const keyBoardEvent = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(keyBoardEvent);
        expect(drawSpy).toHaveBeenCalled();
    });
    it(" onKeyUp should not call draw if pathData doesn't contain any points", () => {
        service.pathData = [];
        const keyBoardEvent = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(keyBoardEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });
    it(' initializeProperties initialize baseCtx and previewCtx lineWidth to the default thickness at first', () => {
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
        expect(service['drawingService'].previewCtx.lineWidth).toEqual(DEFAULT_LINE_THICKNESS);
    });
    it(' initializeProperties initialize baseCtx and previewCtx lineCap to round at first', () => {
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineCap).toEqual(DEFAULT_LINE_CAP);
        expect(service['drawingService'].previewCtx.lineCap).toEqual(DEFAULT_LINE_CAP);
    });
    it(' initializeProperties initialize baseCtx and previewCtx lineWidth to the set lineWidth', () => {
        const expectedThickness = 20;
        service.lineThickness = expectedThickness;
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(expectedThickness);
        expect(service['drawingService'].previewCtx.lineWidth).toEqual(expectedThickness);
    });
    it(' initializeProperties initialize baseCtx and previewCtx lineCap to set cap', () => {
        const expectedLineCap = 'round';
        service.initializeProperties();
        expect(service['drawingService'].baseCtx.lineCap).toEqual(expectedLineCap);
        expect(service['drawingService'].previewCtx.lineCap).toEqual(expectedLineCap);
    });
    it(' lineThickness should return the given thickness', () => {
        const thickness = 10;
        service.lineThickness = thickness;
        expect(service.lineThickness).toBe(thickness);
    });
    it(' lineThickness should not set a thickness greater than the maximum thickness', () => {
        const thickness = 1000;
        service.lineThickness = thickness;
        expect(service.lineThickness).toBe(MAX_LINE_THICKNESS);
    });
    it(' lineThickness should not set a thickness lower than the minimum thickness', () => {
        const thickness = 0;
        service.lineThickness = thickness;
        expect(service.lineThickness).toBe(MIN_LINE_THICKNESS);
    });
    it(' pointDiameter should return the given diameter', () => {
        const diameter = 10;
        service.pointDiameter = diameter;
        expect(service.pointDiameter).toBe(diameter);
    });
    it(' pointDiameter should not set a thickness greater than the maximum diameter', () => {
        const diameter = 1000;
        service.pointDiameter = diameter;
        expect(service.pointDiameter).toBe(MAX_POINT_DIAMETER);
    });
    it(' pointDiameter should not set a thickness lower than the minimum diameter', () => {
        const diameter = 1;
        service.pointDiameter = diameter;
        expect(service.pointDiameter).toBe(MIN_POINT_DIAMETER);
    });
    it(' showJunctionPoints should return the given boolean', () => {
        const showPoints = true;
        service.showJunctionPoints = showPoints;
        service.onMouseMove(mouseEvent);
        expect(service.showJunctionPoints).toBe(showPoints);
    });
    it(' showJunctionPoints should change value if pathData contains at least one point', () => {
        service.showJunctionPoints = false;
        service.pathData = [{ x: 0, y: 0 }];
        service.showJunctionPoints = true;
        expect(service.showJunctionPoints).toBe(false);
    });
    it(' endDrawing should call clear path', () => {
        service.endDrawing();
        expect(service['clearPath']).toHaveBeenCalled();
    });
    it(' onShiftEvent should change the shape when not pressing shift', () => {
        service.shiftDown = false;
        // tslint:disable-next-line: no-unused-expression
        service['onShiftEvent'];
        expect(drawSpy).not.toHaveBeenCalled();
    });
    it('should confirm end drawing is clearing and end drawing', () => {
        service.endDrawing();

        expect(clearPathSpy).toHaveBeenCalled();
    });
});
