/**
 * Created by Alexander on 1/31/2015.
 */

module.exports = function (grunt) {
    // load plugins
    [
        'grunt-contrib-concat'
    ].forEach(function (task) {
            grunt.loadNpmTasks(task);
        });
    // configure plugins
    grunt.initConfig({
        concat: {
            options: {
                //separator: ''
            },
            dist: {
                src: ['src/sa.grid.mdl.js', 'src/sa.grid.js', 'src/sa.ajax.grid.js'],
                dest: 'dist/sa.grid.js'
            }
        }
    });
// register tasks
    grunt.registerTask('default', ['concat']);
};