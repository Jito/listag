(function($) {

  $.widget('jito.listag', {

    options: {
      source                : null,       // Maps to JQuery Autocomplete UI source option.
      limit                 : 0,          // Max number of tags.
      customValue           : false,      // If true, a custom value input field is activated and custom values are shown in tags.
      initialTags           : [],         // Array of tags. You can use public 'tag' method to format.

      renderHTMLTag         : false,      // (false | hidden | select) Renders hidden inputs in tags or select element for form compatibility.

      HTMLTagName           : 'tags',     // Name property for the rendered HTML tag.
      customValueName       : 'custom',   // Same as above, for the custom value HTML tag.

      fullList              : false,      // If true, it takes 'source' value. If string, expects a URL that returns the full JSON tags array.
      showAddButton         : false,      // Show an 'add tag' button.

      delay                 : 250,        // Typing delay for the search input.
      placeholder           : 'Search...',// Placeholder for the search input.
      customValuePlaceholder: null,       // Placeholder for the custom value input.
      highlightColor        : '#f33',     // Existing tags highlighting color. If false, no highlighting is called.

      addButtonHTML         : 'Add tag',
      fullListButtonHTML    : 'Show full list',


      // Callbacks
      beforeAddTag          : null,       // function(event, tag). Returning 'false' will cancel the addition of the current tag.
      onTagAdded            : null,       // Called when tag has been already added.
      onTagUpdated          : null,       // Called after the tag is updated.
      onTagDeleted          : null,       // Called when a tag has been deleted.
      onLimitReached        : null        // Called after a tag is added, if the limit is reached.
    },

    _create: function(){
      // Cacheing
      var self = this,
          opts = self.options;
    
      // Create empty tags array
      this.tagsArray= [];

      // Add any existing list elements to the initial tags array
      this.element.children('li').each(function () {
          var li = $(this),
              tag = self.tag( li.text(), li.data('value'), li.data('custom-value') );

          opts.initialTags.push(tag);
          li.remove();
      });

      
      // Create input container
      this._listagNewLi = $('<li></li>').addClass('listag-new');
      
      // Create input element
      this.input = $('<input type="text">')
      .addClass('listag-input')
      .appendTo(this._listagNewLi);
      if (opts.placeholder) {
        this.input.attr('placeholder', opts.placeholder);
      }

      /*
      Check for the 'source' option and JQuery UI Autocomplete plugin and initialize it if both are present.
      For further information and customization, read the official docs at http://jqueryui.com/demos/autocomplete
      */
      this.input.autocomplete({
        source: opts.source,
        delay: opts.delay,
        focus: function(event, ui){
          $(this).val(ui.item.label);
          return false;
        },
        select: function(event, ui){
          self.tempTag = self.tag(ui.item.label, ui.item.value);
          
          if (opts.customValue) {
            self.customValueInput.val(ui.item.customValue).select();
          }else{
            self.addTag(self.tempTag);
            self.clear();
          };
          return false;
        }
      })
      .keydown(function(e){
        if (e.keyCode == 13 || e.keyCode == 9){
          // Prevent form submit
          e.preventDefault();
        }
      });

      // Create custom value input
      if (opts.customValue) {
        this.customValueInput = $('<input type="text">')
          .addClass('listag-customvalueinput')
          .keydown(function(e){
            if (e.keyCode == 13){
              e.preventDefault();

              if (self.tempTag) {
                self.tempTag.customValue = $(this).val();
                self.clear();
                self.input.focus();
                self.addTag(self.tempTag);
              };
            }
          })
          .appendTo(this._listagNewLi);
        
        if(opts.customValuePlaceholder){
          this.customValueInput.attr('placeholder', opts.customValuePlaceholder);
        }
      }

      // Create 'full list' button only if fancybox plugin is loaded
      if (opts.fullList && $.fancybox) {
        $('<a class="listag-full-btn"></a>')
        .html(opts.fullListButtonHTML)
        .click(function(){
          self.showFullList();
        })
        .appendTo(this._listagNewLi);
      }

      // Create 'add' button
      if (opts.showAddButton) {
        $('<a class="listag-add-btn"></a>')
        .html(opts.addButtonHTML)
        .click(function(){
          if (self.tempTag) {
            self.tempTag.customValue = self.customValueInput.val();
            self.addTag(self.tempTag);
          };
        })
        .appendTo(this._listagNewLi);
      };

      // Create select
      if (opts.renderHTMLTag == 'select') {
        this.select = $('<select class="listag-select" name="' + opts.selectInputName + '" multiple="multiple"></select>');
        this.element.after(this.select);
      }

      // Append input container and add classes to the list element
      this.element
        .addClass('listag')
        .append(this._listagNewLi);

      // Add initial tags
      if (opts.initialTags.length > 0) {
        $(opts.initialTags).each(function (i, tag) {
          self.addTag(tag);
        });
      }
    },

    highlightTag: function(tag){
      var hlcolor = this.options.highlightColor;

      if (!hlcolor) { return false };
      
      if ($.effects) {
        $('.inner', tag.element).effect('highlight', {color: hlcolor}, 1000);
      }
    },

    // Checks if the passed value matches any existing tag's value 
    exists: function(value) {
      if (this.tagsArray.length == 0) { return false };
      
      for (var ind in this.tagsArray) {
        if (this.tagsArray[ind].value == value) {
          return this.tagsArray[ind];
        }
      }
      
      return false;
    },

    _limitReached: function(){
      var limitR = false;
      if (this.options.limit > 0 && 
          this.tagsArray.length > 0 &&
          this.options.limit >= this.tagsArray.length){
        limitR = true;
      }
      return limitR;
    },

    _checkLimit: function(){
      if (this._limitReached()){ 
        this._trigger('onLimitReached');
        this.disable();
      }else{
        this.enable();
      }
    },

    disable: function(){
      this.input.autocomplete('disable');
      this._listagNewLi.hide();
    },

    enable: function(){
      this.input.autocomplete('enable');
      this._listagNewLi.show();
    },

    // Tag object generator
    tag: function(label, value, customValue){
      var self = this;
      return {
        label: label,
        value: (value === undefined ? label : value),
        customValue: (customValue === undefined ? '' : customValue),
        index: self.tagsArray.length
      };
    },

    clear: function(){
      this.input.val('');
      if (this.customValueInput) this.customValueInput.val('');
      this.tempTag = undefined;
    },

    addTag: function(tag) {
      // Callbacks and checks
      if(!this._trigger('beforeAddTag', null, tag)) {
        return false;
      }

      if (this._limitReached()) {
        return false;
      }

      var tagExists = this.exists(tag.value);
      if (tagExists) {
          this.highlightTag(tagExists);
          return false;
      }

      self = this;

      // Generate tag element and childs
      tag.element = $('<li class="listag-tag"><div class="inner"></div></li>');

      var inner = $('.inner', tag.element);

      // Label
      $('<span class="listag-label">' + tag.label + '</span>').appendTo(inner);

      // Custom value span
      if (this.options.customValue) {
        $('<span class="listag-customvalue"><span>' + tag.customValue + '</span></span>').appendTo(inner);
      };

      // Generate hidden inputs
      if (this.options.renderHTMLTag == 'hidden') {
        var _hiddenInputName = (this.options.limit == 1 ? this.options.HTMLTagName : this.options.HTMLTagName + '[]');

        $('<input type="hidden" style="display:none;" value="' + tag.value + '" name="' + _hiddenInputName + '" />').appendTo(inner);

        if (this.options.customValue) {
          var _customInputName = (this.options.limit == 1 ? this.options.customValueName : this.options.customValueName + '[]');

          $('<input type="hidden" style="display:none;" value="' + tag.customValue + '" name="' + _customInputName + '" />').appendTo(inner);
        }
      };


      // Actions span
      var _actions = $('<span class="listag-actions"></span>').appendTo(inner);
      
      if (this.options.customValue){
          $('<a class="listag-edit" title="Edit custom value">E</a>')
          .click(function(e){
            self.editCustomValue(tag);
          })
          .appendTo(_actions);
      }
      
      $('<a class="listag-remove" title="Remove tag">X</a>').click(function(e){
        self.removeTag(tag);
      }).appendTo(_actions);

      // Instert tag into tags array and DOM
      tag.element.insertBefore(this.input.parent());
      this.tagsArray.push(tag);

      // If select exists, append tag to it
      if (this.select) {
        this.select.append('<option selected="selected" value="' + tag.value + '" ' 
          + (tag.customValue ? 'customValue="' + tag.customValue + '"' : '') 
          + '>' + tag.label + '</option>');

        this.select.change();
      }

      // Clean inputs and temporal stored tag; check limit, make callbacks
      this.clear();
      this._checkLimit();
      this._trigger('onTagAdded', null, tag);

      return true;
    },

    removeTag: function(tag){
      tag.element.remove();
      
      if (this.select) {
        $('option:eq(' + tag.index + ')', this.select).remove();
        this.select.change();
      };
      
      this.tagsArray.splice(tag.index, 1);

      // Maintain the indexes
      for (var ind in this.tagsArray) {
        this.tagsArray[ind].index = ind;
      }

      // Check limit and trigger custom callback
      this._checkLimit();
      this._trigger('onTagDeleted');
    },

    updateCustomValue: function(tag, value) {
      var self = this;

      tag.customValue = value;
      
      tag.element
        .find('.listag-customvalue').html('<span>' + value + '</span>').end()
        .find('input:hidden[name="' + self.options.customValueName + '"]').val(value);

      if (this.select) {
        $('option:eq(' + tag.index + ')', this.select).attr('customValue', value);
        this.select.change();
      }

      this._trigger('onTagUpdated', null, tag);
    },

    showFullList: function(){
      if ( !this.options.fullList || !$.fancybox ) { return false; }

      var self = this,
          url = (typeof this.options.fullList == 'string' ? this.options.fullList : this.options.source ),
          list = $('<ul></ul>').on('click', 'li', function(e){
            var li = $(this);

            if ( self.addTag( self.tag(li.text(), li.data('value'), li.data('custom-value')) ) ) {
              li.slideUp('slow').remove();
            }
          });
      
      $.fancybox.showLoading();

      $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
          for (var tag in data) {
            list.append('<li '
              + ( tag.value ? 'data-value="' + tag.value + '" ' : '' )
              + ( tag.customValue ? 'data-custom-value="' + tag.customValue + '" ' : '' )
              +'>' + tag.label + '</li>');
          }
        },
        error: function(){
          $.fancybox.hideLoading();
        }
      });

      $.fancybox({
        title   : 'Full list',
        content : list,
        type    : 'inline',
        wrapCSS : 'listag-fancybox'
      });
    },

    editCustomValue: function(tag){
      var self = this,
          currentVal = $('.listag-customvalue span', tag.element).text(),
          saveNewValueAndExit = function(newValue){
            tag.element.removeClass('editing');
            self.updateCustomValue(tag, newValue);
          };

      tag.element.addClass('editing');

      $('.listag-customvalue', tag.element)
      .html(
        $('<input type="text" class="listag-edit-input">')
        .val(currentVal)
        .blur(function(){
          saveNewValueAndExit($(this).val());
        })
        .keydown(function(e){
          if (e.keyCode == 13) {
            saveNewValueAndExit($(this).val());
          }
        })
      )
      .children('input').select();

    },

    tags: function() {
      return this.tagsArray;
    }

  })

})(jQuery);
