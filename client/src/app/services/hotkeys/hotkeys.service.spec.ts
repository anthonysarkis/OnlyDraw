import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Command } from '@app/classes/commands/command';
import { Tool } from '@app/classes/tool';
import { ShortcutKeys } from '@app/enums/shortcut-keys';
import { ToolKeys } from '@app/enums/tools-keys';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagnetismeService } from '@app/services/tools/selection/magnetisme/magnetisme.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BehaviorSubject } from 'rxjs';
import { HotkeysService } from './hotkeys.service';

// tslint:disable: no-any
describe('HotkeysService', () => {
    let service: HotkeysService;
    let toolsService: ToolsService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionSpy: jasmine.SpyObj<SelectionService>;
    let gridSpy: jasmine.SpyObj<GridService>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;
    let magnetismeSpy: jasmine.SpyObj<MagnetismeService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'resetCanvas',
            'clearCanvas',
            'openExportDialog',
            'openCarouselDialog',
            'openSaveDialog',
        ]);
        selectionSpy = jasmine.createSpyObj('SelectionService', ['selectAll', 'drawImage']);
        gridSpy = jasmine.createSpyObj('GridService', ['onKeyDown', 'toggleGrid']);
        magnetismeSpy = jasmine.createSpyObj('MagnetismeService', ['toggleMagnet']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);
        selectionSpy.magnetism = magnetismeSpy;
        selectionSpy.magnetism.gridService = gridSpy;
        undoRedoSpy.commandHistory = [];
        undoRedoSpy.redoHistory = [];
        drawingServiceSpy.undoRedoService = undoRedoSpy;

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionService, useValue: selectionSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
                { provide: GridService, useValue: gridSpy },
                { provide: MagnetismeService, useValue: magnetismeSpy },
            ],
            imports: [MatDialogModule],
        });
        service = TestBed.inject(HotkeysService);
        toolsService = TestBed.inject(ToolsService);
        // tslint:disable: no-string-literal
        service['drawingService'] = drawingServiceSpy;
        service['keyBindings'] = new Map<string, Tool>();
        service['shortcutBindings'] = new Map([
            [
                'o',
                () => {
                    drawingServiceSpy.resetCanvas();
                },
            ],
        ]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onKeyDown should call getTool', () => {
        const getToolSpy = spyOn<any>(service, 'getTool').and.callThrough();
        const keyBoardEvent = { key: 'nikne' } as KeyboardEvent;

        service.onKeyDown(keyBoardEvent);
        expect(getToolSpy).toHaveBeenCalled();
        expect(getToolSpy).toHaveBeenCalledWith(keyBoardEvent);
    });

    it('onKeyDown shouldnt call getTool if mouse is down', () => {
        const getToolSpy = spyOn<any>(service, 'getTool').and.callThrough();
        const keyBoardEvent = { key: 'nikne' } as KeyboardEvent;
        service['toolsService'].selectedTool.value.mouseDown = true;

        service.onKeyDown(keyBoardEvent);
        expect(getToolSpy).toHaveBeenCalled();
    });

    it('getTool should call next on currentTool when keyboard event is in keyBindings', (done: DoneFn) => {
        const keyBoardEvent = { key: 'l' } as KeyboardEvent;
        service['bindKeys']();
        service.getTool(keyBoardEvent);
        toolsService.selectedTool.subscribe((tool) => {
            expect(tool.key).toBe('l');
            done();
        });
    });

    it('getTool should execute a method from shortcutBindings when ctrlKey is true', () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: 'o',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.resetCanvas).toHaveBeenCalled();
    });

    it("getTool should not execute a method from shortcutBindings if map doesn't contain shortcut", () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: '',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.resetCanvas).not.toHaveBeenCalled();
    });

    it('should open export dialog with shortcut crtl+e', () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.Export,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.openExportDialog).toHaveBeenCalled();
    });

    it('should select all with shortcut crtl+a', () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.SelectAll,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(selectionSpy.selectAll).toHaveBeenCalled();
    });

    it('should open carousel dialog with shortcut crtl+g', () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.Carousel,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.openCarouselDialog).toHaveBeenCalled();
    });

    it('should open save dialog with shortcut crtl+s', () => {
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.Save,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.openSaveDialog).toHaveBeenCalled();
    });

    it('should open paste dialog with shortcut crtl+s', () => {
        const toolServiceSpy = spyOn<any>(toolsService, 'selectToolByName').and.callThrough();
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.Paste,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(toolServiceSpy).toHaveBeenCalled();
    });

    it('should undo on crtl+z', () => {
        undoRedoSpy.commandHistory.push({} as Command);
        const keyBoardEvent = {
            ctrlKey: true,
            key: ShortcutKeys.UndoRedo,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoSpy.undo).toHaveBeenCalled();
    });

    it('should redo on crtl+shift+z', () => {
        undoRedoSpy.redoHistory.push({} as Command);
        const keyBoardEvent = {
            ctrlKey: true,
            shiftKey: true,
            key: ShortcutKeys.UndoRedo,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoSpy.redo).toHaveBeenCalled();
    });

    it('should not call undo or redo if undo redo stack is empty', () => {
        undoRedoSpy.redoHistory = [];
        undoRedoSpy.commandHistory = [];
        const keyBoardEventUndo = {
            ctrlKey: true,
            shiftKey: true,
            key: ShortcutKeys.UndoRedo,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEventUndo);
        expect(undoRedoSpy.redo).not.toHaveBeenCalled();
    });

    it('should not call end drawing if shortcut is not a tool', () => {
        const keyBoardEvent = {
            ctrlKey: false,
            key: 'l',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service.isHotkeysDisabled = false;
        service['toolsService'].selectedTool = new BehaviorSubject<Tool>({
            endDrawing(): void {
                return;
            },
        } as Tool);
        service['bindShortcuts']();
        const spy = spyOn<any>(service['toolsService'].selectedTool.getValue(), 'endDrawing');
        service.isShortcutCalled(keyBoardEvent, false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle the grid', () => {
        const keyBoardEvent = {
            ctrlKey: false,
            shiftKey: true,
            key: ToolKeys.Grid,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['toolsService'].selectTool({} as GridService);
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(gridSpy.toggleGrid).toHaveBeenCalled();
    });

    it('should toggle the magnet', () => {
        const keyBoardEvent = {
            ctrlKey: false,
            shiftKey: true,
            key: ToolKeys.Magnetism,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['bindShortcuts']();
        service.getTool(keyBoardEvent);
        expect(magnetismeSpy.toggleMagnet).toHaveBeenCalled();
    });
});
