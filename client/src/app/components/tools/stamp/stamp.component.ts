import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MAX_ANGLE_DEGREE, MAX_SCALE, MIN_SCALE, SCALE_FACTOR } from '@app/classes/constants';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp',
    templateUrl: './stamp.component.html',
    styleUrls: ['./stamp.component.scss'],
})
export class StampComponent implements AfterViewInit {
    @ViewChild('stampViewer') private canvas: ElementRef<HTMLCanvasElement>;
    maxAngleRotation: number;
    minAngleRotation: number;
    currentAngle: number;

    maxScaling: number;
    minScaling: number;
    currentScale: number;

    constructor(public stampService: StampService) {
        this.currentScale = stampService.stampScale / SCALE_FACTOR;
        this.currentAngle = stampService.stampAngle;
        this.maxScaling = MAX_SCALE;
        this.minScaling = MIN_SCALE;
        this.maxAngleRotation = MAX_ANGLE_DEGREE;
        this.minAngleRotation = 0;
    }

    ngAfterViewInit(): void {
        this.stampService.stampVisualisation = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    onAngleDegreeChange(newAngle: number): void {
        this.stampService.stampAngle = newAngle;
        this.currentAngle = this.stampService.stampAngle;
    }

    onScaleChange(newScale: number): void {
        this.stampService.stampScale = newScale * SCALE_FACTOR;
        this.currentScale = this.stampService.stampScale / SCALE_FACTOR;
    }

    onChangeStampImage(num: number): void {
        this.stampService.changeStampImage(num);
    }
}
