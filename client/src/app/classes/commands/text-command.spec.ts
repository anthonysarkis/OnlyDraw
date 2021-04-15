import { Color } from '@app/classes/color';
import { TextState } from '@app/classes/state/text-state';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/text.service';
import { TextCommand } from './text-command';
import { ToolCommand } from './tool-command';

class TextStub extends TextService {
    pathData: Vec2[] = [{ x: 0, y: 0 }];
    fullPathData: Vec2[] = [{ x: 0, y: 0 }];
    addText(): void {
        return;
    }
}
// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('TextCommand', () => {
    let command: TextCommand;

    beforeEach(() => {
        const colorService = { primaryColor: new Color(0, 0, 0, 0), secondaryColor: new Color(0, 0, 0, 0) } as ColorService;
        const textState = new TextState(
            0,
            new Color(0, 0, 0, 0),
            new Color(0, 0, 0, 0),
            {} as Vec2,
            'font-family',
            {
                'font-size': '20px',
                'font-style': 'normal',
                'font-weight': 'normal',
                'text-align': 'left',
                'font-family': 'Georgia',
            },
            '1',
        );
        const toolStub = new TextStub({} as DrawingService);
        toolStub.textArea = {
            value: '',
            style: { width: '0px', height: '0px' },
        } as HTMLTextAreaElement;
        toolStub.currentStyle = {
            'font-size': '20px',
            'font-style': 'normal',
            'font-weight': 'normal',
            'text-align': 'left',
            'font-family': 'Georgia',
        };
        command = new TextCommand(toolStub, textState, colorService);
    });

    it('should be created', () => {
        expect(command).toBeTruthy();
    });

    it('restore state should call changeState', () => {
        const spyChange = spyOn<any>(command, 'changeState');
        command.restoreState();
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

    it('should addText when calling executing', () => {
        const spyChange = spyOn<any>(command, 'changeState');
        command.execute();
        expect(spyChange).toHaveBeenCalled();
    });

    it('should be saved', () => {
        const spy = spyOn<any>(command['tool'], 'saveCanvas');
        command.saveCanvas();
        expect(spy).toHaveBeenCalled();
    });
});
