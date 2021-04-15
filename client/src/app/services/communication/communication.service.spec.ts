import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SERVER_ERROR } from '@app/classes/constants';
import { Image } from '@common/communication/image';
import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    let expectedMessage: Image;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(CommunicationService);
        // tslint:disable: no-string-literal
        baseUrl = service['BASE_URL'];
        expectedMessage = { name: 'Hello', tags: ['world'] };
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return expected message using name (HttpClient called once)', () => {
        service.getImage(expectedMessage.name).subscribe((response: Image) => {
            expect(response.name).toEqual(expectedMessage.name);
            expect(response.tags).toEqual(expectedMessage.tags);
        }, fail);

        const req = httpMock.expectOne(baseUrl + 'id/' + expectedMessage.name);
        expect(req.request.method).toBe('GET');
    });

    it('should return expected message using tag (HttpClient called once)', () => {
        service.getImagesByTag(expectedMessage.tags).subscribe((response: Image[]) => {
            expect(response[0].name).toEqual(expectedMessage.name);
            expect(response[0].tags).toEqual(expectedMessage.tags);
        }, fail);

        const req = httpMock.expectOne(baseUrl + 'tag/?tags=world');
        expect(req.request.method).toBe('GET');
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Image = { name: 'Hello', tags: ['World'] };
        // tslint:disable: no-empty
        service.postImage(sentMessage).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
    });

    it('should not return any message when sending a DELETE request (HttpClient called once)', () => {
        const sentMessage: Image = { name: 'Hello', tags: ['World'] };
        service.deleteImage(sentMessage.name).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + sentMessage.name);
        expect(req.request.method).toBe('DELETE');
    });

    it('should handle a 400 http error safely', () => {
        service.getAllImages().subscribe(
            (response: Image[]) => {
                expect(response).toBeUndefined();
            },
            (error) => {
                expect(error).toBe(data);
            },
            fail,
        );

        const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
        const data = 'Invalid request parameters';
        httpMock.expectOne(baseUrl).flush(data, mockErrorResponse);
    });

    it('should handle a 500 http error safely', () => {
        service.getAllImages().subscribe(
            (response: Image[]) => {
                expect(response).toBeUndefined();
            },
            (error) => {
                expect(error).toBe(SERVER_ERROR);
            },
            fail,
        );

        const mockErrorResponse = { status: 500, statusText: 'Bad Request' };
        const data = 'Invalid request parameters';
        httpMock.expectOne(baseUrl).flush(data, mockErrorResponse);
    });

    it('should handle a 0 http error safely', () => {
        service.getAllImages().subscribe(
            (response: Image[]) => {
                expect(response).toBeUndefined();
            },
            (error) => {
                expect(error).toBe(data);
            },
            fail,
        );

        const mockErrorResponse = { status: 0, statusText: 'Bad Request', error: ('' as unknown) as ProgressEvent };
        const data = 'Invalid request parameters';
        httpMock.expectOne(baseUrl).flush(data, mockErrorResponse);
    });
});
