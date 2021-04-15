import { StampState } from '@app/classes/state/stamp-state';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { StampCommand } from './stamp-command';

class StampStub extends StampService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    drawImage(): void {
        return;
    }
}
// tslint:disable:no-string-literal
// tslint:disable: no-any

describe('StampCommand', () => {
    let command: StampCommand;
    let drawingService: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingService = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas', 'fillCanvasWhite']);
        const bucketState = new StampState(0, 0, 0, { x: 0, y: 0 });
        const bucketStub = new StampStub(drawingService);
        command = new StampCommand(bucketStub, bucketState);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });

    it('should change state and restore state when executing', () => {
        // tslint:disable:no-any
        const spySave = spyOn<any>(command, 'saveState');
        const spyAssign = spyOn<any>(command, 'assignState');
        const spyRestore = spyOn<any>(command, 'restoreState');
        const spyDraw = spyOn<any>(command['tool'], 'drawStamp');

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
        expect(spyDraw).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
        expect(command['savedState']).toEqual(
            new StampState(
                command['tool'].stampAngle,
                command['tool'].stampScale,
                command['tool'].currentImageNumber,
                command['tool'].mouseDownCoord,
            ),
        );
    });

    it('save canvas should save the right canvas', () => {
        const spy = spyOn(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });

    it('restore state should restore the right state', () => {
        const spyChange = spyOn<any>(command, 'changeState');
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
        command.saveState();
        command.restoreState();
        expect(spyChange).toHaveBeenCalled();
    });
});
