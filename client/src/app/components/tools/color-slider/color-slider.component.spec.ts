import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        // const spy  = spyOn(component,'onMouseMove');
        expect(component['mouseDown']).toBeTrue();
        // expect(spy).toHaveBeenCalled();
    });

    it('shouldverify on mouse down is true', () => {
        const spy = spyOn(component, 'draw');
        component.onMouseMove(new MouseEvent('mouseup', {}));
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not create the cursor if we dont have the locaction of the cursor', () => {
        component['selectedWidth'] = 2;
        component['hueColor'] = new Color(0, 0, 0, 0);
        const spy = spyOn(component['context'], 'stroke');
        const spy2 = spyOn(component['context'], 'closePath');
        // component.ngAfterViewInit();
        component.drawCursor();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });
});
