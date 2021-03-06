/**
 * A simple Gulp-Starter-Kit for modern web development.
 *
 * @package @pwndex/gulp-starter-kit
 * @author Amal Greenberg <pwndex42@gmail.com>
 * @copyright 2020 Amal Greenberg
 * @license https://github.com/pwndex/gulp-starter-kit/blob/master/LICENSE MIT
 * @version v1.0.0
 * @link https://github.com/pwndex/gulp-starter-kit GitHub Repository
 *
 * ________________________________________________________________________________
 *
 * gulpfile.js
 *
 * The gulp configuration file.
 *
 */

const gulp                      = require('gulp'),
      del                       = require('del'),
      imagemin                  = require('gulp-imagemin'),
      gulp_sass                 = require('gulp-sass'),
      autoprefixer              = require('gulp-autoprefixer'),
      sourcemaps                = require('gulp-sourcemaps'),
      notify                    = require('gulp-notify'),
      uglify                    = require('gulp-uglify-es').default,
      cleanCSS                  = require('gulp-clean-css'),
      fileinclude               = require('gulp-file-include'),
      ttf2woff2                 = require('gulp-ttf2woff2')
      webpackStream             = require('webpack-stream'),
      browserSync               = require('browser-sync').create(),

      src_folder                = './src/',
      src_assets_folder         = src_folder + 'assets/',
      dist_folder               = './dist/',
      dist_assets_folder        = dist_folder + 'assets/'

const clean = () => {
  return del([dist_folder])
}

const html = () => {
  return gulp
    .src([src_folder + '*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(dist_folder))
    .pipe(browserSync.stream())
}

const json = () => {
  return gulp
    .src(src_assets_folder + 'js/**/*.json')
    .pipe(gulp.dest(dist_assets_folder + 'js'))
}

const js = () => {
  return gulp
    .src([src_assets_folder + 'js/**/*.js' ])
    .pipe(webpackStream(
      {
        mode: 'development',
        output: {
          filename: 'all.js',
        },
        module: {
          rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }]
        },
      }
    ))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })

    .pipe(sourcemaps.init())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'js'))
    .pipe(browserSync.stream());
}

const sass = () => {
  return gulp
    .src(src_assets_folder + 'scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(gulp_sass({
      outputStyle: 'expanded'
    }).on("error", notify.onError()))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'css'))
    .pipe(browserSync.stream())
}

const fonts = () => {
  return gulp
    .src(src_assets_folder + 'fonts/**/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest(dist_assets_folder + 'fonts'))
}

const images = () => {
  return gulp
    .src([src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'])
    .pipe(imagemin())
    .pipe(gulp.dest(dist_assets_folder + 'images'))
    .pipe(browserSync.stream())
}

const watch = () => {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
  })

  const watch = [
      src_folder + '**/*.html',
      src_assets_folder + 'js/**/*.json',
      src_assets_folder + 'fonts/**',
      src_assets_folder + 'scss/**/*.scss',
      src_assets_folder + 'js/**/*.js',
    ],
    watchImages = [
      src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)',
    ]

  gulp.watch(watch, gulp.series(dev_tasks)).on('change', browserSync.reload)
  gulp.watch(watchImages, gulp.series(images)).on('change', browserSync.reload)
}

const dev_tasks                 = [html, json, fonts, sass, js],
      build_tasks               = [html, json, fonts, images, sass, js]

exports.serve = gulp.series(clean, gulp.parallel(html, json, sass, js, images), fonts, watch)
exports.build = gulp.series(build_tasks)
