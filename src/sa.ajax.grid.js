angular.module('sa.grid').directive('saAjaxGrid', ['$http', '$q', '$log', '$timeout', '$window', 'saGridUtils', 'saGridRemoteModel',
    function ($http, $q, $log, $timeout, $window, gridUtils, RemoteModel) {

        var debounceInt = 500;

        return {
            restrict: 'A',
            scope: {
                url: '=saGridUrl',
                convert: '=saGridConvert',
                search: '=saGridSearch',
                columns: '=saGridColumns',
                options: '=saGridOptions'
            },
            link: function (scope, element) {

                element = gridUtils.replaceElement(element);

                var loader = new RemoteModel(scope.url, scope.convert);

                var loadingIndicator = null;

                var grid = new Slick.Grid(element, loader.data, gridUtils.prepareColumns(scope.columns), scope.options);

                grid.onViewportChanged.subscribe(function () {
                    var vp = grid.getViewport();
                    loader.ensureData(vp.top, vp.bottom);
                });

                grid.onSort.subscribe(function (e, args) {
                    loader.setSort(args.sortCol.field, args.sortAsc ? 1 : -1);
                    var vp = grid.getViewport();
                    loader.ensureData(vp.top, vp.bottom);
                });

                loader.onDataLoading.subscribe(function () {
                    if (!loadingIndicator) {
                        loadingIndicator = $("<span class='loading-indicator'><label>Buffering...</label></span>").appendTo(document.body);
                        var $g = $(element);

                        loadingIndicator
                            .css('position', 'absolute')
                            //TODO fix position
                            .css('top', $g.offset().top + $g.height() / 2 - loadingIndicator.height() / 2)
                            .css('left', $g.offset().left + $g.width() / 2 - loadingIndicator.width() / 2);
                    }
                    loadingIndicator.show();
                });

                loader.onDataLoaded.subscribe(function (e, args) {
                    for (var i = args.from; i <= args.to; i++) {
                        grid.invalidateRow(i);
                    }
                    grid.updateRowCount();
                    grid.render();
                    loadingIndicator.fadeOut();
                });

                scope.$watch('columns', function (value) {
                    grid.setColumns(gridUtils.prepareColumns(value));
                }, true);

                var initializing = true;

                scope.$watch('search', _.debounce(function (search) {
                    if (initializing) {
                        $timeout(function () {
                            initializing = false;
                        });
                    } else {
                        // This code will be invoked after 0.5 second from the last time 'search' has changed.
                        scope.$apply(function () {
                            loader.setSearch(search);
                            var vp = grid.getViewport();
                            loader.ensureData(vp.top, vp.bottom);
                        });
                    }
                }, debounceInt));

                var onResize = function () {
                    grid.resizeCanvas();
                    grid.onViewportChanged.notify();
                };

                $($window).resize('resize', onResize);

                scope.$on('$destroy', function () {
                    $($window).off('resize', onResize);
                });

                // load the first page
                grid.onViewportChanged.notify();
            }
        };
    }]);
