import { Component } from '@angular/core';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-selection-ellipse',
    templateUrl: './selection-ellipse.component.html',
    styleUrls: ['./selection-ellipse.component.scss'],
})
export class SelectionEllipseComponent {
    constructor(public selectionService: SelectionService) {}

    onCancelSelection(): void {
        this.selectionService.endDrawing();
    }
}
