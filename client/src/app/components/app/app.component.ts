import { Component } from '@angular/core';
import { DialogService } from '@app/services/dialog/dialog.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private dialogService: DialogService) {
        this.dialogService.initialize();
    }
}
