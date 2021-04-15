import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { ToolNames } from '@app/enums/tools-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { DrawingComponent } from './drawing.component';

class ToolStub extends Tool {
    initializePropreties(): void {
        return;
    }
}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        toolStub = new ToolStub({
            saveCanvas(): void {
                return;
            },
        } as DrawingService);

        drawServiceSpy = jasmine.createSpyObj('DrawingService', [
            'loadCanvas',
            'clearCanvas',
            'saveCanvas',
            'initializeProperties',
            'initializeColor',
            'fillCanvasWhite',
        ]);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: PencilService, useValue: toolStub },
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('afterViewInit should getItem from localStorage', () => {
        // tslint:disable: no-any
        // tslint:disable: no-string-literal
        const getItemSpy = spyOn<any>(window.localStorage, 'getItem');
        component.ngAfterViewInit();
        fixture.detectChanges();
        expect(drawServiceSpy.saveCanvas).not.toHaveBeenCalled();
        expect(getItemSpy).not.toHaveBeenCalled();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        fixture.detectChanges();
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });

    it('saveAndResize should call endDrawing if selected tool', () => {
        const initializeSpy = spyOn(toolStub, 'initializeProperties');
        const endDrawingSpy = spyOn(toolStub, 'endDrawing');
        component.saveAndResizeCanvas({ width: 0, height: 0 });
        fixture.detectChanges();
        expect(initializeSpy).not.toHaveBeenCalled();
        expect(endDrawingSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('saveAndResize should  call endDrawing if  selected tool', () => {
        const endDrawingSpy = spyOn(toolStub, 'endDrawing');
        const spyProprety = spyOn<any>(toolStub, 'initializeProperties');
        component.saveAndResizeCanvas({ width: 0, height: 0 });
        fixture.detectChanges();
        expect(endDrawingSpy).toHaveBeenCalled();
        expect(spyProprety).not.toHaveBeenCalled();
    });

    it('saveAndResize should not call endDrawing if current tool is undefined', () => {
        // tslint:disable: no-magic-numbers
        component.currentTool = component['toolsService'].tools[-1];
        const endDrawingSpy = spyOn(toolStub, 'endDrawing');
        component.saveAndResizeCanvas({ width: 0, height: 0 });
        fixture.detectChanges();
        expect(endDrawingSpy).not.toHaveBeenCalled();
        component.currentTool = component['toolsService'].tools[0];
    });

    it('NgAfterViewInit', () => {
        const spyLocal = spyOn(window.localStorage, 'getItem').and.callFake(() => {
            return 'foss';
        });
        component.ngAfterViewInit();
        fixture.detectChanges();
        expect(spyLocal);
        expect(drawServiceSpy.loadCanvas).not.toHaveBeenCalled();
        window.localStorage.clear();
    });

    it('NgAfterViewInit and doesnt find the canvas item with getItem', () => {
        const spyLocal = spyOn(window.localStorage, 'getItem').and.callFake(() => {
            return 'true';
        });
        component.ngAfterViewInit();
        expect(spyLocal);
        expect(drawServiceSpy.loadCanvas).not.toHaveBeenCalled();
        window.localStorage.clear();
    });

    it('should remove the cursor for eraser tool', () => {
        component.currentTool.name = ToolNames.Eraser;
        component.setIsCursorNone();
        fixture.detectChanges();
        expect(component.isCursorNone).toBeTruthy();
    });
});
