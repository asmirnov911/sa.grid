angular.module('sa.grid', []);
angular.module('sa.grid').factory('saGridUtils',
    function () {
        return {
            prepareColumns: function (columns) {
                angular.forEach(columns, function (col) {
                    //column id is needed for sorting
                    if (!col.id) {
                        col.id = col.field;
                    }
                    return col;
                });
                return columns;
            },
            replaceElement: function (element) {
                var attrs = {};

                $.each($(element)[0].attributes, function (idx, attr) {
                    attrs[attr.nodeName] = attr.value;
                });

                $(element).replaceWith(function () {
                    return $(element = $('<div/>', attrs).append($(this).contents()).addClass('grid')[0]);
                });

                return element;
            }
        };
    });
angular.module('sa.grid').factory('saGridRemoteModel', ['$timeout', '$http', '$q',
    function ($timeout, $http, $q) {
        var RemoteModel = function (url, convert) {

            // private
            var PAGESIZE = 50,
                scrollingDelay = 100;

            var data = {
                length: 0,
                getLength: function () {
                    return this.length;
                },
                getItem: function (index) {
                    return this[index];
                }
            };

            var searchstr,
                sortcol = null,
                sortdir = 1,
                h_request = null,
                canceler,

                onDataLoading = new Slick.Event(),
                onDataLoaded = new Slick.Event();

            function init() {
            }

            function isDataLoaded(from, to) {
                for (var i = from; i <= to; i++) {
                    if (data[i] == undefined || data[i] == null) {
                        return false;
                    }
                }

                return true;
            }

            function clear() {
                for (var key in data) {
                    delete data[key];
                }
                data.length = 0;
            }

            function ensureData(from, to) {
                if (canceler) {
                    canceler.resolve();
                    for (var i = canceler.fromPage; i <= canceler.toPage; i++) {
                        data[i * PAGESIZE] = undefined;
                    }
                }

                if (from < 0) {
                    from = 0;
                }

                if (data.length > 0) {
                    to = Math.min(to, data.length - 1);
                }

                var fromPage = Math.floor(from / PAGESIZE);
                var toPage = Math.floor(to / PAGESIZE);

                while (data[fromPage * PAGESIZE] !== undefined && fromPage < toPage)
                    fromPage++;

                while (data[toPage * PAGESIZE] !== undefined && fromPage < toPage)
                    toPage--;

                if (fromPage > toPage || ((fromPage == toPage) && data[fromPage * PAGESIZE] !== undefined)) {
                    // TODO:  look-ahead
                    onDataLoaded.notify({from: from, to: to});
                    return;
                }

                if (h_request != null) {
                    $timeout.cancel(h_request);
                }

                h_request = $timeout(function () {
                    for (var i = fromPage; i <= toPage; i++)
                        data[i * PAGESIZE] = null; // null indicates a 'requested but not available yet'

                    onDataLoading.notify({from: from, to: to});

                    canceler = $q.defer();

                    var params = {
                        query: searchstr,
                        skip: fromPage * PAGESIZE,
                        take: ((toPage - fromPage) * PAGESIZE) + PAGESIZE,
                        sortBy: sortcol ? sortcol + ((sortdir > 0) ? "+asc" : "+desc") : null
                    }

                    $http.get(url, {
                        timeout: canceler,
                        params: params
                    }).then(function (response) {
                        var from = response.config.params.skip,
                            to = from + response.data.data.length;

                        data.length = response.data.length;

                        for (var i = 0; i < response.data.data.length; i++) {
                            var item = response.data.data[i];

                            data[from + i] = convert && typeof convert == 'function' ? convert(item) : item;
                        }

                        canceler = null;

                        onDataLoaded.notify({from: from, to: to});
                    }, function (err) {
                        $log.error(err);
                        alert("error loading pages " + fromPage + " to " + toPage);
                    });

                    canceler.fromPage = fromPage;
                    canceler.toPage = toPage;

                    h_request = null;
                }, scrollingDelay);
            }

            function reloadData(from, to) {
                for (var i = from; i <= to; i++)
                    delete data[i];

                ensureData(from, to);
            }

            function setSort(column, dir) {
                sortcol = column;
                sortdir = dir;
                clear();
            }

            function setSearch(str) {
                searchstr = str;
                clear();
            }

            init();

            return {
                // properties
                data: data,

                // methods
                clear: clear,
                isDataLoaded: isDataLoaded,
                ensureData: ensureData,
                reloadData: reloadData,
                setSort: setSort,
                setSearch: setSearch,

                // events
                onDataLoading: onDataLoading,
                onDataLoaded: onDataLoaded
            };
        };

        return RemoteModel;
    }]);
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
