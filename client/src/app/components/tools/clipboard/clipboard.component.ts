import { Component } from '@angular/core';
import { ToolNames } from '@app/enums/tools-names';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-clipboard',
    templateUrl: './clipboard.component.html',
    styleUrls: ['./clipboard.component.scss'],
})
export class ClipboardComponent {
    constructor(private toolsService: ToolsService, public clipboard: ClipboardService) {}

    onCopy(): void {
        this.clipboard.copy();
    }

    onPaste(): void {
        this.toolsService.selectToolByName(ToolNames.SelectionRectangle);
        this.clipboard.paste();
    }

    onCut(): void {
        this.clipboard.cut();
    }

    onDelete(): void {
        this.clipboard.delete();
    }
}
