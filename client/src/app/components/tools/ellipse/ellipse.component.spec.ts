import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EllipseComponent } from './ellipse.component';

describe('EllipseComponent', () => {
    let component: EllipseComponent;
    let fixture: ComponentFixture<EllipseComponent>;
    let drawingStub: DrawingService;
    let ellipseStub: EllipseService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        ellipseStub = new EllipseService(drawingStub);

        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatRadioModule, MatFormFieldModule, MatButtonToggleModule],
            declarations: [EllipseComponent],
            providers: [
                { provide: EllipseService, useValue: ellipseStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        ellipseStub['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        ellipseStub['drawingService'].previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EllipseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not set a line width under the mininum line width on change', () => {
        const valueLineThickness = -1;
        component.onLineThicknessChange(valueLineThickness);
        expect(component.lineThickness).toEqual(MIN_LINE_THICKNESS);
    });

    it('should not set a line width over the maximum line width on change', () => {
        const valueLineThickness = 1000000000;
        component.onLineThicknessChange(valueLineThickness);
        expect(component.lineThickness).toEqual(MAX_LINE_THICKNESS);
    });

    it('should set border attribute to true and filled to false if first radio button selected', () => {
        const button = '0';
        component.onRadioButtonChange(button);
        expect(component.ellipseService.isBordered).toEqual(true);
        expect(component.ellipseService.isFilled).toEqual(false);
    });

    it('should set border attribute to false and filled to true if second radio button selected', () => {
        const button = '1';
        component.onRadioButtonChange(button);
        expect(component.ellipseService.isBordered).toEqual(false);
        expect(component.ellipseService.isFilled).toEqual(true);
    });

    it('should set border attribute to true and filled to true if third radio button selected', () => {
        const button = '2';
        component.onRadioButtonChange(button);
        expect(component.ellipseService.isBordered).toEqual(true);
        expect(component.ellipseService.isFilled).toEqual(true);
    });
});
