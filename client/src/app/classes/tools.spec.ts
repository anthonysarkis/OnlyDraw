import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { Tool } from './tool';
import { Vec2 } from './vec2';

class ToolStub extends Tool {}

// tslint:disable:no-string-literal
describe('Tool', () => {
    let tool: ToolStub;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawingService = ({
            clearCanvas(): void {
                return;
            },
        } as unknown) as DrawingService;
        tool = new ToolStub(drawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        tool['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        tool['drawingService'].previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(tool).toBeTruthy();
    });

    it('getPositionFromMouse should return the correct position', () => {
        const mouseEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        const position: Vec2 = tool.getPositionFromMouse(mouseEvent);
        expect(position).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY } as Vec2);
    });

    it('getPositionFromMouse should return the correct position', () => {
        const mouseEvent = { clientX: 0, clientY: 0 } as MouseEvent;
        canvasTestHelper['createCanvas'](0, 0);
        drawingService['canvas'] = canvasTestHelper.canvas;
        const position: Vec2 = tool.getPositionFromMouse(mouseEvent);
        expect(position).toEqual({ x: mouseEvent.clientX, y: mouseEvent.clientY } as Vec2);
    });

    it('function coverage', () => {
        const mouseEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        tool.onDoubleClick(mouseEvent);
        tool.onMouseDown(mouseEvent);
        tool.onMouseUp(mouseEvent);
        tool.onMouseMove(mouseEvent);
        tool.onMouseLeave(mouseEvent);
        tool.onMouseWheel(mouseEvent);
        tool.initializeProperties();
        const keyboardEvent = {} as KeyboardEvent;
        tool.onKeyDown(keyboardEvent);
        tool.onKeyUp(keyboardEvent);
        expect(tool).toBeTruthy();
    });

    it(' endDrawing should set mouseDown to false', () => {
        tool.endDrawing();
        expect(tool.mouseDown).toBe(false);
    });
});
