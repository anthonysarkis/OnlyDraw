import { Component } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(
        public toolService: ToolsService,
        public drawingService: DrawingService,
        public undoRedoService: UndoRedoService,
        public selectionService: SelectionService,
    ) {}

    onSelectTool(selectedTool: Tool): void {
        this.toolService.selectTool(selectedTool);
    }

    onResetCanvas(): void {
        this.toolService.selectedTool.value.endDrawing();
        this.drawingService.resetCanvas();
    }

    openExportCanvas(): void {
        this.drawingService.openExportDialog();
    }

    openSaveDialog(): void {
        this.drawingService.openSaveDialog();
    }

    openCarousel(): void {
        this.drawingService.openCarouselDialog();
    }

    onUndoRedo(undo: boolean): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        undo ? this.undoRedoService.undo() : this.undoRedoService.redo();
    }

    selectAll(): void {
        if (this.toolService.selectedTool.getValue().name !== ToolNames.SelectionRectangle)
            this.toolService.selectToolByName(ToolNames.SelectionRectangle);
        this.selectionService.selectAll();
    }
}
