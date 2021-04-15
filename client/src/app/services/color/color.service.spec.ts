import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { COLOR_HISTORY_SIZE } from '@app/classes/constants';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from './color.service';

describe('ColorService', () => {
    let service: ColorService;
    let canvasTestHelper: CanvasTestHelper;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ctx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseMove should call previewShape if mouse was already down', () => {
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'assignColorOfPosition');
        const position: Vec2 = { x: 0, y: 0 };
        service.onMouseMove(position, ctx, true);
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseMove should change hue color and primary color', () => {
        const spyStubAssign = spyOn<any>(service, 'assignColorOfPosition').and.callFake(() => {
            return new Color(1, 1, 1, 1);
        });
        const position: Vec2 = { x: 0, y: 0 };
        service.hue = new Color(0, 0, 0, 0);
        service.isPrimaryColor = true;
        const color = service.onMouseMove(position, ctx, true);
        expect(service.hue).toEqual(color);
        expect(service.primaryColor).toEqual(color);
        expect(spyStubAssign).toHaveBeenCalled();
    });

    it(' should swap primary color and secondary color when calling switchPrimarySecondary', () => {
        const initialPrimaryColor: Color = (service.primaryColor = new Color(1, 1, 1, 1));
        const initialSecondaryColor: Color = (service.secondaryColor = new Color(0, 0, 0, 0));
        service.switchPrimarySecondary();
        expect(service.primaryColor).toEqual(initialSecondaryColor);
        expect(service.secondaryColor).toEqual(initialPrimaryColor);
    });

    it(' should choose the current color when calling chooseCurrentColor', () => {
        const initialPrimaryColor: Color = (service.primaryColor = new Color(1, 1, 1, 1));
        const initialSecondaryColor: Color = (service.secondaryColor = new Color(0, 0, 0, 0));
        service.isPrimaryColor = true;
        let returnedColor = service.chooseCurrentColor();
        expect(returnedColor).toEqual(initialPrimaryColor);
        service.isPrimaryColor = false;
        returnedColor = service.chooseCurrentColor();
        expect(returnedColor).toEqual(initialSecondaryColor);
    });

    it('should save color in history if not already present', () => {
        const initialPrimaryColor: Color = (service.primaryColor = new Color(1, 1, 1, 1));
        service.secondaryColor = new Color(0, 0, 0, 0);
        service.colorsHistory = [];
        service.colorsHistory[0] = new Color(0, 0, 0, 0);
        service.isPrimaryColor = true;
        service.confirmColor();
        expect(service.colorsHistory[0]).toEqual(initialPrimaryColor);
    });

    it('should not save color in history if not already present', () => {
        const initialPrimaryColor: Color = (service.primaryColor = new Color(1, 1, 1, 1));
        service.secondaryColor = new Color(0, 0, 0, 0);
        service.colorsHistory = [];
        service.colorsHistory[0] = new Color(0, 0, 0, 0);
        service.isPrimaryColor = false;
        service.confirmColor();
        expect(service.colorsHistory[0]).not.toEqual(initialPrimaryColor);
    });

    it('should  pop last color if over max size', () => {
        service.primaryColor = new Color(1, 1, 1, 1);
        service.secondaryColor = new Color(0, 0, 0, 0);
        service.colorsHistory = new Array(COLOR_HISTORY_SIZE);
        service.colorsHistory.fill(new Color(0, 0, 0, 0), 0, COLOR_HISTORY_SIZE - 1);
        service.isPrimaryColor = true;
        const spyPop = spyOn(service.colorsHistory, 'pop');
        service.confirmColor();
        expect(spyPop).toHaveBeenCalled();
    });

    it('should return false on invalid hex and true on valid hex', () => {
        let returnedValue = service.validateHexInput('#ffffff');
        expect(returnedValue).toEqual(true);
        returnedValue = service.validateHexInput('#foss');
        expect(returnedValue).toEqual(false);
    });

    it('onSliderOpacityChanger should assign opacity to primary color if isPrimary color is true', () => {
        const newOpacity = 0.4;
        service.primaryColor = new Color(0, 0, 1, 1);
        service.isPrimaryColor = true;
        service.onSliderOpacityChanger(newOpacity);
        const expectedPrimaryColor = new Color(0, 0, 1, newOpacity);
        expect(service.primaryColor).toEqual(expectedPrimaryColor);
    });

    it('onSliderOpacityChanger should assign opacity to secondary color if isPrimary color is false', () => {
        const newOpacity = 0.4;
        service.secondaryColor = new Color(0, 0, 1, 1);
        service.isPrimaryColor = false;
        service.onSliderOpacityChanger(newOpacity);
        const expectedColor = new Color(0, 0, 1, newOpacity);
        expect(service.secondaryColor).toEqual(expectedColor);
    });

    it('onSelectPrimaryColor should assign color clicked to secondary color if isPrimary is false', () => {
        const event = {
            preventDefault: () => {
                return;
            },
        } as MouseEvent;
        const colorClicked = new Color(1, 0, 0, 1);

        service.onSelectPrimaryColor(colorClicked, false, event);
        expect(service.secondaryColor).toEqual(colorClicked);
    });

    it('y color if isPrimary is false', () => {
        const event = {
            preventDefault: () => {
                return;
            },
        } as MouseEvent;
        const colorClicked = new Color(1, 0, 0, 1);

        service.onSelectPrimaryColor(colorClicked, true, event);
        expect(service.primaryColor).toEqual(colorClicked);
    });

    it('cancelColorChange should set primary color to old one', () => {
        service.isPrimaryColor = true;
        service.cancelColorChange();
        // tslint:disable: no-string-literal
        expect(service.primaryColor).toEqual(service['oldPrimaryColor']);
    });

    it('cancelColorChange should set secondary color to old one', () => {
        service.isPrimaryColor = false;
        service.cancelColorChange();
        expect(service.secondaryColor).toEqual(service['oldSecondaryColor']);
    });
});
