import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TWO_SECONDS } from '@app/classes/constants';
import { Filters } from '@app/enums/filters';
import { ImageFormat } from '@app/enums/image-formats';
import { Dimensions } from '@app/interfaces/dimensions';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ImageHelperService } from '@app/services/image-helper/image-helper.service';
import { ImgurService } from '@app/services/imgur/imgur.service';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    filter: string;
    format: string;
    fileName: string;
    showImgurMsg: boolean;
    imgurLink: string;
    private dimensions: Dimensions;
    private image: HTMLImageElement;
    private filters: Map<string, string>;

    constructor(
        private drawingService: DrawingService,
        private imageService: ImageHelperService,
        private imgurService: ImgurService,
        private snackBar: MatSnackBar,
    ) {
        this.dimensions = { width: this.drawingService.canvas.width, height: this.drawingService.canvas.height };
        this.filters = new Map();
        this.showImgurMsg = false;
        this.setFilters();
        this.setDefaultOptions();
    }

    private setFilters(): void {
        this.filters.set(Filters.NoFilter, 'none');
        this.filters.set(Filters.NegativeFilter, 'invert(100)');
        this.filters.set(Filters.GrayscaleFilter, 'grayscale(100)');
        this.filters.set(Filters.SepiaFilter, 'sepia(1)');
        this.filters.set(Filters.SaturationFilter, 'saturate(50)');
    }

    applyFilter(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.filter = this.filters.get(this.filter) as string;
        this.fillCanvasWhite();
        this.ctx.drawImage(this.image, 0, 0);
        if (!this.filters.has(this.filter)) this.applySpecialFilter();
        this.ctx.restore();
    }

    private applySpecialFilter(): void {
        if (this.filter === Filters.DogFilter || this.filter === Filters.GmeFilter) {
            const specialFilter = new Image();
            specialFilter.src = `../../assets/${this.filter}.svg`;
            specialFilter.onload = () => {
                this.ctx.drawImage(specialFilter, 0, 0);
            };
        }
    }

    initializeImage(): void {
        this.dimensions = { width: this.drawingService.canvas.width, height: this.drawingService.canvas.height };
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;
        this.fillCanvasWhite();
        this.image = this.imageService.getSelectedImage({ x: 0, y: 0 }, this.dimensions);
        setTimeout(() => {
            this.ctx.drawImage(this.image, 0, 0);
        });
    }

    exportImage(): void {
        const image = this.canvas.toDataURL('image/' + this.format).replace('image/' + this.format, 'image/octet-stream');
        const a = document.createElement('a');
        a.href = image;
        a.download = this.fileName + '.' + this.format;
        a.click();
        this.setDefaultOptions();
    }

    exportImgur(): void {
        const image = this.canvas.toDataURL('image/' + this.format).replace('image/' + this.format, 'image/octet-stream');
        this.imgurService.uploadImgur(image).subscribe((res: HTMLObjectElement) => {
            this.imgurLink = res.data.link.toString();
            this.showImgurMsg = true;
        });
    }

    private fillCanvasWhite(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private setDefaultOptions(): void {
        this.filter = Filters.NoFilter;
        this.format = ImageFormat.Jpeg;
        this.fileName = 'Dessin';
    }

    showSnackbar(): void {
        this.snackBar.open('Le lien a été copié avec succès', 'Ok', {
            duration: TWO_SECONDS,
        });
    }
}
