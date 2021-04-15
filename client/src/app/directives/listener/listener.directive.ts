import { Directive, HostListener } from '@angular/core';
import { ClipboardKeys } from '@app/enums/clipboard-keys';
import { ToolNames } from '@app/enums/tools-names';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Directive({
    selector: '[appListener]',
})
export class ListenerDirective {
    constructor(private toolsService: ToolsService, private hotkeyService: HotkeysService) {}

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onMouseUp(event);
    }

    @HostListener('window:contextmenu', ['$event'])
    onContextMenu(event: MouseEvent): void {
        event.preventDefault();
        this.toolsService.selectedTool.getValue().endDrawing();
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onMouseLeave(event);
    }

    @HostListener('wheel', ['$event'])
    onMouseWheel(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onMouseWheel(event);
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent): void {
        this.toolsService.selectedTool.getValue().onDoubleClick(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolsService.selectedTool.getValue().onKeyUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if ((event.target as HTMLElement).tagName === 'INPUT' && (event.target as HTMLInputElement).type !== 'checkbox') return;
        if ((event.target as HTMLElement).tagName === 'TEXTAREA') {
            if (event.key !== 'Escape') return;
        }
        if (!this.isClipboardCommand(event)) this.hotkeyService.onKeyDown(event);
        this.toolsService.selectedTool.getValue().onKeyDown(event);
    }

    private isClipboardCommand(event: KeyboardEvent): boolean {
        return (
            event.ctrlKey &&
            Object.values(ClipboardKeys).includes(event.key as ClipboardKeys) &&
            (this.toolsService.selectedTool.getValue().name === ToolNames.SelectionRectangle ||
                this.toolsService.selectedTool.getValue().name === ToolNames.SelectionEllipse ||
                this.toolsService.selectedTool.getValue().name === ToolNames.Lasso)
        );
    }
}
