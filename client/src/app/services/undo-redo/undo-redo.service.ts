import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { ResizeCommand } from '@app/classes/commands/resize-command';
import { RESIZE_DELAY } from '@app/classes/constants';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    redoHistory: Command[];
    commandHistory: Command[];
    minHistorySize: number;

    constructor() {
        this.redoHistory = [];
        this.commandHistory = [];
        this.minHistorySize = 0;
    }

    undo(): void {
        if (this.commandHistory.length <= this.minHistorySize) return;
        const lastCommand = this.commandHistory.pop();
        if (lastCommand) this.redoHistory.push(lastCommand);
        if (lastCommand instanceof ResizeCommand) {
            this.executeAfterResize(lastCommand);
            return;
        }
        this.executeAll();
    }

    redo(): void {
        const lastCommand = this.redoHistory.pop();
        if (lastCommand) this.commandHistory.push(lastCommand);
        if (lastCommand instanceof ResizeCommand) lastCommand.assignState();
        setTimeout(() => {
            this.executeAll();
        });
    }

    addCommand(command: Command): void {
        this.redoHistory = [];
        this.commandHistory.push(command);
    }

    async executeAll(): Promise<void> {
        for (const command of this.commandHistory) {
            if (command instanceof ResizeCommand) await command.execute();
            else command.execute();
        }
        if (this.commandHistory.length > 0) this.commandHistory[0].saveCanvas();
    }

    executeAfterResize(command: ResizeCommand): void {
        command.restoreState();
        setTimeout(() => {
            this.executeAll();
        }, RESIZE_DELAY);
    }

    clearHistory(): void {
        this.redoHistory = [];
        this.commandHistory = [];
        this.minHistorySize = 0;
    }
}
