import { Color } from '@app/classes/color';
import { AerosolState } from '@app/classes/state/aerosol-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { AerosolCommand } from './aerosol-command';
import { ToolCommand } from './tool-command';

class AerosolStub extends AerosolService {
    pathData: Set<Vec2> = new Set([{ x: 0, y: 0 }]);
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    draw(): void {
        return;
    }
}
// tslint:disable:no-string-literal
describe('AerosolCommand', () => {
    let command: AerosolCommand;

    beforeEach(() => {
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const aerosolState = {
            lineWidth: 0,
            primaryColor: new Color(0, 0, 0, 0),
            secondaryColor: new Color(0, 0, 0, 0),
            pathData: new Set<Vec2>(),
            fullPathData: [],
            pointSize: 0,
        } as AerosolState;
        const toolStub = new AerosolStub({} as DrawingService);
        command = new AerosolCommand(toolStub, aerosolState, colorService);
        // tslint:disable: no-any
        spyOn<any>(command['tool'], 'clearOffscreenContext').and.callFake(() => {
            return;
        });
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
        expect(command['savedState'].fullPathData).toEqual([{ x: 0, y: 0 }]);
        expect(command['savedState'].pathData).toEqual(
            new Set<Vec2>([{ x: 0, y: 0 }]),
        );
        expect(command['savedState'].primaryColor).toEqual(new Color(0, 0, 0, 0));
    });

    it('restore state should restore the right state', () => {
        const spyChange = spyOn<any>(command, 'changeState');
        command.saveState();
        command.restoreState();
        expect(command['tool'].fullPathData).toEqual(command['savedState'].fullPathData);
        expect(spyChange).toHaveBeenCalled();
    });

    it('assign state should call changeState', () => {
        const spyChange = spyOn<any>(command, 'changeState').and.callFake(() => {
            return;
        });
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
        expect(command['tool'].pointSize).toEqual(command['savedState'].pointSize);
    });

    it('should test the forloop when assigning a state in assign state function', () => {
        command['toolState'].fullPathData = [
            { x: 10, y: 10 },
            { x: 11, y: 10 },
            { x: 100, y: 10 },
        ];
        const spyChange = spyOn<any>(command, 'changeState');
        command.assignState();
        expect(spyChange).toHaveBeenCalled();
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
