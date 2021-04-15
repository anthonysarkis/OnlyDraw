import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ToolNames } from '@app/enums/tools-names';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineService } from './line/line.service';
import { ToolsService } from './tools.service';

describe('ToolsService', () => {
    let service: ToolsService;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingStub }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service = TestBed.inject(ToolsService);
        drawingStub.previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        const numberOfTools = 15;
        expect(service).toBeTruthy();
        expect(service.tools.length).toBe(numberOfTools);
    });

    it('should initially be set to the correct tool', () => {
        service.selectedTool.subscribe((tool) => {
            expect(tool.name).toEqual(ToolNames.Pencil);
        });
    });

    it('setTool should set the correct tool', () => {
        const lineTool: LineService = TestBed.inject(LineService);
        const spyTool = spyOn(service.selectedTool.value, 'endDrawing');
        service.selectTool(lineTool);
        service.selectedTool.subscribe((tool) => {
            expect(tool).toEqual(lineTool);
        });
        expect(spyTool).toHaveBeenCalled();
    });

    it('select tool by name should set the correct tool', () => {
        const lineTool: LineService = TestBed.inject(LineService);
        const spyTool = spyOn(service.selectedTool.value, 'endDrawing');
        service.selectToolByName(lineTool.name);
        service.selectedTool.subscribe((tool) => {
            expect(tool).toEqual(lineTool);
        });
        expect(spyTool).toHaveBeenCalled();
    });
});
