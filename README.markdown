Listag
======

Listag is a JQuery UI widget, fully integrated with [JQuery UI Autocomplete](http://jqueryui.com/demos/autocomplete/), that will turn any list element into a tag list, with a searching input and, optionally, a custom value input.

It's aimed to those scenarios where you have a big or huge list of predefined possible tags, such as products from a catalog or custom fields for a settings configuration. You can also include a custom, editable value for each tag added for further personalization.

Features
--------

- Simple basic usage.
- Fully integrated with JQuery UI Autocomplete widget.
- Form friendliness! Toggle usage of hidden inputs with custom name attributes.
- Possibility of adding a custom value to each tag for further customization.
- Visual cues like placeholders, highlighting existing tags, and buttons to add a tag and show full list of tags.
- Integration with Fancybox 2 plugin for showing all the posible tags in a modal window.
- Convenient callbacks.
- Ability to provide *initial tags* on creation via list items or options.

#### TODO:

- JQuery UI styling conventions to enable ThemeRoller support.
- Extend the `fullList` option to accept local arrays and callbacks.


Installation
-----------

1. Include the files in your `head`:

		<link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.21.custom.css">
		<script src="js/jquery-1.7.2.min.js"></script>
		<script src="js/jquery-ui-1.8.21.custom.min.js"></script>
		<script src="js/jquery.listag.js"></script>

2. Call it!
	
		$('ul').listag({
			source: 'source.json'
		});


Usage
-----

### Full options list

Option 	                 | Default            | Description
:------------------------|:-------------------|:-------------------------------------
`source`                 | `null`             | Maps to JQuery Autocomplete UI source option.
`limit`                  | `0`                | Max number of tags.
`customValue`            | `false`            | If `true`, a custom value input field is activated and custom values are shown in tags.
`initialTags`            | `[]`               | Initial array of tags. You can use public `tag` method to format.
`renderHTMLTag`          | `false`            | (`false` | `hidden` | `select`) Renders hidden inputs within tags or a select element for form compatibility.
`HTMLTagName`            | `'tags'`           | Name property for the rendered HTML tag.
`customValueName`        | `'custom'`         | Same as above, for the custom value HTML tag.
`fullList`               | `false`            | If `true`, it takes `source` value. If string, expects a URL that returns the full JSON tags array.
`showAddButton`          | `false`            | Show an *add tag* button.
`delay`                  | `250`              | Typing delay for the search input.
`placeholder`            | `'Search...'`      | Placeholder for the search input.
`customValuePlaceholder` | `null`             | Placeholder for the custom value input.
`highlightColor`         | `'#f33'`           | Existing tags highlighting color. If `false`, no highlighting is called.
`addButtonHTML`          | `'Add tag'`        |
`fullListButtonHTML`     | `'Show full list'` |
`beforeAddTag`           | `null`             | Called before adding a tag. Returning `false` will cancel the addition.
`onTagAdded`             | `null`             | Called when tag has been already added.
`onTagUpdated`           | `null`             | Called after the tag is updated.
`onTagDeleted`           | `null`             | Called when a tag has been deleted.
`onLimitReached`         | `null`             | Called when limit is reached.


### Basic usage

The most basic way of get Listag working is:

	$('ul').listag({
		source: 'source.json'
	});

This will create the search input and add existing `li` child elements as tags. `source` is the only option required, as it maps directly to the autocomplete plugin. It can be an array with local data, a string specifying a URL or a callback ([read the official docs](http://jqueryui.com/demos/autocomplete/)).

Existing `li` elements will be added as tags. Their text will be used as labels, and (if present) HTML5 data attributes `data-value` and `data-custom-value` (last one is only necessary if custom value option is true) will become, respectively, `value` and `customValue` properties of each tag.


### Form friendliness

In order to use Listag within regular forms and allow tags submission, you can tell the plugin to render HTML elements.

	$('ul').listag({
		source: 	   'source.json',
		renderHTMLTag: 'select',
		HTMLTagName:   'mytagarray'
	});

This will render a hidden `<select name="mytagarray">` that will store each tag as an `<option value="">` element.
Optionally, you can set `renderHTMLTag` as `hidden` and a `<input type="hidden" name="mytagarray[]" value="">` will be rendered within each tag. 

Note that `HTMLTagName` will become the name attribute in both cases. For the hidden inputs case, though, `[]` will be concatenated to it **except** if the `limit` option is setted to 1.


### Custom values

In case you need to give the user the ability to specify a custom value, you can set it as follows:

	$('ul').listag({
		source: 	            'source.json',
		
		renderHTMLTag:          'hidden',
		HTMLTagName:            'mytagarray',

		customValue:            true,
		customValueName:        'quantity',
	});

This time, a custom value input will be added next to the searching input and the tags will show that value next to the label. Also, tags will have an *edit* button which will let the user modify it.

If the `renderHTMLTag` options is set to `hidden`, an aditional `<input type="hidden" name="quantity[]" value="">` will be added to each tag. If it is set to `select`, the `<option>` elements will have an HTML5 `data-custom-value` attribute containing the custom value.


### Showing all tag possibilities *(beta)*

If the autocomplete pattern isn't user-friendly enough (e.g. you've got a big list of items which the user may not remember) you can enable a *full list* button.

**Fancybox 2 plugin required**. You can download it from [the web site](http://fancyapps.com/fancybox/) or [Github](https://github.com/fancyapps/fancyBox/). Without it, this feature **won't work**.

	$('ul').listag({
		source: 	   'source.json',
		renderHTMLTag: 'select',

		fullList:      'showalltheitems.json'
	});

Giving the `fullList` option a string, it will become the URL that must return a (full) *properly formatted* array of tags, and a *show full list* button will be added next to the search. This button will open a fancybox containing all the tags, which will be added by clicking on them.


### Tags array format

The format expected from the `source`, `fullList` and `initialTags` options is a simple JSON array encoding:

	[
		{
			label:       'Example tag',
			value:       1,
			customValue: 33
		},
		{ 
			...
		}
	]

`value` is intended to be used as *id* for each tag, e.g. when adding products and having to process them later filtering by id. `customValue`, if defined, will become the default value for that tag and will be shown in the custom tag input (if `customValue: true`) when the user selects the tag, before adding it.

You can use the public `tag` method for formatting purposes:

	var tag = $.jito.listag.tag(label, value, customValue);

	customarray.push(tag);


### Callbacks

`beforeAddTag`  
It expects a `function(event, tag)` where `event` is an empty event and `tag` is the JSON formatted tag object. Returning `false` will abort the tag addition method.

`onTagAdded`  
Same format as above, but triggered when the tag has already been added. You can access the `label`, `value` and `customValue` properties as usual, plus an `element` one, which is the DOM tag element inserted in the list.

`onTagDeleted`  
Will be fired after a tag is removed. It does not takes any arguments.

`onTagUpdated`
A `function(event, tag)`, similar to `beforeAddTag`, fired once the editable tag has been updated.

`onLimitReached`  
It is fired after the user tries to add a tag, before the addition itself, and after the `beforeAddTag` method. Useful to give the user some feedback about what happened.


### Extra options

`placeholder` and `customValuePlaceholder`  
For a better user experience, you can set placeholders on the search and custom value inputs, to give the user a hint of the expected content or behavior.

`showAddButton`  
When `true`, an *Add tag* button will be rendered next to search and custom value inputs. `Enter` keydown behavior (i.e. add a tag) is not overrided, both will do the same job.

`delay`  
Maps to the autocomplete delay option. This is the time in ms between the last key stroke and the begining of the search.

`highlightColor`  
The color used for background highlighting effect when the user tries to add a tag that already exists. If `false`, no highlight will be applied (though this is not recommended -you should always give the user some feedback).

`addButtonHTML` and `fullListButtonHTML`  
For i18n purposes.



-------------------------------------------------



![CC BY-SA 3.0](http://i.creativecommons.org/l/by-sa/3.0/88x31.png)
This widget is based on [jQuery Tagit](https://github.com/hailwood/jQuery-Tagit) by Matthew Hailwood, and licensed under a Creative Commons [Attribution-ShareAlike 3.0 Unported license](http://creativecommons.org/licenses/by-sa/3.0/).