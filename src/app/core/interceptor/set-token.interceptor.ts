import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap, Observable, throwError } from "rxjs";
import { ToasterService } from "src/shared/toaster/toaster.service";
import { ResponseData } from "../models/response-data.model";

@Injectable()
export class SetTokenHeaderInterceptors {
    constructor(private _toaster: ToasterService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('tokenBookipp');
        return next.handle(
            req.clone({
                headers: new HttpHeaders({
                    Authorization: 'Bearer ' + token
                })
            })
        ).pipe(tap(
            (event: HttpEvent<ResponseData<any>>) => {
                if (event instanceof HttpResponse) {
                    switch (event.status) {
                        case 200: {
                            if (event.body?.showMessage === true) {
                                this._toaster.success(event.body?.message);
                            }
                            break;
                        }
                    }
                }
            }
        ), catchError((error: HttpErrorResponse) => {
            switch (error.status) {

                case 401: {
                    this._toaster.error(error.error.message);
                    this.handleAuthError();
                    break;
                }
                case 500: {
                    if (error.error.message != "UsuarioContraseniaInvalidos") {
                        this._toaster.errorServer();
                    }
                    break;
                }
                default: {
                    if (error.statusText === "Unknown Error") {
                        this._toaster.errorServer();
                    }
                    else {
                        if (error.error) {
                            this._toaster.error(error.error.message);
                        }
                        else {
                            if (error.message) {
                                this._toaster.error(error.message);
                            }
                        }
                    }

                    break;
                }
            }
            return throwError(error);
        }))

    }

    private handleAuthError() {
        localStorage.removeItem('tokenBookipp');
    }

}
