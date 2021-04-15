import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { ClipboardComponent } from '@app/components/tools/clipboard/clipboard.component';
import { ColorPickerComponent } from '@app/components/tools/color-picker/color-picker.component';
import { PencilComponent } from '@app/components/tools/pencil/pencil.component';
import { LineService } from '@app/services/tools/line/line.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { OptionPanelComponent } from './option-panel.component';

describe('OptionPanelComponent', () => {
    let component: OptionPanelComponent;
    let fixture: ComponentFixture<OptionPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatSliderModule, MatSlideToggleModule, FormsModule, MatFormFieldModule, MatCardModule],
            declarations: [OptionPanelComponent, ColorPickerComponent, PencilComponent, ClipboardComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OptionPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct current tool', () => {
        const toolsService = TestBed.inject(ToolsService);
        const lineService = TestBed.inject(LineService);
        const spyEndDrawing = spyOn(toolsService.selectedTool.value, 'endDrawing');
        toolsService.selectTool(lineService);
        expect(component.currentTool).toEqual(lineService);
        expect(spyEndDrawing);
    });
});
