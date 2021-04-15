import { Color } from '@app/classes/color';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { ShapeState } from '@app/classes/state/shape-state';
import { Vec2 } from '@app/classes/vec2';
import { Shape } from '@app/interfaces/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { ShapeCommand } from './shape-command';
import { ToolCommand } from './tool-command';

class ShapeStub extends ShapeService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    restoreContextStyle(): void {
        return;
    }
    drawShape(shape: Shape): void {
        return;
    }
    set lineThickness(newThickness: number) {
        return;
    }
}
// tslint:disable:no-string-literal
describe('ShapeCommand', () => {
    let command: ShapeCommand;

    beforeEach(() => {
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const shapeState = new ShapeState(
            new Rectangle(1, 1),
            new Rectangle(1, 1),
            1,
            new Color(0, 0, 0, 0),
            new Color(0, 0, 0, 0),
            true,
            true,
            true,
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        );
        const toolStub = new ShapeStub({} as DrawingService);
        command = new ShapeCommand(toolStub, shapeState, colorService);
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

    it('isAlternateShape should draw the alternate shape', () => {
        const spy = spyOn<any>(command['tool'], 'drawShape');
        const spyRestore = spyOn<any>(command, 'restoreState');
        const spyAssign = spyOn<any>(command, 'assignState');

        command['tool'].isAlternateShape = true;
        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
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
        const spyPrivate = spyOn<any>(command['tool'], 'swapContextStyle').and.callFake(() => {
            return;
        });
        command.saveState();
        command.restoreState();
        expect(spyChange).toHaveBeenCalled();
        expect(spySuper).toHaveBeenCalled();
        expect(spyPrivate).toHaveBeenCalled();
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
