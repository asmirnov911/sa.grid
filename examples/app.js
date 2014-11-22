/**
 * Created by Alexander on 11/22/2014.
 */

define(['angular', 'sa.grid'],
    function (angular) {
        return angular.module('app', ['sa.grid'])
            .controller('AppCtrl', ['$scope', '$log',
                function ($scope, $log) {
                    $scope.test = 'test';
                }]);
    });