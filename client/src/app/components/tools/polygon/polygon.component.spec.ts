import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonComponent } from './polygon.component';

describe('PolygonComponent', () => {
    let component: PolygonComponent;
    let fixture: ComponentFixture<PolygonComponent>;
    let drawingStub: DrawingService;
    let polygonStub: PolygonService;
    let canvasTestHelper: CanvasTestHelper;
    let button: string;
    // tslint:disable: no-any
    let spy: jasmine.Spy<any>;

    beforeEach(async(() => {
        drawingStub = new DrawingService(new ColorService(), {} as UndoRedoService);
        polygonStub = new PolygonService(drawingStub, new MathService());
        TestBed.configureTestingModule({
            imports: [MatRadioModule, MatSliderModule, MatFormFieldModule, MatButtonToggleModule],
            declarations: [PolygonComponent],
            providers: [
                { provide: PolygonService, useValue: polygonStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable:no-string-literal
        polygonStub['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        polygonStub['drawingService'].previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spy = spyOn<any>(component, 'changeServiceStyles').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onRadioButtonChange should change the styles according to the button pressed', () => {
        button = '0';
        component.onRadioButtonChange(button);
        expect(spy).toHaveBeenCalledWith(true, false);
        button = '1';
        component.onRadioButtonChange(button);
        expect(spy).toHaveBeenCalledWith(false, true);
        button = '2';
        component.onRadioButtonChange(button);
        expect(spy).toHaveBeenCalledWith(true, true);
    });

    it('on line thickness change should change component and service line thickness', () => {
        const newThickness = 10;
        component.lineThickness = 0;
        polygonStub.lineThickness = 0;
        component.onLineThicknessChange(newThickness);
        expect(component.lineThickness).toEqual(newThickness);
        expect(polygonStub.lineThickness).toEqual(newThickness);
    });

    it('on number of sides change should change component and service sides', () => {
        const newNumber = 3;
        component.numberOfSides = 0;
        polygonStub.numberOfSides = 0;
        component.onNumberOfSidesChange(newNumber);
        expect(component.numberOfSides).toEqual(newNumber);
        expect(polygonStub.numberOfSides).toEqual(newNumber);
    });
});
