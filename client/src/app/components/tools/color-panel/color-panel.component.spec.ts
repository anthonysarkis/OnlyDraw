import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorPanelComponent } from './color-panel.component';

describe('ColorPanelComponent', () => {
    let component: ColorPanelComponent;
    let fixture: ComponentFixture<ColorPanelComponent>;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should set the variable mouse down to false when it detects on mouse up', () => {
        component.onMouseUp();
        // tslint:disable: no-string-literal
        expect(component['mouseDown']).not.toBeTrue();
    });

    it('Should set the variable mouse down to true when it detects on mouse down', () => {
        component.onMouseDown(new MouseEvent('mousedown', {}));
        expect(component['mouseDown']).toBeTrue();
    });

    it('should verify on mouse down is true', () => {
        const spy = spyOn(component, 'draw');
        component.onMouseMove(new MouseEvent('mouseup', {}));
        expect(spy).not.toHaveBeenCalled();
    });

    it('should set initialise a default color to hue', () => {
        const maxRGBvalue = 255;
        expect(component.hue).toEqual(new Color(maxRGBvalue, 0, 0, 1));
    });

    it('should set hue to a Color if undifined', () => {
        component['context'] = (undefined as unknown) as CanvasRenderingContext2D;
        component.hue = (undefined as unknown) as Color;
        component.ngAfterViewInit();
        expect(component.hue).toEqual(new Color(0, 0, 0, 1));
    });

    it('should verify selectedPosition stay inside the canvas doesnt  ', () => {
        const event = { offsetX: 200, offsetY: 200 } as MouseEvent;
        const fixedCanvasWidth = 5;
        canvasTestHelper.canvas.width = fixedCanvasWidth;
        canvasTestHelper.canvas.height = fixedCanvasWidth;
        component['canvas'].nativeElement = canvasTestHelper.canvas;
        component['mouseDown'] = true;
        component.onMouseMove(event);
        expect(component['selectedPosition'].x).toEqual(component['canvas'].nativeElement.width - 1);
    });

    it('should not create the cursor if we dont have a deffined position', () => {
        spyOn(component, 'drawCursor').and.callThrough();
        const spy = spyOn(component['context'], 'stroke');
        component['selectedPosition'] = (undefined as unknown) as Vec2;
        component.drawCursor();
        expect(spy).not.toHaveBeenCalled();
    });
});
