var gulp = require('gulp');

gulp.task('default', ['build', 'documentation']);

gulp.task('build', function () {
  var autoprefixer = require('gulp-autoprefixer');
  var rename = require('gulp-rename');
  var sass = require('gulp-sass');
  var sourcemaps = require('gulp-sourcemaps');

  return gulp.src('sass/canon-bootstrap.scss')
    .pipe(sourcemaps.init())
      .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
      .pipe(sass({ outputStyle: 'compressed' }))
      .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('documentation', ['build'], function (done) {
  var join = require('path').join;
  var async = require('async');
  var metalsmith = require('metalsmith');
  var copy = require('metalsmith-copy');
  var markdown = require('metalsmith-markdown');
  var templates = require('metalsmith-templates');

  async.series({
    metalsmith: function (done) {
      metalsmith(join(__dirname, 'docs'))
        .use(markdown())
        .use(templates('handlebars'))
        .build(done);
    },
    canon: function (done) {
      gulp.src('build/**/*')
        .pipe(gulp.dest('docs/build/canon'))
        .on('end', done);
    },
    bootstrap: function (done) {
      gulp.src('node_modules/bootstrap/dist/**/**')
        .pipe(gulp.dest('docs/build/bootstrap'))
        .on('end', done);
    }
  }, done);
});

gulp.task('server', ['documentation'], function () {
  var webserver = require('gulp-webserver');

  gulp.watch(['sass/**/*.scss', 'docs/**/*.{html,md}'], ['documentation']);

  return gulp.src('docs/build')
    .pipe(webserver({ livereload: true }));
});
