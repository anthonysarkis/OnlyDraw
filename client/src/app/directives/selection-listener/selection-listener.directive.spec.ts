import { async, TestBed } from '@angular/core/testing';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SelectionListenerDirective } from './selection-listener.directive';

describe('SelectionListenerDirective', () => {
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let directive: SelectionListenerDirective;
    let mouseEvent: MouseEvent;

    beforeEach(async(() => {
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', ['onMouseMove', 'onMouseUp', 'onMouseDown', 'onKeyDown', 'onKeyUp']);

        TestBed.configureTestingModule({
            declarations: [SelectionListenerDirective],
            providers: [{ SelectionService, useValue: selectionServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        directive = new SelectionListenerDirective(selectionServiceSpy);
        mouseEvent = {
            preventDefault(): void {
                return;
            },
            stopPropagation(): void {
                return;
            },
        } as MouseEvent;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call onMouseMove', () => {
        directive.onMouseMove(mouseEvent);
        expect(selectionServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('should call onMouseDown', () => {
        directive.onMouseDown(mouseEvent);
        expect(selectionServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('should call onMouseUp', () => {
        directive.onMouseUp(mouseEvent);
        expect(selectionServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onKeyUp on key up', () => {
        const keyboardEvent = {
            preventDefault(): void {
                return;
            },
            stopPropagation(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyUp(keyboardEvent);
        expect(selectionServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is input', () => {
        const keyboardEvent = {
            preventDefault(): void {
                return;
            },
            stopPropagation(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(selectionServiceSpy.onKeyDown).toHaveBeenCalled();
    });
});
