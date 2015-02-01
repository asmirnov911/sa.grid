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