import { Component, OnDestroy } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-option-panel',
    templateUrl: './option-panel.component.html',
    styleUrls: ['./option-panel.component.scss'],
})
export class OptionPanelComponent implements OnDestroy {
    currentTool: Tool;
    private toolSubscription: Subscription;

    constructor(public toolsService: ToolsService) {
        this.toolSubscription = this.toolsService.selectedTool.subscribe((selectedTool) => {
            this.currentTool = selectedTool;
        });
    }

    ngOnDestroy(): void {
        this.toolSubscription.unsubscribe();
    }
}
