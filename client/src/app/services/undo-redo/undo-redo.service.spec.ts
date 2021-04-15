import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Command } from '@app/classes/commands/command';
import { ResizeCommand } from '@app/classes/commands/resize-command';
import { CanvasOperationsService } from '@app/services/canvas-operations/canvas-operations.service';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear all arrays on clearHistory', () => {
        service.clearHistory();
        expect(service.commandHistory).toEqual([]);
        expect(service.redoHistory).toEqual([]);
        expect(service.minHistorySize).toEqual(0);
    });

    it('should execute all commands on normal undo', () => {
        service.commandHistory.push({
            execute(): void {
                return;
            },
        } as Command);
        service.minHistorySize = 0;
        // tslint:disable: no-any
        const spy = spyOn<any>(service, 'executeAll');
        service.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('should not execute all commands on normal undo with empty commandHistory', () => {
        service.commandHistory = [];
        service.minHistorySize = 0;
        const spy = spyOn<any>(service, 'executeAll');
        service.undo();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not add undefined to redo history', () => {
        service.commandHistory = [];
        service.minHistorySize = 0 - 1;
        const spy = spyOn<any>(service, 'executeAll');
        service.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('should execute after resize commands on resize undo', () => {
        const imageServiceSpy = jasmine.createSpyObj('ImageHelperService', ['getSelectedImage']);
        service.commandHistory.push(
            new ResizeCommand({ canvasDimensions: { width: 0, height: 0 }, imageService: imageServiceSpy } as CanvasOperationsService, {
                width: 0,
                height: 0,
            }),
        );
        service.commandHistory.push(
            new ResizeCommand({ canvasDimensions: { width: 0, height: 0 }, imageService: imageServiceSpy } as CanvasOperationsService, {
                width: 0,
                height: 0,
            }),
        );
        service.minHistorySize = 0;
        const spy = spyOn<any>(service, 'executeAfterResize');
        service.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('should execute all on redo', fakeAsync(() => {
        service.redoHistory.push({
            execute(): void {
                return;
            },
        } as Command);
        service.minHistorySize = 0;
        const spy = spyOn<any>(service, 'executeAll');
        service.redo();
        const resizeDelay = 50;
        tick(resizeDelay);
        expect(spy).toHaveBeenCalled();
    }));

    it('should assign right state if command that is being redone is a resize', fakeAsync(() => {
        const imageServiceSpy = jasmine.createSpyObj('ImageHelperService', ['getSelectedImage']);
        const lastCommand = new ResizeCommand(
            { canvasDimensions: { width: 0, height: 0 }, imageService: imageServiceSpy } as CanvasOperationsService,
            {
                width: 0,
                height: 0,
            },
        );
        service.redoHistory.push(lastCommand);
        service.minHistorySize = 0;
        const spy = spyOn<any>(service, 'executeAll');
        const spyAssign = spyOn<any>(lastCommand, 'assignState');
        service.redo();
        tick();
        expect(spy).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
    }));

    it('should execute all on redo even if empty', fakeAsync(() => {
        service.redoHistory = [];
        service.minHistorySize = 0;
        const spy = spyOn<any>(service, 'executeAll');
        service.redo();
        const resizeDelay = 50;
        tick(resizeDelay);
        expect(spy).toHaveBeenCalled();
    }));

    it('should clear to redo history on add command', () => {
        service.addCommand({} as Command);
        expect(service.redoHistory).toEqual([]);
    });

    it('should execute for each command', () => {
        service.commandHistory.push({
            execute(): void {
                return;
            },
            saveCanvas(): void {
                return;
            },
        } as Command);
        service.commandHistory.push({
            execute(): void {
                return;
            },
            saveCanvas(): void {
                return;
            },
        } as Command);
        const firstSpy = spyOn<any>(service.commandHistory[0], 'execute');
        const secondSpy = spyOn<any>(service.commandHistory[1], 'execute');
        service.executeAll();
        expect(firstSpy).toHaveBeenCalled();
        expect(secondSpy).toHaveBeenCalled();
    });

    it('should execute all in resize execute', fakeAsync(() => {
        const spyCommand = jasmine.createSpyObj<ResizeCommand>('ResizeCommand', ['restoreState']);
        const spy = spyOn<any>(service, 'executeAll');
        service.executeAfterResize(spyCommand);
        const resizeDelay = 50;
        tick(resizeDelay);
        expect(spy).toHaveBeenCalled();
        expect(spyCommand.restoreState).toHaveBeenCalled();
    }));

    it('it should test the fuction execute all', fakeAsync(() => {
        const spyCommand = jasmine.createSpyObj<ResizeCommand>('ResizeCommand', ['restoreState']);
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn<any>(service['commandHistory'], 'push');
        service.executeAfterResize(spyCommand);
        const resizeDelay = 50;
        tick(resizeDelay);
        service.commandHistory = [spyCommand, spyCommand, spyCommand];
        service.addCommand(spyCommand);
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should execute all commands even if instance of resize command', fakeAsync(() => {
        service.commandHistory = [];
        const imageServiceSpy = jasmine.createSpyObj('ImageHelperService', ['getSelectedImage']);
        const lastCommand = new ResizeCommand(
            { canvasDimensions: { width: 0, height: 0 }, imageService: imageServiceSpy } as CanvasOperationsService,
            {
                width: 0,
                height: 0,
            },
        );
        const spyAssign = spyOn<any>(lastCommand, 'execute').and.returnValue(Promise.resolve());
        const spySaveCanvas = spyOn<any>(lastCommand, 'saveCanvas').and.returnValue(true);
        service.commandHistory.push(lastCommand);
        service.executeAll();
        tick();
        expect(spyAssign).toHaveBeenCalled();
        expect(spySaveCanvas).toHaveBeenCalled();
    }));
});
