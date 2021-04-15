import { CdkDragMove } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CONTAINER_COLOR, RESIZING_COLOR } from '@app/classes/constants';
import { ResizeService } from '@app/services/tools/selection/resize/resize.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-selection',
    templateUrl: './selection.component.html',
    styleUrls: ['./selection.component.scss'],
})
export class SelectionComponent implements AfterViewInit {
    @ViewChild('selectionCanvas', { static: false }) private canvas: ElementRef<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D;
    borderColor: string;

    constructor(public selectionService: SelectionService, public resizeService: ResizeService) {
        this.borderColor = CONTAINER_COLOR;
    }

    ngAfterViewInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.selectionService.canvas = this.canvas.nativeElement;
        this.selectionService.ctx = this.ctx;
    }

    dragMove(event: CdkDragMove, selectedAnchor: number): void {
        this.selectionService.isBorderSelected = true;
        this.borderColor = RESIZING_COLOR;
        this.resizeService.dragMove(event, selectedAnchor);
    }

    dragEnd(): void {
        this.borderColor = CONTAINER_COLOR;
        this.resizeService.dragEnd();
        this.selectionService.setDimensions(this.resizeService.dimensions);
        this.selectionService.setCorners(this.resizeService.corners[0]);
        this.setTransformations();
        this.resizeService.resetProperties();
        setTimeout(() => {
            this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
            this.selectionService.drawImage(this.selectionService.imageWithBorder);
        });
    }

    private setTransformations(): void {
        if (this.resizeService.mirrorX) this.selectionService.xTransformation = !this.selectionService.xTransformation;
        if (this.resizeService.mirrorY) this.selectionService.yTransformation = !this.selectionService.yTransformation;
    }
}
