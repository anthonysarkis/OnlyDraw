import { Component } from '@angular/core';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-selection-polygon',
    templateUrl: './selection-polygon.component.html',
    styleUrls: ['./selection-polygon.component.scss'],
})
export class SelectionPolygonComponent {
    constructor(public selectionService: SelectionService) {}

    onCancelSelection(): void {
        this.selectionService.endDrawing();
    }
}
