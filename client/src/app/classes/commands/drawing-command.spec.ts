import { Color } from '@app/classes/color';
import { DrawingState } from '@app/classes/state/drawing-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BehaviorSubject } from 'rxjs';
import { DrawingCommand } from './drawing-command';

class DrawingStub extends DrawingService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    drawCanvas(): void {
        return;
    }
}
// tslint:disable:no-string-literal
describe('DrawingCommand', () => {
    let command: DrawingCommand;
    let colorService: jasmine.SpyObj<ColorService>;

    beforeEach(() => {
        colorService = jasmine.createSpyObj('ColorService', [], { colorChanged: new BehaviorSubject<boolean>(true) });
        const drawingState = new DrawingState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), {} as HTMLImageElement);
        colorService.primaryColor = new Color(0, 0, 0, 0);
        colorService.secondaryColor = new Color(0, 0, 0, 0);
        const toolStub = new DrawingStub(colorService, {} as UndoRedoService);
        command = new DrawingCommand(toolStub, drawingState, colorService);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });
    // tslint:disable: no-any
    it('should change state and restore state when executing', () => {
        const spySave = spyOn<any>(command, 'saveState');
        const spyRestore = spyOn<any>(command, 'restoreState');
        const spyAssign = spyOn<any>(command, 'assignState');

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
        expect(command['savedState'].selectedImage).toEqual(command['tool'].canvasImage);
        expect(command['savedState'].primaryColor).toEqual(new Color(0, 0, 0, 0));
    });

    it('restore state should restore the right state', () => {
        const spyChange = spyOn<any>(command, 'changeState');
        command.saveState();
        command.restoreState();
        expect(spyChange).toHaveBeenCalled();
    });

    it('assign state should call changeState', () => {
        const spyChange = spyOn<any>(command, 'changeState');
        command.assignState();
        expect(spyChange).toHaveBeenCalled();
    });

    it('change state should call changeState', () => {
        const drawingState = new DrawingState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), {} as HTMLImageElement);
        command['changeState'](drawingState);

        command['colorService'].colorChanged.subscribe((result) => {
            expect(result).toBeTruthy();
        });
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
