import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { MouseButton } from '@app/enums/mouse-buttons';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

import { TextService } from './text.service';

describe('TextService', () => {
    let service: TextService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TextService);
        service.textArea = {
            value: '',
            scrollHeight: 2,
            scrollWidth: 2,
            style: { width: '0px', height: '0px' },
            blur(): void {
                return;
            },
            focus(): void {
                return;
            },
        } as HTMLTextAreaElement;
        canvasTestHelper = new CanvasTestHelper();
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['saveCanvas', 'clearCanvas']);
        drawingServiceSpy.colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        drawingServiceSpy.undoRedoService = undoRedoSpy;
        // tslint:disable: no-string-literal
        service['drawingService'] = drawingServiceSpy;
        service['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fill text on base context when adding text', () => {
        // tslint:disable:no-any
        const spyText = spyOn<any>(baseCtxStub, 'fillText');
        service.addText();
        expect(spyText).toHaveBeenCalled();
    });

    it('should add command when finishing mouse down', () => {
        const event = { target: {} } as MouseEvent;
        service.mouseDown = true;
        service.textArea.value = 'test';
        service.onMouseDown(event);
        expect(undoRedoSpy.addCommand).toHaveBeenCalled();
    });

    it('should activate textbox on first mouse down', () => {
        const newMouseEvent = ({
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.Left,
            target: { className: 'bonjus' },
        } as unknown) as MouseEvent;
        service.mouseDown = false;
        service.onMouseDown(newMouseEvent);
        expect(service.isTextBoxActive).toBe(true);
    });

    it('should clear text on Escape', () => {
        const keyEventEscape = {
            key: 'Escape',
        } as KeyboardEvent;
        service.onKeyDown(keyEventEscape);
        expect(service.textArea.value).toBe('');
    });

    it('should change top corner if center text align', () => {
        service.currentStyle['text-align'] = 'center';
        const event = { target: {} } as MouseEvent;
        service.textArea.style.width = '2px';
        service.topCorner = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseDown(event);
        expect(service.topCorner.x).toBe(0);
    });

    it('should change top corner if right text align', () => {
        service.currentStyle['text-align'] = 'right';
        const event = { target: {} } as MouseEvent;
        service.textArea.style.width = '2px';
        service.topCorner = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseDown(event);
        expect(service.topCorner.x).toBe(0);
    });

    it('should resize textbox when calling textbox resize', () => {
        service.isTextBoxActive = true;
        service.topCorner = { x: 0, y: 0 };
        service.mouseDown = true;
        service.resizeTextBox();
        expect(service.textArea.style.width).toBe('2px');
    });

    it('should not resize textbox when calling textbox resize if no active textbox', () => {
        service.isTextBoxActive = false;
        service.textArea.style.width = '0px';
        service.mouseDown = true;
        service.resizeTextBox();
        expect(service.textArea.style.width).toBe('0px');
    });

    it('should not clear text if not Escape', () => {
        const keyEventEscape = {
            key: 'random key',
        } as KeyboardEvent;
        service.textArea.value = 'test';
        service.onKeyDown(keyEventEscape);
        expect(service.textArea.value).toBe('test');
    });

    it('should not add command if mouse down target is the textbox', () => {
        const newMouseEvent = ({
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.Left,
            target: { className: 'textBox' },
        } as unknown) as MouseEvent;
        service.mouseDown = true;
        service.onMouseDown(newMouseEvent);
        expect(undoRedoSpy.addCommand).not.toHaveBeenCalled();
    });

    it('should change top corner if text align is center', () => {
        service.isTextBoxActive = true;
        service.currentStyle['text-align'] = 'center';
        service.textArea.style.width = '1px';
        service.topCorner = { x: 1, y: 0 };
        service.mouseDown = true;
        service.resizeTextBox();
        expect(service.topCorner.x).toBe(0.5);
    });

    it('should change top corner if text align is right', () => {
        service.isTextBoxActive = true;
        service.currentStyle['text-align'] = 'right';
        service.textArea.style.width = '1px';
        service.topCorner = { x: 1, y: 0 };
        service.mouseDown = true;
        service.resizeTextBox();
        expect(service.topCorner.x).toBe(0);
    });
});
