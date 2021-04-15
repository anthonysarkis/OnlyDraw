import { ComponentType } from '@angular/cdk/portal';
import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CAROUSEL_HEIGHT, CAROUSEL_WIDTH, DIALOG_HEIGHT, DIALOG_WIDTH } from '@app/classes/constants';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { DrawingSliderComponent } from '@app/components/drawing-slider/drawing-slider.component';
import { ExportDialogComponent } from '@app/components/export-dialog/export-dialog.component';
import { SaveImageServerComponent } from '@app/components/save-image-server/save-image-server.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService implements OnDestroy {
    private resetCanvasSubscription: Subscription;
    private exportSubscription: Subscription;
    private saveImageSubscription: Subscription;
    private drawingSliderSubscription: Subscription;
    private dialogRef: MatDialogRef<ConfirmationDialogComponent | ExportDialogComponent | SaveImageServerComponent | DrawingSliderComponent>;
    private config: MatDialogConfig;

    constructor(private drawingService: DrawingService, public dialog: MatDialog, private hotkeysService: HotkeysService) {
        this.config = {
            width: DIALOG_WIDTH,
            height: DIALOG_HEIGHT,
        };
    }

    initialize(): void {
        this.initializeConfirmationDialog();
        this.initializeExportDialog();
        this.initializeSaveDialog();
        this.initializeCarouselDialog();
    }

    private initializeConfirmationDialog(): void {
        if (this.resetCanvasSubscription) this.unsub();
        this.resetCanvasSubscription = this.drawingService.confirmationDialog.subscribe((open: boolean) => {
            this.openDialog(open, ConfirmationDialogComponent);
        });
    }

    private initializeExportDialog(): void {
        if (this.exportSubscription) this.unsub();
        this.exportSubscription = this.drawingService.exportDialog.subscribe((open: boolean) => {
            this.openDialog(open, ExportDialogComponent, this.config);
        });
    }

    private initializeSaveDialog(): void {
        if (this.saveImageSubscription) this.unsub();
        this.saveImageSubscription = this.drawingService.saveDialog.subscribe((open: boolean) => {
            this.openDialog(open, SaveImageServerComponent, this.config);
        });
    }

    private initializeCarouselDialog(): void {
        if (this.drawingSliderSubscription) this.unsub();
        this.drawingSliderSubscription = this.drawingService.carouselDialog.subscribe((open: boolean) => {
            this.openDialog(open, DrawingSliderComponent, {
                width: CAROUSEL_WIDTH,
                height: CAROUSEL_HEIGHT,
            });
        });
    }

    private openDialog(
        open: boolean,
        component: ComponentType<ConfirmationDialogComponent | ExportDialogComponent | SaveImageServerComponent | DrawingSliderComponent>,
        configs?: MatDialogConfig,
    ): void {
        this.hotkeysService.isHotkeysDisabled = open;
        if (!open) return;
        this.dialogRef = this.dialog.open(component, configs);
        this.enableHotkeys();
    }

    private unsub(): void {
        this.resetCanvasSubscription.unsubscribe();
        this.exportSubscription.unsubscribe();
        this.saveImageSubscription.unsubscribe();
        this.drawingSliderSubscription.unsubscribe();
    }

    private enableHotkeys(): void {
        this.dialogRef.beforeClosed().subscribe(() => {
            this.hotkeysService.isHotkeysDisabled = false;
        });
    }

    ngOnDestroy(): void {
        this.unsub();
    }
}
