/**
 * Expose `Overlay`.
 */

exports.Overlay = Overlay;

/**
 * Return a new `Overlay` with the given `options`.
 *
 * @param {Object} options
 * @return {Overlay}
 * @api public
 */

exports.overlay = function(options){
  return new Overlay(options);
};

/**
 * Initialize a new `Overlay`.
 *.prototype.overlay
 * @param {Object} options
 * @api public
 */

function Overlay(options) {
  ui.Emitter.call(this);
  var self = this;
  options = options || {};
  this.closable = options.closable;
  this.el = $(html);
  this.el.appendTo('body');
  if (this.closable) {
    this.el.click(function(){
      self.emit('close');
      self.hide();
    });
  }
}

/**
 * Inherit from `Emitter.prototype`.
 */

Overlay.prototype = new ui.Emitter();

/**
 * Show the overlay.
 *
 * Emits "show" event.
 *
 * @return {Overlay} for chaining
 * @api public
 */

Overlay.prototype.show = function(){
  this.emit('show');
  this.el.removeClass('ui-hide');
  // Tag all root level non-overlay items as shadowed
  $('body > *:not(#overlay):not(#dialog)').addClass('ui-shadowed');
  return this;
};

/**
 * Hide the overlay.
 *
 * Emits "hide" event.
 *
 * @return {Overlay} for chaining
 * @api public
 */

Overlay.prototype.hide = function(){
  var self = this;
  this.emit('hide');
  this.el.addClass('ui-hide');
  $('.shadowed').removeClass('ui-shadowed');
  setTimeout(function(){
    self.el.remove();
  }, 2000);
  return this;
};
