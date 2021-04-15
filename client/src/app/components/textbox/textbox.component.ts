import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TextService } from '@app/services/tools/text/text.service';

@Component({
    selector: 'app-textbox',
    templateUrl: './textbox.component.html',
    styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements AfterViewInit {
    @ViewChild('textBox', { static: false }) private textBox: ElementRef<HTMLTextAreaElement>;
    constructor(public textService: TextService) {}

    ngAfterViewInit(): void {
        this.textService.textArea = this.textBox.nativeElement;
    }
}
