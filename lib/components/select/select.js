/**
 * Expose `Select`.
 */

exports.Select = Select;

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
  this.el = this.btn.el;
  this.menu = new namespace.menu();
  this.onChange = function(){};

  // Carry over functions
  this.remove = this.menu.remove;
  this.has = this.menu.has;

  // On click
  this.el.click(function() {
    var p = this.el.offset();
    this.menu.moveTo(p.left, p.top + this.el.outerHeight()).show();
    this.menu.el.css('width', this.el.outerWidth() + 'px');
  }.bind(this));

  this.show();
}

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
    var itemClick = function(e) {
        var label = this.el.find('.ui-text');
        if (label.text() !== e.name) {
            if (typeof this.onChange === 'function') {
                this.onChange(e);
            }
        }
    }.bind(this);

    // Add by array or single item
    if (Array.isArray(o)) {
        o.forEach(function(item){
            this.menu.add(item, itemClick);
        }.bind(this));
    } else {
        this.menu.add(o, itemClick);
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