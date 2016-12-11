var gulp = require('gulp');
var less = require('gulp-less');

// Produce CSS file from LESS for those who like alternatives (CSS, SCSS) 
gulp.task('less', function () {
  return gulp.src('./src/rheostat.less')
    .pipe(less())
    .pipe(gulp.dest('./lib/'));
});







