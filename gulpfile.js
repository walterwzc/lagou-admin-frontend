/**
  gulp完成的任务：
  1、启动webserver
  2、编译sass, less
  3、CommonJS模块化
  4、Mock数据
  5、版本号控制
  6、打包压缩
  7、版本切换
 */

var gulp = require('gulp')
var webserver = require('gulp-webserver')
var proxy = require('http-proxy-middleware')
var sass = require('gulp-sass')
var webpack = require('webpack-stream')
var watch = require('gulp-watch')
var minifyHTML = require('gulp-minify-html');
var gulpif = require('gulp-if')
var $ = require('gulp-load-plugins')()
var rev = require('gulp-rev')
var revCollector = require('gulp-rev-collector')
var del = require('del')
var gulpSequence = require('gulp-sequence')
var babel = require('gulp-babel')
var path = require('path')

// 配置生产环境前端发布目录
var dist = path.resolve(__dirname, '../lagou-admin/public/a')

// 配置环境变量
var minimist = require('minimist')
var knownOpitions = {
    string: 'env',
    default: {
        env: process.env.NODE_ENV || 'production'
    }
}
var option = minimist(process.argv.slice(2), knownOpitions)

// 本地webserver
gulp.task('webserver', function () {
    gulp.src('./dev')
        .pipe(webserver({
            host: 'localhost',
            port: 8000,
            path: '/',
            livereload: true,
            directoryListing: {
                enable: true,
                path: './dev'
            },

            // http 反向代理
            middleware: [
                proxy('/api', {
                    // target: 'http://localhost:3000',
                    target: 'http://localhost:8081',
                    changeOrigin: true
                }),
                proxy('/vip', {
                    target: 'http://localhost:9000',
                    changeOrigin: true
                })
            ]
        }))
})

// 编译sass
gulp.task('sass', function () {
    return gulp.src('./src/styles/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(option.env === 'production', $.minifyCss()))
        .pipe(gulpif(option.env === 'production', rev()))
        .pipe(gulpif(option.env !== 'production', gulp.dest('./dev/styles')))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/styles')))
        .pipe(gulpif(option.env === 'production', rev.manifest()))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/rev/styles')))
})

// 基于commonjs的模块化开发
gulp.task('packjs', function () {
    return gulp.src('./src/scripts/app.js')


        .pipe(webpack({
            entry: {
                app: './src/scripts/app.js'
            },
            output: {
                filename: '[name].js',
            },
            module: {
                loaders: [{
                    test: /\.html$/,
                    loader: 'string-loader'
                }, ],
            }
        }))

        // .pipe(gulpif(option.env === 'production', babel({
        //   presets: ['env'],
        //   plugins: ['transform-runtime']
        // })))
        //
        // .pipe(gulpif(option.env === 'production', uglify()))

        .pipe(gulpif(option.env === 'production', rev()))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/scripts')))
        .pipe(gulpif(option.env === 'production', rev.manifest()))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/rev/scripts')))
        .pipe(gulpif(option.env !== 'production', gulp.dest('./dev/scripts')))
})

gulp.task('copyhtml', function () {
    if (option.env === 'production') {
        gulp.src([dist + '/rev/**/*.json', './src/*.html'])
            .pipe(revCollector({
                replaceReved: true
            }))
            // .pipe(minifyHTML({
            //   empty: true,
            //   spare: true
            // }))
            .pipe(gulp.dest(dist))

    } else {
        gulp.src('./src/*.html')
            .pipe(gulp.dest('./dev'))
    }
})
gulp.task('copystatic', function () {
    gulp.src('./src/static/**/*')
        .pipe(gulpif(option.env !== 'production', gulp.dest('./dev/static')))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/static')))
})
gulp.task('copylibs', function () {
    gulp.src('./src/libs/**/*')
        .pipe(gulpif(option.env !== 'production', gulp.dest('./dev/libs')))
        .pipe(gulpif(option.env === 'production', gulp.dest(dist + '/libs')))
})

gulp.task('copymock', function () {
    gulp.src('./src/mock/**/*')
        .pipe(gulp.dest('./dev/mock'))
})

gulp.task('watch', function () {
    watch('./src/*.html', function () {
        gulp.start('copyhtml')
    })
    watch('./src/mock/**/*', function () {
        gulp.start('copymock')
    })
    watch('./src/libs/**/*', function () {
        gulp.start('copylibs')
    })
    watch('./src/styles/**/*.{scss,css}', function () {
        gulp.start('sass')
    })
    watch(['./src/scripts/**/*.js', './src/scripts/views/*.html'], function () {
        gulp.start('packjs')
    })
})

gulp.task('clear', function () {
    // del.sync([dist + '/**', '!' + dist, '!' + dist + '/uploads'], {force: true});
    del.sync([dist + '/**'], {
        force: true
    });
})

if (option.env !== 'production') {
    gulp.task('default', ['copyhtml', 'copymock', 'copystatic', 'copylibs', 'sass', 'packjs', 'webserver', 'watch'], function () {
        console.log('done.')
    })
} else {
    // gulp.task('default', ['clear', 'copystatic', 'copylibs', 'sass', 'packjs'], function () {
    //   // gulp.start('copyhtml')
    //   console.log('done.')
    // })
    gulp.task('default', function (cb) {
        gulpSequence('clear', ['copystatic', 'copylibs', 'sass', 'packjs'], 'copyhtml')(cb)
    })
}