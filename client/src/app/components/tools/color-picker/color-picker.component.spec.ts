import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let input: InputEvent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule],
            declarations: [ColorPickerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call component and check if available', () => {
        expect(component).toBeTruthy();
    });

    it('should call prevent default when handeling an event', () => {
        input = ({
            target: {
                value: 'a',
            },
            preventDefault: () => {
                return;
            },
        } as unknown) as InputEvent;
        component.onRgbaInputChange(input, 2);
        expect(component).toBeTruthy();
    });

    it('should create an event to test prevent to default is called', () => {
        input = ({
            target: {
                value: '00',
            },
            preventDefault: () => {
                return;
            },
        } as unknown) as InputEvent;
        // tslint:disable: no-string-literal
        component['inputHex'] = ['ff', 'ff', 'ff'];
        component.onRgbaInputChange(input, 0);
        expect(component.colorService.hue.hex).toEqual('#00ffffff');
    });

    it('should invert a bool whenthe togglePannel function is called', () => {
        component.isHiddenColorPannel = true;
        // tslint:disable: no-any
        spyOn<any>(component.colorService, 'confirmColor');
        component.onConfirmColor();
        expect(component.isHiddenColorPannel).toEqual(false);
    });

    it('should confirm Color when calling the function onConfirmColor', () => {
        const spy = spyOn<any>(component, 'togglePannel');
        const spy2 = spyOn<any>(component.colorService, 'confirmColor');
        component.onConfirmColor();

        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should cancel Color when calling the function onCancelColor', () => {
        // tslint:disable: no-any
        const spy = spyOn<any>(component, 'togglePannel');
        const spy2 = spyOn<any>(component.colorService, 'cancelColorChange');
        component.onCancelColor();

        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should click button and call onClickColorFuction', () => {
        const isBoolTest = false;
        const spy = spyOn<any>(component, 'togglePannel');
        component.onClickColorButton(isBoolTest);

        expect(spy).toHaveBeenCalled();
    });

    it('should change the primary color on input', () => {
        input = ({
            target: {
                value: '00',
            },
            preventDefault: () => {
                return;
            },
        } as unknown) as InputEvent;
        component['inputHex'] = ['ff', 'ff', 'ff'];
        component.onRgbaInputChange(input, 0);

        component.colorService.isPrimaryColor = true;
        component.colorService.hue = new Color(0, 0, 0, 1);
        expect(component.colorService.primaryColor.hex).toEqual('#00ffffff');
    });

    it('should change the secondary color on input', () => {
        input = ({
            target: {
                value: '00',
            },
            preventDefault: () => {
                return;
            },
        } as unknown) as InputEvent;
        component.onRgbaInputChange(input, 0);

        component.colorService.hue = new Color(0, 0, 0, 1);
        component.colorService.isPrimaryColor = false;
        expect(component.colorService.secondaryColor.hex).toEqual('#ff0000ff');
    });
});
