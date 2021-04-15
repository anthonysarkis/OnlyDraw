import { Directive, HostListener } from '@angular/core';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Directive({
    selector: '[appSelectionListener]',
})
export class SelectionListenerDirective {
    constructor(private selectionService: SelectionService) {}

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.haltPrograpagtion(event);
        this.selectionService.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.haltPrograpagtion(event);
        this.selectionService.onMouseUp(event);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.haltPrograpagtion(event);
        this.selectionService.onMouseMove(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.haltPrograpagtion(event);
        this.selectionService.onKeyUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.selectionService.onKeyDown(event);
    }

    private haltPrograpagtion(event: MouseEvent | KeyboardEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }
}
