import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_LINE_THICKNESS } from '@app/classes/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PencilComponent } from './pencil.component';

describe('PencilComponent', () => {
    let component: PencilComponent;
    let fixture: ComponentFixture<PencilComponent>;
    let drawingStub: DrawingService;
    let pencilStub: PencilService;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        pencilStub = new PencilService(drawingStub);
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            declarations: [PencilComponent],
            providers: [{ provide: PencilService, useValue: pencilStub }],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable: no-string-literal
        pencilStub['drawingService'].baseCtx = baseCtxStub;
        pencilStub['drawingService'].baseCtx.lineWidth = DEFAULT_LINE_THICKNESS;
        pencilStub['drawingService'].previewCtx = baseCtxStub;
        pencilStub['drawingService'].previewCtx.lineWidth = DEFAULT_LINE_THICKNESS;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PencilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' onSliderChange should change pencil thickness', () => {
        const newThickness = 20;
        component.onSliderChange(newThickness);
        expect(pencilStub.thickness).toBe(newThickness);
    });
});
