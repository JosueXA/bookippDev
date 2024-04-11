import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class LoginService {
    constructor(
        private _http: HttpClient
    ) {
    }

    HttpPost(url: string, fromQuery: any, fromBody: any): Observable<any> {
        let httpParams = new HttpParams();
        Object.keys(fromQuery).forEach(key => {
            if (fromQuery[key] !== undefined && fromQuery[key] !== null && fromQuery[key] !== '') {
                httpParams = httpParams.set(key, fromQuery[key].toString());
            }
        });
        return this._http.post<any>(
            environment.URL + url, fromBody, { params: httpParams }
        );
    }

}
