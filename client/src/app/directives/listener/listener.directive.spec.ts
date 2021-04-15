import { async, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { BehaviorSubject } from 'rxjs';
import { ListenerDirective } from './listener.directive';

describe('ListenerDirective', () => {
    let hotkeyServiceSpy: jasmine.SpyObj<HotkeysService>;
    let service: ToolsService;
    let selectedToolSpy: jasmine.SpyObj<Tool>;
    let behaviorSubjectSpy: jasmine.SpyObj<BehaviorSubject<Tool>>;
    let directive: ListenerDirective;
    let mouseEvent: MouseEvent;

    beforeEach(async(() => {
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeysService', ['onKeyDown']);
        selectedToolSpy = jasmine.createSpyObj('Tool', [
            'onMouseMove',
            'onMouseUp',
            'onMouseDown',
            'onMouseWheel',
            'onMouseLeave',
            'onContextMenu',
            'onKeyDown',
            'onKeyUp',
            'onDoubleClick',
            'endDrawing',
        ]);
        behaviorSubjectSpy = jasmine.createSpyObj('BehaviorSubject', ['getValue']);
        behaviorSubjectSpy.getValue.and.returnValue(selectedToolSpy);

        TestBed.configureTestingModule({
            declarations: [ListenerDirective],
            imports: [MatDialogModule],
            providers: [{ HotkeysService, useValue: hotkeyServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(ToolsService);
        service.selectedTool = behaviorSubjectSpy;
        directive = new ListenerDirective(service, hotkeyServiceSpy);
        mouseEvent = {} as MouseEvent;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call onMouseMove', () => {
        directive.onMouseMove(mouseEvent);
        expect(selectedToolSpy.onMouseMove).toHaveBeenCalled();
    });

    it('should call onMouseDown', () => {
        directive.onMouseDown(mouseEvent);
        expect(selectedToolSpy.onMouseDown).toHaveBeenCalled();
    });

    it('should call onMouseUp', () => {
        directive.onMouseUp(mouseEvent);
        expect(selectedToolSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseWheel', () => {
        directive.onMouseWheel(mouseEvent);
        expect(selectedToolSpy.onMouseWheel).toHaveBeenCalled();
    });

    it('should call onMouseLeave', () => {
        directive.onMouseLeave(mouseEvent);
        expect(selectedToolSpy.onMouseLeave).toHaveBeenCalled();
    });

    it('should call onDoubleClick', () => {
        directive.onDoubleClick(mouseEvent);
        expect(selectedToolSpy.onDoubleClick).toHaveBeenCalled();
    });

    it('should call onContextMenu', () => {
        mouseEvent = {
            preventDefault(): void {
                return;
            },
        } as MouseEvent;
        directive.onContextMenu(mouseEvent);
        expect(selectedToolSpy.endDrawing).toHaveBeenCalled();
    });

    it('should call onKeyUp on key up', () => {
        const keyboardEvent = {
            preventDefault(): void {
                return;
            },
        } as KeyboardEvent;
        directive.onKeyUp(keyboardEvent);
        expect(selectedToolSpy.onKeyUp).toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is input', () => {
        const keyboardEvent = ({ target: { tagName: 'INPUT' } } as unknown) as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).not.toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is TEXTAREA and key is not escape', () => {
        const keyboardEvent = ({ key: '', target: { tagName: 'TEXTAREA' } } as unknown) as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).not.toHaveBeenCalled();
    });

    it('should call onKeyDown if tagname is TEXTAREA and key is escape', () => {
        const keyboardEvent = ({ key: 'Escape', target: { tagName: 'TEXTAREA' } } as unknown) as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).toHaveBeenCalled();
    });

    it('should call hotkeyService onKeyDown if key is not ctrl', () => {
        const keyboardEvent = ({ key: 'Escape', target: { tagName: 'yolo' }, ctrlKey: false } as unknown) as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(hotkeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is not input', () => {
        const keyboardEvent = ({ target: { tagName: 'DIV' } } as unknown) as KeyboardEvent;
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is not input', () => {
        const keyboardEvent = ({ target: { tagName: '' } } as unknown) as KeyboardEvent;
        // tslint:disable-next-line: no-any
        spyOn<any>(directive, 'isClipboardCommand').and.returnValue(true);
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).toHaveBeenCalled();
        expect(hotkeyServiceSpy.onKeyDown).not.toHaveBeenCalled();
    });

    it('should not call onKeyDown if tagname is not input', () => {
        const keyboardEvent = ({ target: { tagName: '' }, crtlkey: false } as unknown) as KeyboardEvent;
        // tslint:disable-next-line: no-any
        directive.onKeyDown(keyboardEvent);
        expect(selectedToolSpy.onKeyDown).toHaveBeenCalled();
        expect(hotkeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });
});
