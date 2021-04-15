import { Color } from '@app/classes/color';
import { LineState } from '@app/classes/state/line-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MathService } from '@app/services/math/math.service';
import { LineService } from '@app/services/tools/line/line.service';
import { LineCommand } from './line-command';
import { ToolCommand } from './tool-command';

class LineStub extends LineService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    draw(): void {
        return;
    }
    set lineThickness(newThickness: number) {
        return;
    }
}
// tslint:disable:no-string-literal
describe('LineCommand', () => {
    let command: LineCommand;

    beforeEach(() => {
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const lineState = new LineState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), [], true, 0);
        const toolStub = new LineStub({} as DrawingService, {} as MathService);
        command = new LineCommand(toolStub, lineState, colorService);
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
        expect(command['tool'].pointDiameter).toEqual(command['savedState'].diameterOfPoint);
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
