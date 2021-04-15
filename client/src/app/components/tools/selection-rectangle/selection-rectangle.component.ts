import { Component } from '@angular/core';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-selection-rectangle',
    templateUrl: './selection-rectangle.component.html',
    styleUrls: ['./selection-rectangle.component.scss'],
})
export class SelectionRectangleComponent {
    constructor(public selectionService: SelectionService) {}

    onCancelSelection(): void {
        this.selectionService.endDrawing();
    }
}
