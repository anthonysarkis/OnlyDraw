import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DrawingSliderComponent } from './components/drawing-slider/drawing-slider.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MusicDialogComponent } from './components/music-dialog/music-dialog.component';
import { OptionPanelComponent } from './components/option-panel/option-panel.component';
import { SaveImageServerComponent } from './components/save-image-server/save-image-server.component';
import { SelectionComponent } from './components/selection/selection.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TextboxComponent } from './components/textbox/textbox.component';
import { AerosolComponent } from './components/tools/aerosol/aerosol.component';
import { BucketComponent } from './components/tools/bucket/bucket.component';
import { ClipboardComponent } from './components/tools/clipboard/clipboard.component';
import { ColorPanelComponent } from './components/tools/color-panel/color-panel.component';
import { ColorPickerComponent } from './components/tools/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/tools/color-slider/color-slider.component';
import { EllipseComponent } from './components/tools/ellipse/ellipse.component';
import { EraserComponent } from './components/tools/eraser/eraser.component';
import { GridComponent } from './components/tools/grid/grid.component';
import { LineComponent } from './components/tools/line/line.component';
import { MagnetismComponent } from './components/tools/magnetism/magnetism.component';
import { PencilComponent } from './components/tools/pencil/pencil.component';
import { PipetteComponent } from './components/tools/pipette/pipette.component';
import { PolygonComponent } from './components/tools/polygon/polygon.component';
import { RectangleComponent } from './components/tools/rectangle/rectangle.component';
import { SelectionEllipseComponent } from './components/tools/selection-ellipse/selection-ellipse.component';
import { SelectionPolygonComponent } from './components/tools/selection-polygon/selection-polygon.component';
import { SelectionRectangleComponent } from './components/tools/selection-rectangle/selection-rectangle.component';
import { StampComponent } from './components/tools/stamp/stamp.component';
import { TextComponent } from './components/tools/text/text.component';
import { ListenerDirective } from './directives/listener/listener.directive';
import { MainListenerDirective } from './directives/main-listener/main-listener.directive';
import { SelectionListenerDirective } from './directives/selection-listener/selection-listener.directive';
import { MaterialModule } from './material.module';
@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        LineComponent,
        ColorPanelComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        RectangleComponent,
        EllipseComponent,
        EraserComponent,
        OptionPanelComponent,
        PencilComponent,
        ConfirmationDialogComponent,
        AerosolComponent,
        PipetteComponent,
        PolygonComponent,
        SelectionRectangleComponent,
        SelectionEllipseComponent,
        DrawingSliderComponent,
        ExportDialogComponent,
        SelectionComponent,
        ListenerDirective,
        SelectionListenerDirective,
        SaveImageServerComponent,
        MainListenerDirective,
        StampComponent,
        TextComponent,
        TextboxComponent,
        SelectionPolygonComponent,
        ClipboardComponent,
        BucketComponent,
        GridComponent,
        MusicDialogComponent,
        MagnetismComponent,
    ],
    imports: [
        MatButtonToggleModule,
        NoopAnimationsModule,
        ClipboardModule,
        HttpClientModule,
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        DragDropModule,
        MatSnackBarModule,
        MatSelectModule,
        CommonModule,
        NgxAudioPlayerModule,
    ],
    providers: [{ provide: Window, useValue: window }],
    bootstrap: [AppComponent],
})
export class AppModule {}
