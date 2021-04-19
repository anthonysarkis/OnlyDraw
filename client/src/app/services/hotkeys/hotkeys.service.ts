import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ShortcutKeys } from '@app/enums/shortcut-keys';
import { ToolKeys } from '@app/enums/tools-keys';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    private keyBindings: Map<string, Tool>;
    private shortcutBindings: Map<string, (shift: boolean) => void>;
    isHotkeysDisabled: boolean;

    constructor(private toolsService: ToolsService, private drawingService: DrawingService, private selectionService: SelectionService) {
        this.keyBindings = new Map();
        this.shortcutBindings = new Map();
        this.bindKeys();
        this.bindShortcuts();
    }

    private bindKeys(): void {
        for (const tool of this.toolsService.tools) {
            this.keyBindings.set(tool.key, tool);
        }
    }

    private bindShortcuts(): void {
        this.shortcutBindings.set(ShortcutKeys.NewCanvas, () => {
            this.drawingService.resetCanvas();
        });
        this.shortcutBindings.set(ShortcutKeys.Export, () => {
            this.drawingService.openExportDialog();
        });
        this.shortcutBindings.set(ShortcutKeys.SelectAll, () => {
            if (this.toolsService.selectedTool.getValue().name !== ToolNames.SelectionRectangle)
                this.toolsService.selectToolByName(ToolNames.SelectionRectangle);
            this.selectionService.selectAll();
        });
        this.shortcutBindings.set(ShortcutKeys.Carousel, () => {
            this.drawingService.openCarouselDialog();
        });
        this.shortcutBindings.set(ShortcutKeys.Save, () => {
            this.drawingService.openSaveDialog();
        });
        this.shortcutBindings.set(ShortcutKeys.Paste, () => {
            this.toolsService.selectToolByName(ToolNames.SelectionRectangle);
        });
        this.shortcutBindings.set(ShortcutKeys.UndoRedo, (redo) => {
            if ((!redo && this.undoValidation()) || (redo && this.redoValidation())) return;
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            redo ? this.drawingService.undoRedoService.redo() : this.drawingService.undoRedoService.undo();
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        this.getTool(event);
    }

    getTool(event: KeyboardEvent): void {
        if (this.isAccessoryCalled(event)) return;
        if (this.isHotkeysDisabled || this.isShortcutCalled(event, true) || !this.keyBindings.has(event.key.toLowerCase())) return;
        const tool = this.keyBindings.get(event.key.toLowerCase()) as Tool;
        this.toolsService.selectTool(tool);
    }

    isShortcutCalled(event: KeyboardEvent, isTool: boolean): boolean {
        if (this.isHotkeysDisabled || !event.ctrlKey || !this.shortcutBindings.has(event.key.toLowerCase())) return false;
        if (isTool) this.toolsService.selectedTool.getValue().endDrawing();
        const methodToExecute = this.shortcutBindings.get(event.key.toLowerCase()) as (shift: boolean) => void;
        event.preventDefault();
        methodToExecute(event.shiftKey);
        return true;
    }

    private isAccessoryCalled(event: KeyboardEvent): boolean {
        if (this.toolsService.selectedTool.getValue().key !== ToolKeys.Grid) this.selectionService.magnetism.gridService.onKeyDown(event);
        if (!event.ctrlKey && event.key === ToolKeys.Grid) {
            this.selectionService.magnetism.gridService.toggleGrid();
            return true;
        }
        if (!event.ctrlKey && event.key === ToolKeys.Magnetism) {
            this.selectionService.magnetism.toggleMagnet();
            return true;
        }
        return false;
    }

    private undoValidation(): boolean {
        return this.drawingService.undoRedoService.commandHistory.length <= this.drawingService.undoRedoService.minHistorySize;
    }

    private redoValidation(): boolean {
        return this.drawingService.undoRedoService.redoHistory.length === 0;
    }
}
