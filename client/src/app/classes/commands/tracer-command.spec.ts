import { Color } from '@app/classes/color';
import { TracerState } from '@app/classes/state/tracer-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TracerService } from '@app/services/tools/tracer/tracer.service';
import { ToolCommand } from './tool-command';
import { TracerCommand } from './tracer-command';

class TracerStub extends TracerService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    draw(): void {
        return;
    }
    endDrawing(): void {
        return;
    }
    set thickness(newThickness: number) {
        return;
    }
}
// tslint:disable:no-string-literal
describe('TracerCommand', () => {
    let command: TracerCommand;

    beforeEach(() => {
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const tracerState = new TracerState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), []);
        const toolStub = new TracerStub({} as DrawingService);
        command = new TracerCommand(toolStub, tracerState, colorService);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });
    // tslint:disable: no-any
    it('should change state and restore state when executing', () => {
        const spySave = spyOn<any>(command, 'saveState');
        const spyRestore = spyOn<any>(command, 'restoreState');
        const spyAssign = spyOn<any>(command, 'assignState');
        spyOn<any>(command, 'saveCanvas');

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
        expect(command['savedState'].pathData).toEqual([{ x: 0, y: 0 }]);
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
        const spyChange = spyOn<any>(command, 'changeState').and.callThrough();
        const spySuper = spyOn<any>(ToolCommand.prototype, 'changeState').and.callFake(() => {
            return;
        });
        command.saveState();
        command.restoreState();
        expect(spyChange).toHaveBeenCalled();
        expect(spySuper).toHaveBeenCalled();
        expect(command['tool'].thickness).toEqual(command['savedState'].lineWidth);
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
