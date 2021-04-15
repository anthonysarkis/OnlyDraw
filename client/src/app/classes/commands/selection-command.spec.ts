import { Color } from '@app/classes/color';
import { Rectangle } from '@app/classes/shapes/rectangle';
import { SelectionState } from '@app/classes/state/selection-state';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { MagnetismeService } from '@app/services/tools/selection/magnetisme/magnetisme.service';
import { ResizeService } from '@app/services/tools/selection/resize/resize.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SelectionCommand } from './selection-command';
import { ToolCommand } from './tool-command';

class SelectionStub extends SelectionService {
    shape: Rectangle = new Rectangle(0, 0);

    fillShapeWhite(): void {
        return;
    }

    drawSelection(): void {
        return;
    }
}

describe('SelectionCommand', () => {
    let command: SelectionCommand;
    let resizeSpy: jasmine.SpyObj<ResizeService>;
    let imageService: jasmine.SpyObj<ImageHelperService>;

    beforeEach(() => {
        resizeSpy = jasmine.createSpyObj('ResizeService', ['updateDimensions', 'updateAnchors']);
        imageService = jasmine.createSpyObj('ImageHelperService', ['drawOnBaseCtx']);
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const lineState = new SelectionState(
            1,
            new Color(0, 0, 0, 0),
            new Color(0, 0, 0, 0),
            { width: 0, height: 0 },
            { x: 0, y: 0 },
            {} as HTMLImageElement,
            new Rectangle(0, 0),
            { width: 0, height: 0 },
            { x: 0, y: 0 },
            { width: 0, height: 0 },
            false,
            [false, false],
        );
        const toolStub = new SelectionStub({} as DrawingService, imageService, resizeSpy, {} as MagnetismeService);
        command = new SelectionCommand(toolStub, lineState, colorService);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });
    // tslint:disable: no-any
    it('should change state and restore state when executing', () => {
        const spySave = spyOn<any>(command, 'saveState').and.callThrough();
        const spyRestore = spyOn<any>(command, 'restoreState').and.callThrough();
        const spyAssign = spyOn<any>(command, 'assignState');
        const spySuper = spyOn<any>(ToolCommand.prototype, 'changeState').and.callFake(() => {
            return;
        });

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
        expect(spySuper).toHaveBeenCalled();
    });

    it('should change state and restore state when executing avec is pasted a true', () => {
        // tslint:disable:no-string-literal
        command['tool'].isPasted = true;
        const spySave = spyOn<any>(command, 'saveState').and.callThrough();
        const spyRestore = spyOn<any>(command, 'restoreState').and.callThrough();
        const spyAssign = spyOn<any>(command, 'assignState');
        const spySuper = spyOn<any>(ToolCommand.prototype, 'changeState').and.callFake(() => {
            return;
        });

        command.execute();
        expect(spyRestore).toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spyAssign).toHaveBeenCalled();
        expect(spySuper).toHaveBeenCalled();
    });

    it('save state should save the right state', () => {
        command.saveState();
        // tslint:disable: no-string-literal
        expect(command['savedState'].currentDimensions).toEqual(command['tool'].currentDimensions);
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
        expect(command['tool'].currentCorner).toEqual(command['tool'].currentCorner);
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });

    it('should call fill white if pasted', () => {
        spyOn<any>(command, 'saveState');
        spyOn<any>(command, 'restoreState');
        spyOn<any>(command, 'assignState');
        const spyFill = spyOn<any>(command['tool'], 'fillShapeWhite');
        command['tool'].isPasted = true;

        command.execute();
        command['tool'].isPasted = false;
        expect(spyFill).not.toHaveBeenCalled();
    });
});
