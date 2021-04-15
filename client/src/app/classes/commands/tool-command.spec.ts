import { Color } from '@app/classes/color';
import { DrawingState } from '@app/classes/state/drawing-state';
import { ToolState } from '@app/classes/state/tool-state';
import { ColorService } from '@app/services/color/color.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { BehaviorSubject } from 'rxjs';
import { ToolCommand } from './tool-command';

class ToolCommandStub extends ToolCommand {
    execute(): void {
        return;
    }
    saveState(): void {
        return;
    }
    restoreState(): void {
        return;
    }
    saveCanvas(): void {
        return;
    }
    assignState(): void {
        super.changeState(this.toolState);
    }
}
// tslint:disable:no-string-literal
describe('ToolCommand', () => {
    let command: ToolCommand;
    let colorService: jasmine.SpyObj<ColorService>;

    beforeEach(() => {
        colorService = jasmine.createSpyObj('ColorService', [], { colorChanged: new BehaviorSubject<boolean>(true) });
        const toolState = {
            lineWidth: 0,
            primaryColor: new Color(0, 0, 0, 0),
            secondaryColor: new Color(0, 0, 0, 0),
            pathData: [],
            fullPathData: [],
            pointSize: 0,
        } as ToolState;
        colorService.primaryColor = new Color(0, 0, 0, 0);
        colorService.secondaryColor = new Color(0, 0, 0, 0);

        command = new ToolCommandStub({} as PencilService, toolState, colorService);
    });

    it('change state should call changeState', () => {
        const drawingState = new DrawingState(0, new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), {} as HTMLImageElement);
        // tslint:disable-next-line: no-any
        const spySuper = spyOn<any>(ToolCommand.prototype, 'changeState').and.callThrough();
        command['changeState'](drawingState);

        command['colorService'].colorChanged.subscribe((result) => {
            expect(result).toBeTruthy();
        });
        expect(spySuper).toHaveBeenCalled();
    });
});
