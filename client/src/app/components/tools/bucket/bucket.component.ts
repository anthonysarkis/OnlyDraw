import { Component } from '@angular/core';
import { MAX_TOLERANCE, MIN_TOLERANCE } from '@app/classes/constants';
import { BucketService } from '@app/services/tools/bucket/bucket.service';

@Component({
    selector: 'app-bucket',
    templateUrl: './bucket.component.html',
    styleUrls: ['./bucket.component.scss'],
})
export class BucketComponent {
    bucketTolerance: number;
    minBucketTolerance: number;
    maxBucketTolerance: number;

    constructor(public bucketService: BucketService) {
        this.minBucketTolerance = MIN_TOLERANCE;
        this.maxBucketTolerance = MAX_TOLERANCE;
        this.bucketTolerance = this.bucketService.bucketTolerance;
    }

    onToleranceChange(newTolerance: number): void {
        this.bucketService.bucketTolerance = newTolerance;
        this.bucketTolerance = this.bucketService.bucketTolerance;
    }
}
