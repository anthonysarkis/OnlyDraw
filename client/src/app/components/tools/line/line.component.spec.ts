import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_LINE_THICKNESS } from '@app/classes/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';
import { LineService } from '@app/services/tools/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineComponent } from './line.component';

describe('LineComponent', () => {
    let component: LineComponent;
    let fixture: ComponentFixture<LineComponent>;
    let drawingStub: DrawingService;
    let mathStub: MathService;
    let lineStub: LineService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        mathStub = new MathService();
        lineStub = new LineService(drawingStub, mathStub);
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatSlideToggleModule, MatFormFieldModule, FormsModule],
            declarations: [LineComponent],
            providers: [{ provide: LineService, useValue: lineStub }],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        lineStub['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        lineStub['drawingService'].previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        lineStub['drawingService'].baseCtx.lineWidth = DEFAULT_LINE_THICKNESS;
        lineStub['drawingService'].previewCtx.lineWidth = DEFAULT_LINE_THICKNESS;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call lineThickness when calling onLineThicknessChange', () => {
        const thickness = 20;
        component.onLineThicknessChange(thickness);
        expect(lineStub.lineThickness).toBe(thickness);
    });

    it('should call showJunctionPoints when calling onShowJunctionPointsChange', () => {
        const showPoints = true;
        component.onShowJunctionPointsChange(showPoints);
        expect(lineStub.showJunctionPoints).toBe(showPoints);
    });

    it('should call pointDiameter when calling onPointDiameterChange', () => {
        const diameter = 20;
        component.onPointDiameterChange(diameter);
        expect(lineStub.pointDiameter).toBe(diameter);
    });
});
