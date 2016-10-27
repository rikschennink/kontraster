const gulp = require('gulp');
const util = require('gulp-util');
const browserSync = require('browser-sync').create();
const config = require('./config');
const defaultPort = require('../package').config.port;

function reload(done) {
  browserSync.reload();
  done();
}

module.exports = () => {
  browserSync.init({
    proxy: util.env.proxy || `localhost:${defaultPort}`,
  });

  gulp.watch(`${config.paths.scripts.source}/**/*.js`, gulp.series('scripts', reload));
  gulp.watch(`${config.paths.shaders.source}/**/*.glsl`, gulp.series('shaders', reload));
  gulp.watch(`${config.paths.styles.source}/**/*.scss`, gulp.series('styles', reload));
};
