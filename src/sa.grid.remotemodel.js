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