angular.module('sa.grid').directive('saGrid', ['$log', '$window',
    function ($log, $window) {

        var prepareColumns = function (columns) {
            angular.forEach(columns, function (col) {
                //column id is needed for sorting
                if (!col.id) {
                    col.id = col.field;
                }
                return col;
            });
            return columns;
        };

        return {
            restrict: 'AE',
            scope: {
                idProperty: '=saIdProperty',
                dataSource: '=saDataSource',
                columns: '=saGridColumns',
                options: '=saGridOptions'
            },
            link: function (scope, element) {

                var attrs = {};

                $.each($(element)[0].attributes, function (idx, attr) {
                    attrs[attr.nodeName] = attr.value;
                });

                $(element).replaceWith(function () {
                    return $(element = $('<div/>', attrs).append($(this).contents()).addClass('grid')[0]);
                });

                var dataView = new Slick.Data.DataView();
                var grid = new Slick.Grid(element, dataView, prepareColumns(scope.columns), scope.options);

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
                    grid.setColumns(prepareColumns(value));
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