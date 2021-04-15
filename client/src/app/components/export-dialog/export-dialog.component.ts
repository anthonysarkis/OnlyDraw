import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ExportService } from '@app/services/export/export.service';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit, OnInit {
    @ViewChild('exportPreview', { static: false }) private canvas: ElementRef<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D;

    constructor(public exportService: ExportService) {}

    ngOnInit(): void {
        this.exportService.filter = 'noFilter';
    }

    ngAfterViewInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.exportService.canvas = this.canvas.nativeElement;
        this.exportService.ctx = this.ctx;
        this.exportService.initializeImage();
    }

    onFilterChange(): void {
        this.exportService.applyFilter();
    }

    onExportImage(): void {
        this.exportService.exportImage();
    }

    onExportImgur(): void {
        this.exportService.exportImgur();
    }

    onOpenSnackbar(): void {
        this.exportService.showSnackbar();
    }
}
