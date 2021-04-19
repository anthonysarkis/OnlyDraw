import { Color } from '@app/classes/color';
import { BucketState } from '@app/classes/state/bucket-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { BucketCommand } from './bucket-command';
import { ToolCommand } from './tool-command';

class BucketStub extends BucketService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    draw(): void {
        return;
    }
}
// tslint:disable:no-string-literal
describe('BucketCommand', () => {
    let command: BucketCommand;
    let drawingService: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingService = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'saveCanvas', 'fillCanvasWhite']);
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const bucketState = new BucketState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), {} as ImageData);
        const bucketStub = new BucketStub(drawingService);
        command = new BucketCommand(bucketStub, bucketState, colorService);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });

    it('should change state and restore state when executing', () => {
        // tslint:disable: no-any
        const spySave = spyOn<any>(command, 'saveState');
        const spyAssign = spyOn<any>(command, 'assignState');
        const spyRestore = spyOn<any>(command, 'restoreState');
        const spyDraw = spyOn<any>(command['tool'], 'draw');

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
        expect(spyDraw).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
        expect(command['savedState']).toEqual(
            new BucketState(1, command['colorService'].primaryColor, command['colorService'].secondaryColor, command['tool'].imageDataToPut),
        );
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
        const spySuper = spyOn<any>(ToolCommand.prototype, 'changeState').and.callFake(() => {
            return;
        });
        command.saveState();
        command.restoreState();
        expect(spyChange).toHaveBeenCalled();
        expect(spySuper).toHaveBeenCalled();
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
