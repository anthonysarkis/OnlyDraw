import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { MusicDialogComponent } from './music-dialog.component';

describe('MusicDialogComponent', () => {
    let component: MusicDialogComponent;
    let fixture: ComponentFixture<MusicDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxAudioPlayerModule],
            declarations: [MusicDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MusicDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
