/**
 * Created by Alexander S. on 11/8/2014.
 */

'use strict';

require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        angular: '../bower_components/angular/angular',
        underscore: '../bower_components/underscore/underscore',
        'jquery.event.drag': '../bower_components/jquery.event.drag-drop/event.drag/jquery.event.drag',
        'jquery.ui': '../bower_components/jquery-ui/jquery-ui',
        slickcore: '../bower_components/slickgrid/slick.core',
        slickgrid: '../bower_components/slickgrid/slick.grid',
        slickdataview: '../bower_components/slickgrid/slick.dataview',
        'sa.grid': '../dist/sa.grid'
    },
    shim: {
        'jquery': {exports: '$'},
        'angular': {exports: 'angular'},
        'jquery.event.drag': {deps: ['jquery']},
        'jquery.ui': {deps: ['jquery']},
        'slickcore': {deps: ['jquery']},
        'slickgrid': {deps: ['slickcore', 'jquery.event.drag', 'jquery.ui']},
        'slickdataview': {deps: ['slickgrid']},
        'sa.grid': {deps: ['angular', 'jquery', 'underscore', 'slickcore', 'slickgrid', 'slickdataview']}
    },
    priority: [
        'angular'
    ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = 'NG_DEFER_BOOTSTRAP!';

require([
    'angular',
    'app'
], function (angular, app) {
    var $html = angular.element(document.getElementsByTagName('html')[0]);

    angular.element().ready(function () {
        angular.resumeBootstrap([app['name']]);
    });
});