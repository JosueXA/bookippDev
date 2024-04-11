// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// DESARROLLO LOCAL
export const environment = {
    production: false,
    urlMigracion: "http://localhost:7242/",
    URL: 'https://localhost:7242/api/v1/',
    conektaPublicKey: "key_NS4kKEKhW5H5ltBZbpg2lhU", // Modo Pruebas
};

// MRS
// export const environment = {
//     production: false,
//     urlMigracion: "http://20.225.231.240:8098/",
//     URL: 'http://20.225.231.240:8098/api/v1/',
//     conektaPublicKey: "key_NS4kKEKhW5H5ltBZbpg2lhU", // Modo Pruebas
// };

// PRE PROD
// export const environment = {
//     production: false,
//     urlMigracion: "http://18.188.22.252/",
//     URL: 'http://18.188.22.252/api/v1/',
//     conektaPublicKey: "key_NS4kKEKhW5H5ltBZbpg2lhU", // Modo Pruebas
// };

// PRODUCCIÓN
// export const environment = {
//     production: true,
//     urlMigracion: "https://app.bookipp.com/",
//     URL: 'https://app.bookipp.com/api/v1/',
//     conektaPublicKey: "key_dfMMBv86vSYvMf4NBSnYwYg", // Modo Producción
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
