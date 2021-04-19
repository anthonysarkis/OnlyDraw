import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextService } from '@app/services/tools/text/text.service';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
    let component: TextComponent;
    let fixture: ComponentFixture<TextComponent>;
    let textServiceSpy: jasmine.SpyObj<TextService>;

    beforeEach(async(() => {
        textServiceSpy = jasmine.createSpyObj('TextService', ['resizeTextBox']);
        textServiceSpy.currentStyle = {
            'font-size': '20px',
            'font-style': 'normal',
            'font-weight': 'normal',
            'text-align': 'left',
            'font-family': 'Georgia',
        };
        textServiceSpy.textArea = {
            focus(): void {
                return;
            },
        } as HTMLTextAreaElement;
        TestBed.configureTestingModule({
            imports: [
                MatButtonToggleModule,
                MatSelectModule,
                BrowserAnimationsModule,
                MatSliderModule,
                MatIconModule,
                MatFormFieldModule,
                MatSlideToggleModule,
            ],
            declarations: [TextComponent],
            providers: [{ provide: TextService, useValue: textServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change font style on font style change', () => {
        component.onFontStyleChange('italic');
        expect(textServiceSpy.currentStyle['font-style']).toBe('italic');
    });

    it('should not change font style on font style change if invalid style', () => {
        textServiceSpy.currentStyle['font-style'] = 'italic';
        component.onFontStyleChange('test');
        expect(textServiceSpy.currentStyle['font-style']).toBe('italic');
    });

    it('should change font family on font family change', () => {
        component.font = 'Arial';
        component.onFontFamilyChange();
        expect(textServiceSpy.currentStyle['font-family']).toBe('Arial');
    });

    it('shouldnt change font family if fonts doesnt include font', () => {
        component.font = 'khalilJibran';
        component.onFontFamilyChange();
        expect(textServiceSpy.currentStyle['font-family']).not.toBe('khalilJibran');
    });

    it('should change font weight on font weight change', () => {
        component.onFontWeightChange('bold');
        expect(textServiceSpy.currentStyle['font-weight']).toBe('bold');
    });

    it('should not change font weight on font weight change if invalid input', () => {
        textServiceSpy.currentStyle['font-weight'] = 'normal';
        component.onFontWeightChange('test');
        expect(textServiceSpy.currentStyle['font-weight']).toBe('normal');
    });

    it('should not change font size on font size change if inferior to minimum', () => {
        textServiceSpy.currentStyle['font-size'] = '20px';
        component.onFontSizeChange(2);
        expect(textServiceSpy.currentStyle['font-size']).toBe('20px');
    });

    it('should change font size on font size change', () => {
        const fontsize = 20;
        component.onFontSizeChange(fontsize);
        expect(textServiceSpy.currentStyle['font-size']).toBe('20px');
    });

    it('should change text align on text align change', () => {
        component.onTextAlignChange('center');
        expect(textServiceSpy.currentStyle['text-align']).toBe('center');
    });

    it('should not change text align on text align change if invalid text align', () => {
        textServiceSpy.currentStyle['text-align'] = 'left';
        component.onTextAlignChange('test');
        expect(textServiceSpy.currentStyle['text-align']).toBe('left');
    });

    it('should change font attributes on font change', () => {
        component.onFontChange(['italic', 'bold']);
        expect(textServiceSpy.currentStyle['font-weight']).toBe('bold');
        expect(textServiceSpy.currentStyle['font-style']).toBe('italic');
    });

    it('should not change font attributes if not valid font change', () => {
        component.onFontChange(['foss', 'tiz']);
        expect(textServiceSpy.currentStyle['font-weight']).toBe('normal');
        expect(textServiceSpy.currentStyle['font-style']).toBe('normal');
    });
});
