import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterContentInit, Component, ViewChild } from '@angular/core';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MAX_TAG_LENGTH } from '@app/classes/constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Image } from '@common/communication/image';

@Component({
    selector: 'app-save-image-server',
    templateUrl: './save-image-server.component.html',
    styleUrls: ['./save-image-server.component.scss'],
})
export class SaveImageServerComponent implements AfterContentInit {
    imageToSave: Image;
    imageSrc: string;
    errorMsg: string;
    showSpinner: boolean;
    readonly separatorKeysCodes: number[];
    @ViewChild('chipList') private chipList: MatChipList;

    constructor(
        private drawingService: DrawingService,
        private communicationService: CommunicationService,
        private dialogRef: MatDialogRef<SaveImageServerComponent>,
    ) {
        this.imageToSave = { name: 'Dessin', tags: [], encoding: '' };
        this.errorMsg = '';
        this.showSpinner = false;
        this.separatorKeysCodes = [ENTER, COMMA, SPACE];
    }

    ngAfterContentInit(): void {
        this.imageSrc = this.drawingService.baseCtx.canvas.toDataURL();
    }

    sendImageToServer(): void {
        const newImage: Image = {
            name: this.imageToSave.name,
            tags: this.imageToSave.tags,
            encoding: this.imageSrc.split(',')[1],
        };
        this.showSpinner = true;
        this.communicationService.postImage(newImage).subscribe(
            () => {
                this.errorMsg = '';
                this.showSpinner = false;
                this.dialogRef.close();
            },
            (error: string) => {
                this.setError(error);
            },
        );
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (!this.checkTagValidity(value)) {
            this.chipList.errorState = true;
            input.value = '';
            return;
        }
        this.chipList.errorState = false;
        this.imageToSave.tags.push(value);
        input.value = '';
    }

    remove(tag: string): void {
        const index = this.imageToSave.tags.indexOf(tag);

        if (index >= 0) {
            this.imageToSave.tags.splice(index, 1);
        }
    }

    private checkTagValidity(tag: string): boolean {
        if (tag.trim().length < 1) return false;
        if (tag.trim().length > MAX_TAG_LENGTH) return false;
        if (this.imageToSave.tags.includes(tag)) return false;
        return true;
    }

    private setError(error: string): void {
        this.errorMsg = error;
        this.showSpinner = false;
    }
}
