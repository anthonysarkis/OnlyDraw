export interface Command {
    execute(): void;
    saveState(): void;
    restoreState(): void;
    saveCanvas(): void;
}
