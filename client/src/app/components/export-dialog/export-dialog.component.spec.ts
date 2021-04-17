import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExportService } from '@app/services/export/export.service';
import { ExportDialogComponent } from './export-dialog.component';

describe('ExportDialogComponent', () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;
    let exportSpy: jasmine.SpyObj<ExportService>;

    beforeEach(async(() => {
        exportSpy = jasmine.createSpyObj('ExportService', [
            'setFilters',
            'applyFilter',
            'initializeImage',
            'exportImage',
            'exportImgur',
            'openExportDialog',
            'showSnackbar',
        ]);
        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                FormsModule,
                MatInputModule,
                MatFormFieldModule,
                BrowserAnimationsModule,
                MatSelectModule,
                MatSnackBarModule,
                MatIconModule,
            ],
            declarations: [ExportDialogComponent],
            providers: [{ provide: ExportService, useValue: exportSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onFilterChange should apply a filter on the canvas', () => {
        component.onFilterChange();
        expect(exportSpy.applyFilter).toHaveBeenCalled();
    });

    it('onExportImage should export the image', () => {
        component.onExportImage();
        expect(exportSpy.exportImage).toHaveBeenCalled();
    });

    it('onExportImgur should export the image to Imgur', () => {
        component.onExportImgur();
        expect(exportSpy.exportImgur).toHaveBeenCalled();
    });
    it('onOpenSnackbar should open the snackbar message', () => {
        component.onOpenSnackbar();
        expect(exportSpy.showSnackbar).toHaveBeenCalled();
    });
});
