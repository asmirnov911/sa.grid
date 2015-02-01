angular.module('sa.grid').directive('saGrid', ['$log', '$window', 'saGridUtils',
    function ($log, $window, gridUtils) {

        return {
            restrict: 'AE',
            scope: {
                idProperty: '=saIdProperty',
                dataSource: '=saDataSource',
                columns: '=saGridColumns',
                options: '=saGridOptions'
            },
            link: function (scope, element) {

                element = gridUtils.replaceElement(element);

                var dataView = new Slick.Data.DataView();
                var grid = new Slick.Grid(element, dataView, gridUtils.prepareColumns(scope.columns), scope.options);

                grid.onSort.subscribe(function (e, args) {

                    var comparator = function (a, b) {
                        return (a[args.sortCol.field] > b[args.sortCol.field]) ? 1 : -1;
                    };

                    dataView.sort(comparator, args.sortAsc);
                });

                dataView.onRowsChanged.subscribe(function (e, args) {
                    grid.invalidateRows(args.rows);
                    grid.render();
                });

                var refresh = function () {
                    dataView.beginUpdate();
                    dataView.setItems(scope.dataSource || [], scope.idProperty);
                    dataView.endUpdate();
                    grid.invalidate();
                    grid.render();
                };

                scope.$watch('columns', function (value) {
                    grid.setColumns(gridUtils.prepareColumns(value));
                }, true);

                scope.$watch('idProperty', function () {
                    refresh();
                });

                scope.$watchCollection('dataSource', function () {
                    refresh();
                });

                var onResize = function () {
                    grid.resizeCanvas();
                };

                $($window).resize('resize', onResize);

                scope.$on('$destroy', function () {
                    $($window).off('resize', onResize);
                });
            }
        };
    }]);