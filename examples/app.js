/**
 * Created by Alexander on 11/22/2014.
 */

define(['angular', 'sa.grid'],
    function (angular) {
        return angular.module('app', ['sa.grid'])
            .controller('AppCtrl', ['$scope', '$log',
                function ($scope, $log) {
                    $scope.options = {
                        enableColumnReorder: true
                    };

                    $scope.idProperty = 'field_1';

                    $scope.columns = [
                        {
                            name: 'Field 1',
                            field: 'field_1',
                            sortable: true
                        },
                        {
                            name: 'Field 2',
                            field: 'field_2',
                            sortable: true
                        }
                    ];

                    var i = 1, data = [];

                    while (i <= 100) {
                        data.push({
                            field_1: i,
                            field_2: "record " + i
                        });
                        i++;
                    }

                    $scope.rows = data;

                    var lastCol = $scope.columns[1];
                    $scope.showHideLastColumn = function () {
                        if ($scope.columns.length > 1) {
                            $scope.columns.splice(1, 1)
                        } else {
                            $scope.columns.push(lastCol);
                        }
                    };
                }]);
    });