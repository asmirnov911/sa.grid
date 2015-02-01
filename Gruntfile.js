/**
 * Created by Alexander on 1/31/2015.
 */

module.exports = function (grunt) {
    // load plugins
    [
        'grunt-contrib-concat',
        'grunt-contrib-watch'
    ].forEach(function (task) {
            grunt.loadNpmTasks(task);
        });
    // configure plugins
    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'src/sa.grid.mdl.js',
                    'src/sa.grid.utils.js',
                    'src/sa.grid.remotemodel.js',
                    'src/sa.grid.js',
                    'src/sa.ajax.grid.js'
                ],
                dest: 'dist/sa.grid.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/**/*.js',
                tasks: ['concat'],
                options: {
                    debounceDelay: 250
                }
            }
        }
    });
    // register tasks
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['concat']);
};