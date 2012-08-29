
/**
 * Initialize a new `Select`
 * with an optional `label`.
 *
 * @param {String} label
 * @api public
 */

function Select(namespace, label) {
  ui.Emitter.call(this);

  this.btn = new namespace.SplitButton(label);
  this.btn.el.find('.ui-text').text(label);
  this.el = this.btn.el
    .addClass('ui-select');
  this.menu = new namespace.menu();
  this.menu.el.appendTo('body');
  this.onChange = function(){};

  // Carry over functions
  this.remove = this.menu.remove;
  this.has = this.menu.has;

  // On click
  this.el.click(function(e) {
    var p = this.el.offset();
    this.menu.moveTo(p.left, p.top + this.el.outerHeight()).show();
    this.menu.el.css('width', this.el.outerWidth() + 'px');
    return false;
  }.bind(this));

  this.show();
}

/**
 * Expose `Select`.
 */

exports.Select = Select;

/**
 * Inherit from `Emitter.prototype`.
 */

Select.prototype = new ui.Emitter();

/**
 * Add a menu item(s)
 * @return {Select}
 * @api public
 */
Select.prototype.add = function(o) {

    // Handler for determing if a value actually changed
    var itemClick = function(item) {
        return function() {
          var label = this.el.find('.ui-text');
          if (label.text() !== item) {
              if (typeof this.onChange === 'function') {
                  this.onChange(item);
                  label.text(item);
              }
          }
        }.bind(this);
    }.bind(this);

    // Add by array or single item
    if (Array.isArray(o)) {
        o.forEach(function(item){
            this.menu.add(item, itemClick(item));
        }.bind(this));
    } else {
        this.menu.add(o, itemClick(item));
    }
    return this;
};


/**
 * Show the drop-down contents.
 *
 * @return {Select}
 * @api public
 */

Select.prototype.show = function(){
  this.state = 'visible';
  this.emit('show');
  this.el.addClass('ui-show');
  return this;
};

/**
 * Hide the drop-down contents.
 *
 * @return {Select}
 * @api public
 */

Select.prototype.hide = function(){
  this.state = 'hidden';
  this.emit('hide');
  this.el.removeClass('ui-show');
  return this;
};

/**
 * Assign a callback for when things change
 *
 * @return {Select}
 * @api public
 */

Select.prototype.change = function(cb){
  this.onChange = cb;
  return this;
};