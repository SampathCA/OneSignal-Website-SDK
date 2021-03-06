var fs = require('fs');
var gulp = require("gulp");
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');

var oneSignalSourceDir = "/Users/jpang/code/OneSignal";
var IS_PRODUCTION_BUILD = process.argv.indexOf('--production') >= 0 || false;
var IS_TEST_BUILD = process.argv.indexOf('--test') >= 0 || false;
var IS_BETA_BUILD = process.argv.indexOf('--beta') >= 0 || false;


gulp.task("default", function() {
  if (IS_BETA_BUILD) {
    runSequence(['reload-changes', 'transpile-javascript', 'transfer-beta-sdk']);
  } else {
    runSequence(['reload-changes', 'transpile-javascript']);
  }
});

function transferFileRemote(localFilePath, remoteFilePath) {
  return `
    #!/bin/bash
    for i in \`seq 1 3\`;
    do
       scp ${localFilePath} deploy@frontend-v2-00$i:${remoteFilePath}
    done
  `;
}

gulp.task("transfer-beta-sdk", shell.task([
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBeta.js'),
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js.map', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBeta.js.map'),
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBetaWorker.js'),
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js.map', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBetaWorker.js.map'),
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBetaUpdaterWorker.js'),
  transferFileRemote('~/code/OneSignal-Website-SDK/dist/OneSignalSDKBeta.js.map', '/var/www/OneSignal/current/public/beta_sdks/OneSignalSDKBetaUpdaterWorker.js.map'),
]));

gulp.task("reload-changes", ['copy-assets', 'copy-js'], function() {
  gulp.watch(['assets/OneSignalSDKWorker.*.js'], ['copy-assets']);
  gulp.watch('dist/*.js', ['copy-js']);
});

gulp.task("transpile-javascript", shell.task([
  'webpack --progress --sort-assets-by --watch --colors ' + (IS_PRODUCTION_BUILD ? '--production' : '') + ' ' + (IS_TEST_BUILD ? '--test' : '') + ' ' + (IS_BETA_BUILD ? '--beta' : '')
]));

/*
  Creates:
   - OneSignal/public/OneSignalSDKWorker.js
   - OneSignal/public/OneSignalSDKUpdaterWorker.js

  These files have the importScripts('...') set either to our DEV_HOST or onesignal.com depending on build mode.
 */
gulp.task("copy-assets", function() {
  var fileSuffix = IS_PRODUCTION_BUILD ? '.prod.js' : '.dev.js';
  gulp.src('assets/OneSignalSDKWorker' + fileSuffix)
    .pipe(rename("OneSignalSDKWorker.js"))
    .pipe(gulp.dest(oneSignalSourceDir + '/public'));
  gulp.src('assets/OneSignalSDKWorker' + fileSuffix)
    .pipe(rename("OneSignalSDKUpdaterWorker.js"))
    .pipe(gulp.dest(oneSignalSourceDir + '/public'));
});

/*
 Creates:
 - OneSignal/public/(dev_)sdks/OneSignalSDK.js
 - OneSignal/public/(dev_)sdks/OneSignalSDKWorker.js

 These files are the web SDK. Depending on build mode, goes to either `dev_sdks` or `sdks`.
 */
gulp.task("copy-js", function() {
  var targetFolder = IS_PRODUCTION_BUILD ? 'sdks' : 'dev_sdks';

  // Copy to OneSignal's public/(dev_)sdks/OneSignalSDK.js
  gulp.src("./dist/OneSignalSDK.js")
    .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));

  if (fs.existsSync("./dist/OneSignalSDK.js.map")) {
    gulp.src("./dist/OneSignalSDK.js.map")
      .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));
  }

  // Copy to OneSignal's public/(dev_)sdks/OneSignalSDKWorker.js
  gulp.src("./dist/OneSignalSDK.js")
    .pipe(rename("/OneSignalSDKWorker.js"))
    .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));

  if (fs.existsSync("./dist/OneSignalSDK.js.map")) {
    gulp.src("./dist/OneSignalSDK.js.map")
      .pipe(rename("/OneSignalSDKWorker.js.map"))
      .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));
  }

  if (IS_TEST_BUILD) {
    gulp.src("./dist/OneSignalSDKTests.js")
      .pipe(rename("/OneSignalSDKTests.js"))
      .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));

    if (fs.existsSync("./dist/OneSignalSDKTests.js.map")) {
      gulp.src("./dist/OneSignalSDKTests.js.map")
        .pipe(rename("/OneSignalSDKTests.js.map"))
        .pipe(gulp.dest(oneSignalSourceDir + "/public/" + targetFolder));
    }
  }
});
