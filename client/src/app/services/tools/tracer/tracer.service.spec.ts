import { TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Command } from '@app/classes/commands/command';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TracerService } from './tracer.service';

describe('TracerService', () => {
    let service: TracerService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    // tslint:disable: no-any
    let traceLineSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas']);

        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.drawCanvas as HTMLCanvasElement;
        baseCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(TracerService);
        traceLineSpy = spyOn<any>(service, 'traceLine').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['mainCtx'] = baseCtxStub;
        service['drawingService'].colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        service['drawingService'].undoRedoService = {
            addCommand(command: Command): void {
                return;
            },
        } as UndoRedoService;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
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

    it(' mouseDown should call traceLine on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(traceLineSpy).toHaveBeenCalled();
    });

    it(' endDrawing should call clear path', () => {
        service.endDrawing();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it(' should add command in undo redo service', () => {
        const spy = spyOn<any>(service['drawingService'].undoRedoService, 'addCommand');
        service.addCommand();
        expect(spy).toHaveBeenCalled();
    });

    it(' should call trace line when drawing', () => {
        service.draw();
        expect(traceLineSpy).toHaveBeenCalled();
    });
});
