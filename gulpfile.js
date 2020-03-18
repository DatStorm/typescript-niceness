var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
// var browserSync = require('browser-sync').create();

gulp.task('gulp_nodemon', function() {
	nodemon({
		script: './src/server.ts', //this is where my express server is
		ext: 'ts', //nodemon watches *.js, *.html and *.css files
		env: { NODE_ENV: 'development' }
    });
    // gulp.watch([ './**/*.js', './**/*.html', './**/*.css' ]).on('change', nodemon.reload);
    
});

gulp.task('sync', function() {
	// browserSync.init({
	// 	port: 3002, //this can be any port, it will show our app
	// 	proxy: 'http://localhost:3001/', //this is the port where express server works
	// 	ui: { port: 3003 }, //UI, can be any port
	// 	reloadDelay: 1000 //Important, otherwise syncing will not work
	// });
	// gulp.watch([ './**/*.js', './**/*.html', './**/*.css' ]).on('change', browserSync.reload);
});

gulp.task('default', [ 'gulp_nodemon' ]); // , 'sync'
