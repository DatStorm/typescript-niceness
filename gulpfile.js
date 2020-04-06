var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();


// IN DEPTH VIDEO HERE:
// https://www.youtube.com/watch?v=-lG0kDeuSJk
// https://github.com/thecodercoder/frontend-boilerplate



gulp.task('gulp_nodemon', function(done) {
	nodemon({
		script: './src/server.ts', 	// this is where my express server is
		ext: 'ts', 					// nodemon watches *.ts files
		env: { NODE_ENV: 'development' },
		ignore: [
			'./bower_components/**',
			'./node_modules/**',
			'./build/**'
		]
	});
	done();
});

gulp.task('sync', function(done) {
	browserSync.init({
		port: 3002, //this can be any port, it will show our app
		proxy: 'http://localhost:3000/', //this is the port where express server works
		ui: { port: 3003 }, //UI, can be any port
		reloadDelay: 1000 //Important, otherwise syncing will not work
	});
	// './**/*.html', './**/*.css'
	gulp.watch([ './**/*.ts',  ]).on('change', browserSync.reload);
	done();
});



gulp.task('default', gulp.parallel('gulp_nodemon', 'sync')); // , 'sync'
// gulp.task('default', gulp.series('message', 'message2')); // , 'sync'
