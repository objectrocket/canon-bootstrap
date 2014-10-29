var async = require('async');
var gulp = require('gulp');

gulp.task('default', ['build', 'documentation']);

gulp.task('build', ['build:sass', 'build:fonts'])

gulp.task('build:sass', function () {
  var autoprefixer = require('gulp-autoprefixer');
  var sass = require('gulp-sass');
  var sourcemaps = require('gulp-sourcemaps');

  return gulp.src('sass/canon-bootstrap.scss')
    .pipe(sourcemaps.init())
      .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
      .pipe(sass({ includePaths: ['node_modules/bootstrap-sass/assets/stylesheets'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('build:fonts', function () {
  return gulp.src('fonts/**/*')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('documentation', ['build'], function (done) {
  var join = require('path').join;
  var metalsmith = require('metalsmith');
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
        .pipe(gulp.dest('docs/build'))
        .on('end', done);
    }
  }, done);
});

gulp.task('server', ['documentation'], function () {
  var webserver = require('gulp-webserver');

  gulp.watch(['sass/**/*.scss', 'docs/!(build)/**/*.*'], ['documentation']);

  return gulp.src('docs/build')
    .pipe(webserver({ livereload: true }));
});
