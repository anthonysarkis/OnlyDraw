import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ImgurService } from './imgur.service';

describe('ImgurService', () => {
    let service: ImgurService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(ImgurService);
        baseUrl = 'https://api.imgur.com/3/image';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create post request to imgur', () => {
        service.uploadImgur('test').subscribe(() => {
            return;
        });
        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
    });
});
