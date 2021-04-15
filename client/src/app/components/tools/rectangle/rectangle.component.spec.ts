import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MAX_LINE_THICKNESS, MIN_LINE_THICKNESS } from '@app/classes/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { RectangleComponent } from './rectangle.component';

describe('RectangleComponent', () => {
    let component: RectangleComponent;
    let fixture: ComponentFixture<RectangleComponent>;
    let drawingStub: DrawingService;
    let rectangleStub: RectangleService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        rectangleStub = new RectangleService(drawingStub);
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatRadioModule, MatFormFieldModule, MatButtonToggleModule],
            declarations: [RectangleComponent],
            providers: [
                { provide: RectangleService, useValue: rectangleStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        rectangleStub['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        rectangleStub['drawingService'].previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RectangleComponent);
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
        expect(component.rectangleService.isBordered).toEqual(true);
        expect(component.rectangleService.isFilled).toEqual(false);
    });

    it('should set border attribute to false and filled to true if second radio button selected', () => {
        const button = '1';
        component.onRadioButtonChange(button);
        expect(component.rectangleService.isBordered).toEqual(false);
        expect(component.rectangleService.isFilled).toEqual(true);
    });

    it('should set border attribute to true and filled to true if third radio button selected', () => {
        const button = '2';
        component.onRadioButtonChange(button);
        expect(component.rectangleService.isBordered).toEqual(true);
        expect(component.rectangleService.isFilled).toEqual(true);
    });
});
