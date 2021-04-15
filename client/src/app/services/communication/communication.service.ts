import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_ERROR } from '@app/classes/constants';
import { Image } from '@common/communication/image';
import { HttpStatus } from '@common/http-status-codes/http-status-codes';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/image/';

    constructor(private http: HttpClient) {}

    getAllImages(): Observable<Image[]> {
        return this.http.get<Image[]>(this.BASE_URL).pipe(catchError(this.handleError<Image[]>()));
    }

    getImage(imageId: string): Observable<Image> {
        return this.http.get<Image>(`${this.BASE_URL}id/${imageId}`).pipe(catchError(this.handleError<Image>()));
    }

    getImagesByTag(filterTags: string[]): Observable<Image[]> {
        return this.http.get<Image[]>(`${this.BASE_URL}tag/?tags=${filterTags}`).pipe(catchError(this.handleError<Image[]>()));
    }

    postImage(imageToPost: Image): Observable<void> {
        return this.http.post<void>(this.BASE_URL, imageToPost).pipe(catchError(this.handleError<void>()));
    }

    deleteImage(imageId: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE_URL}${imageId}`).pipe(catchError(this.handleError<void>()));
    }

    private handleError<T>(): (error: Error) => Observable<T> {
        return (error: HttpErrorResponse): Observable<T> => {
            let errorMessage = '';
            if (
                (error.status === 0 && error.error instanceof ProgressEvent) ||
                error.status === HttpStatus.INTERNAL_SERVER_ERROR ||
                error.status === HttpStatus.NOT_FOUND
            )
                errorMessage = SERVER_ERROR;
            else errorMessage = error.error;
            return throwError(errorMessage);
        };
    }
}
