import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArrowKeys } from '@app/enums/arrow-keys';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-drawing-slider',
    templateUrl: './drawing-slider.component.html',
    styleUrls: ['./drawing-slider.component.scss'],
})
export class DrawingSliderComponent implements OnInit, OnDestroy {
    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    imageIndex: number;
    filterFlushingSubscription: Subscription;

    constructor(
        public carouselService: CarouselService,
        private cd: ChangeDetectorRef,
        private dialogRef: MatDialogRef<DrawingSliderComponent>,
        private router: Router,
    ) {
        this.imageIndex = 0;

        this.filterFlushingSubscription = this.dialogRef.beforeClosed().subscribe(() => {
            this.carouselService.resetCarousel();
        });
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === ArrowKeys.Left) this.carouselService.onPreviousClick();
        if (event.key === ArrowKeys.Right) this.carouselService.onNextClick();
    }

    ngOnInit(): void {
        this.getImages();
    }

    getImages(): void {
        this.carouselService.filterTags.length === 0 ? this.carouselService.getAllImages() : this.carouselService.getImagesByTag();
        this.cd.detectChanges();
    }

    async onLoadImage(index: number): Promise<void> {
        if (!this.carouselService.showConfirmationMsg && !this.carouselService.confirmLoading()) return;
        if (await this.carouselService.onLoadImage(index)) {
            if (this.router.url !== '/editor') this.router.navigate(['/editor']);
            this.dialogRef.close();
        }
    }

    onDeleteImage(index: number): void {
        this.carouselService.onDeleteImage(index);
        this.cd.detectChanges();
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim()) this.carouselService.filterTags = [...this.carouselService.filterTags, value.trim()];
        if (input) input.value = '';
        this.getImages();
    }

    remove(tag: string): void {
        const index = this.carouselService.filterTags.indexOf(tag);
        if (index >= 0) this.carouselService.filterTags.splice(index, 1);
        this.getImages();
    }

    ngOnDestroy(): void {
        this.filterFlushingSubscription.unsubscribe();
    }
}
