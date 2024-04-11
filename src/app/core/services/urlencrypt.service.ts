import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Type } from '@angular/core';
import { PantallaService } from './pantalla.service';
import { MethodsService } from './methods.service';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { CurrencyPipe } from '@angular/common';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import jsPDF from 'jspdf';
declare var $: any; // JQUERY
import pdfMake from 'pdfmake/build/pdfmake';
import { vfsFontObject } from '../../../assets/fonts/vfs_fonts';
pdfMake.vfs = vfsFontObject;


@Injectable({
    providedIn: 'root'
})

export class URLEncruptService {

    constructor(private dialog: MatDialog, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService) {

    }

    public encrypt(url: string): string {
        var opcionEncrupt = Math.floor(Math.random() * 2);
        let urlEncrypt = "";

        if (opcionEncrupt == 1) {

            for (let i = 0; i < url.length; i++) {

                switch (url[i]) {
                    case '1':
                        urlEncrypt += 'c';
                        break;
                    case '2':
                        urlEncrypt += 'f';
                        break;
                    case '3':
                        urlEncrypt += 'l';
                        break;
                    case '4':
                        urlEncrypt += 'm';
                        break;
                    case '5':
                        urlEncrypt += 'p';
                        break;
                    case '6':
                        urlEncrypt += 'i';
                        break;
                    case '7':
                        urlEncrypt += 'o';
                        break;
                    case '8':
                        urlEncrypt += 'r';
                        break;
                    case '9':
                        urlEncrypt += 'y';
                        break;
                    case '0':
                        urlEncrypt += 'z';
                        break;
                    case ',':
                        urlEncrypt += 'u';
                        break;
                }
                // 20231211
                 // fzf311211
                /*    url = url.replace('1', 'c');
                      url = url.replace('2', 'f');
                      url = url.replace('3', 'l');
                      url = url.replace('4', 'm');
                      url = url.replace('5', 'p');
                      url = url.replace('6', 'i');
                      url = url.replace('7', 'o');
                      url = url.replace('8', 'r');
                      url = url.replace('9', 'y');
                      url = url.replace('0', 'z');
                      url = url.replace(',', 'u');*/
            }

        }
        else if (opcionEncrupt == 0 || opcionEncrupt == 2) {

            for (let i = 0; i < url.length; i++) {

                switch (url[i]) {
                    case '1':
                        urlEncrypt += 'y';
                        break;
                    case '2':
                        urlEncrypt += 'u';
                        break;
                    case '3':
                        urlEncrypt += 't';
                        break;
                    case '4':
                        urlEncrypt += 'r';
                        break;
                    case '5':
                        urlEncrypt += 'e';
                        break;
                    case '6':
                        urlEncrypt += 'g';
                        break;
                    case '7':
                        urlEncrypt += 'h';
                        break;
                    case '8':
                        urlEncrypt += 'w';
                        break;
                    case '9':
                        urlEncrypt += 'n';
                        break;
                    case '0':
                        urlEncrypt += 'm';
                        break;
                    case ',':
                        urlEncrypt += 'c';
                        break;
                }
            }
            /*  url = url.replace('1', 'y');
               url = url.replace('2', 'u');
               url = url.replace('3', 't');
               url = url.replace('4', 'r');
               url = url.replace('5', 'e');
               url = url.replace('6', 'g');
               url = url.replace('7', 'h');
               url = url.replace('8', 'w');
               url = url.replace('9', 'n');
               url = url.replace('0', 'm');
               url = url.replace(',', 'c');*/
        }

        return opcionEncrupt == 1 ? "a" + urlEncrypt : "b" + urlEncrypt;

    }

    public desencrypt(url: string): string {
        console.log(url);
        let urlEncrypt = "";

        if (url[0] == "a") {
            for (let i = 0; i < url.length; i++) {

                switch (url[i]) {
                    case 'c':
                        urlEncrypt += '1';
                        break;
                    case 'f':
                        urlEncrypt += '2';
                        break;
                    case 'l':
                        urlEncrypt += '3';
                        break;
                    case 'm':
                        urlEncrypt += '4';
                        break;
                    case 'p':
                        urlEncrypt += '5';
                        break;
                    case 'i':
                        urlEncrypt += '6';
                        break;
                    case 'o':
                        urlEncrypt += '7';
                        break;
                    case 'r':
                        urlEncrypt += '8';
                        break;
                    case 'y':
                        urlEncrypt += '9';
                        break;
                    case 'z':
                        urlEncrypt += '0';
                        break;
                    case 'u':
                        urlEncrypt += ',';
                        break;
                }
            }
        }
        else if (url[0] == "b") {
            for (let i = 0; i < url.length; i++) {

                switch (url[i]) {
                    case 'y':
                        urlEncrypt += '1';
                        break;
                    case 'u':
                        urlEncrypt += '2';
                        break;
                    case 't':
                        urlEncrypt += '3';
                        break;
                    case 'r':
                        urlEncrypt += '4';
                        break;
                    case 'e':
                        urlEncrypt += '5';
                        break;
                    case 'g':
                        urlEncrypt += '6';
                        break;
                    case 'h':
                        urlEncrypt += '7';
                        break;
                    case 'w':
                        urlEncrypt += '8';
                        break;
                    case 'n':
                        urlEncrypt += '9';
                        break;
                    case 'm':
                        urlEncrypt += '0';
                        break;
                    case 'c':
                        urlEncrypt += ',';
                        break;
                }
            }
        }
        /* if (url[0] == "a") {
             url = url.replace('c', '1');
             url = url.replace('f', '2');
             url = url.replace('l', '3');
             url = url.replace('m', '4');
             url = url.replace('p', '5');
             url = url.replace('i', '6');
             url = url.replace('o', '7');
             url = url.replace('r', '8');
             url = url.replace('y', '9');
             url = url.replace('z', '0');
             url = url.replace('u', ',');
         }
         else if (url[0] == "b") {
             url = url.replace('y', '1');
             url = url.replace('u', '2');
             url = url.replace('t', '3');
             url = url.replace('r', '4');
             url = url.replace('e', '5');
             url = url.replace('g', '6');
             url = url.replace('h', '7');
             url = url.replace('w', '8');
             url = url.replace('n', '9');
             url = url.replace('m', '0');
             url = url.replace('c', ',');
         }
 */
        return urlEncrypt;

    }

}