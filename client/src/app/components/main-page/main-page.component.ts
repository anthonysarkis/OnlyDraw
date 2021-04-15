import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(public drawingService: DrawingService, private router: Router) {}

    onOpenNewCanvas(): void {
        if (!this.drawingService.checkIfSavedCanvas()) this.router.navigate(['/editor']);
        else this.drawingService.resetCanvas();
    }

    onContinueCanvas(): void {
        this.drawingService.undoRedoService.clearHistory();
    }
}
