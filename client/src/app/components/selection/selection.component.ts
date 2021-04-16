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
    @ViewChild('selectionCanvas', { static: false }) private selectionCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) private canvas: ElementRef<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    borderColor: string;
    showPreviewCanvas: boolean;
    previewXTransformation: boolean;
    previewYTransformation: boolean;

    constructor(public selectionService: SelectionService, public resizeService: ResizeService) {
        this.borderColor = CONTAINER_COLOR;
        this.showPreviewCanvas = false;
        this.previewXTransformation = false;
        this.previewYTransformation = false;
    }

    ngAfterViewInit(): void {
        this.ctx = this.selectionCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.selectionService.canvas = this.selectionCanvas.nativeElement;
        this.selectionService.ctx = this.ctx;
    }

    dragMove(event: CdkDragMove, selectedAnchor: number): void {
        this.showPreviewCanvas = true;
        this.selectionService.isBorderSelected = true;
        this.borderColor = RESIZING_COLOR;
        this.resizeService.dragMove(event, selectedAnchor);
        this.previewCtx.resetTransform();
        if (this.resizeService.mirrorBindings) this.resizeService.checkIfNeedsMirror(this.resizeService.selectedAnchor);
        this.setPreviewTransformations();
        this.applyPreviewMirror();
        this.drawPreview();
    }

    dragEnd(): void {
        this.borderColor = CONTAINER_COLOR;
        this.resetPreviewCanvas();
        this.resizeService.dragEnd();
        this.selectionService.setDimensions(this.resizeService.dimensions);
        this.selectionService.setCorners(this.resizeService.corners[0]);
        this.setTransformations();
        this.setPreviewTransformations();
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

    private setPreviewTransformations(): void {
        this.needsXTransform();
        this.needsYTransform();
    }

    private applyPreviewMirror(): void {
        if (this.previewXTransformation && this.previewYTransformation) {
            this.previewCtx.setTransform(
                -this.previewXTransformation,
                0,
                0,
                -this.previewYTransformation,
                this.canvas.nativeElement.width,
                this.canvas.nativeElement.height,
            );
            return;
        }
        if (this.previewXTransformation) this.previewCtx.setTransform(-this.previewXTransformation, 0, 0, 1, this.canvas.nativeElement.width, 0);
        if (this.previewYTransformation) this.previewCtx.setTransform(1, 0, 0, -this.previewYTransformation, 0, this.canvas.nativeElement.height);
    }

    private drawPreview(): void {
        this.previewCtx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        this.previewCtx.drawImage(this.selectionService.imageWithBorder, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    private resetPreviewCanvas(): void {
        this.showPreviewCanvas = false;
        this.previewCtx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    private needsXTransform(): void {
        if (
            (this.selectionService.xTransformation !== this.previewXTransformation && !this.resizeService.mirrorX) ||
            (this.selectionService.xTransformation === this.previewXTransformation && this.resizeService.mirrorX)
        )
            this.previewXTransformation = !this.previewXTransformation;
    }

    private needsYTransform(): void {
        if (
            (this.selectionService.yTransformation !== this.previewYTransformation && !this.resizeService.mirrorY) ||
            (this.selectionService.yTransformation === this.previewYTransformation && this.resizeService.mirrorY)
        )
            this.previewYTransformation = !this.previewYTransformation;
    }
}
