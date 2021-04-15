import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImgurService {
    private header: HttpHeaders;
    private readonly imgurUrl: string = 'https://api.imgur.com/3/image';

    constructor(private http: HttpClient) {
        this.header = new HttpHeaders({ Authorization: 'Client-ID ba6a3c1b4b6aac8' });
    }

    uploadImgur(base64Image: string): Observable<object> {
        const splitedImage = base64Image.split(',')[1];
        const formData = new FormData();
        formData.append('image', splitedImage);
        return this.http.post(this.imgurUrl, formData, {
            headers: this.header,
        });
    }
}
