var gulp = require("gulp");
var webpack = require('webpack-stream');

gulp.task('build', function() {
    return gulp.src('src/index.ts')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist/'));
});