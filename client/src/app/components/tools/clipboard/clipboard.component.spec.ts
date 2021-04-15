import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClipboardComponent } from './clipboard.component';

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;
    let fixture: ComponentFixture<ClipboardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClipboardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('component should copy to clipboard', () => {
        const spy = spyOn(component.clipboard, 'copy');
        component.onCopy();
        expect(spy).toHaveBeenCalled();
    });

    it('component should cut to clipboard', () => {
        const spy = spyOn(component.clipboard, 'cut');
        component.onCut();
        expect(spy).toHaveBeenCalled();
    });

    it('component should delete to clipboard', () => {
        const spy = spyOn(component.clipboard, 'delete');
        component.onDelete();
        expect(spy).toHaveBeenCalled();
    });

    it('component should paste to clipboard', () => {
        // tslint:disable:no-string-literal
        const spy = spyOn(component['toolsService'], 'selectToolByName');
        component.onPaste();
        expect(spy).toHaveBeenCalled();
    });
});
