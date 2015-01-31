sa.grid
=======

SlickGrid directives for AngularJS

### Example 1 - Simple Grid ###

```html
<div sa-grid
    sa-grid-columns="columns"
    sa-id-property="idProperty"
    sa-grid-options="options"
    sa-data-source="rows"></div>
```

### Example 2 - Grid with Ajax data loading ###

```html
<div sa-ajax-grid
    sa-grid-url="url"
    sa-grid-convert="convert"
    sa-grid-columns="columns"
    sa-grid-search="search"
    sa-grid-options="options"></div>
```