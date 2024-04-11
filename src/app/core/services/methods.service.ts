import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
	providedIn: 'root'
})

export class MethodsService {

	// ----------------------------------- Declaracion de variables ----------------------------------- 
	jwtHelper = new JwtHelperService();


	// ----------------------------------- Declaracion de funciones -----------------------------------
	constructor(private _http: HttpClient) {

	}

	public ContieneSession(): boolean {
		return localStorage.getItem('tokenBookipp') ? true : false;
	}

	public SessionVigente(): boolean {
		try {
			const token = localStorage.getItem('tokenBookipp') + '';
			const isTokenExpired = this.jwtHelper.isTokenExpired(token);
			if (isTokenExpired === true) {
				return false;
			} else {
				return true;
			}
		} catch (e) {
			return false;
		}
	}


	HttpGet(serviceName: string, fromQuery: any): Observable<any> {
		if (this.ContieneSession()) {
			if (this.SessionVigente()) {
				let httpParams = new HttpParams();
				Object.keys(fromQuery).forEach(key => {
					if (fromQuery[key] !== undefined && fromQuery[key] !== null && fromQuery[key] !== '') {
						httpParams = httpParams.set(key, fromQuery[key].toString());
					}
				});
				return this._http.get<any>(
					environment.URL + serviceName, { params: httpParams }
				);
			}
			else {
				return throwError("SesionCaducada");
			}
		}
		else {
			return throwError("SinSesion");
		}
	}

	HttpPost(url: string, fromQuery: any, fromBody: any, responseT?: any): Observable<any> {
		if (this.ContieneSession()) {
			if (this.SessionVigente()) {
				let httpParams = new HttpParams();
				Object.keys(fromQuery).forEach(key => {
					if (fromQuery[key] !== undefined && fromQuery[key] !== null && fromQuery[key] !== '') {
						httpParams = httpParams.set(key, fromQuery[key].toString());
					}
				});
				if (responseT) {
					return this._http.post<any>(
						environment.URL + url, fromBody, { params: httpParams, responseType: responseT }
					);
				}
				else {
					return this._http.post<any>(
						environment.URL + url, fromBody, { params: httpParams }
					);
				}
			}
			else {
				return throwError("SesionCaducada");
			}
		}
		else {
			return throwError("SinSesion");
		}
	}

	HttpPut(url: string, fromQuery: any, fromBody: any): Observable<any> {
		if (this.ContieneSession()) {
			if (this.SessionVigente()) {
				let httpParams = new HttpParams();
				Object.keys(fromQuery).forEach(key => {
					if (fromQuery[key] !== undefined && fromQuery[key] !== null && fromQuery[key] !== '') {
						httpParams = httpParams.set(key, fromQuery[key].toString());
					}
				});
				return this._http.put<any>(
					environment.URL + url, fromBody, { params: httpParams }
				);
			}
			else {
				return throwError("SesionCaducada");
			}
		}
		else {
			return throwError("SinSesion");
		}
	}

	HttpDelete(url: string, fromQuery: any, fromBody: any): Observable<any> {
		if (this.ContieneSession()) {
			if (this.SessionVigente()) {
				let httpParams = new HttpParams();
				Object.keys(fromQuery).forEach(key => {
					if (fromQuery[key] !== undefined && fromQuery[key] !== null && fromQuery[key] !== '') {
						httpParams = httpParams.set(key, fromQuery[key].toString());
					}
				});
				return this._http.delete<any>(
					environment.URL + url, { body: fromBody, params: httpParams }
				);
			}
			else {
				return throwError("SesionCaducada");
			}
		}
		else {
			return throwError("SinSesion");
		}
	}


	HttpPostTest(url: string, fromQuery: any, fromBody: any, responseT?: any): Observable<any> {
		return throwError("SesionCaducada");
	}
}
