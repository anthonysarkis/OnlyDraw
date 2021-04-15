import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { BucketComponent } from './bucket.component';

describe('FillComponent', () => {
    let component: BucketComponent;
    let fixture: ComponentFixture<BucketComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatFormFieldModule, FormsModule],
            declarations: [BucketComponent],
            providers: [{ provide: BucketService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BucketComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onToleranceChange should set new tolerance', () => {
        const newTolerance = 77;
        component.onToleranceChange(newTolerance);
        expect(component.bucketService.bucketTolerance).toBe(newTolerance);
        expect(component.bucketTolerance).toBe(newTolerance);
    });
});
