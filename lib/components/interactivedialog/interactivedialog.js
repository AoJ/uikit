
/**
 * Expose `InteractiveDialog`.
 */

exports.InteractiveDialog = InteractiveDialog;

/**
 * Return a new `InteractiveDialog` dialog with the given
 * `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.InteractiveDialog = function(title, msg){
  switch (arguments.length) {
    case 2:
      return new InteractiveDialog({ title: title, message: msg });
    case 1:
      return new InteractiveDialog({ message: title });
  }
};

/**
 * Initialize a new `InteractiveDialog` dialog.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * Emits:
 *
 *    - `cancel` the user pressed cancel or closed the dialog
 *    - `ok` the user clicked ok
 *    - `show` when visible
 *    - `hide` when hidden
 *
 * @param {Object} options
 * @api public
 */

function InteractiveDialog(options) {
  ui.Dialog.call(this, options);
}

/**
 * Inherit from `Dialog.prototype`.
 */

InteractiveDialog.prototype = new ui.Dialog();

/**
 * Change "cancel" button `selector`.
 *
 * @param {String} selector
 * @return {InteractiveDialog}
 * @api public
 */

InteractiveDialog.prototype.cancel = function(selector){
  var cancel = this.el.find('.cancel').replaceWith(selector);
  cancel.removeClass('hide');
  return this;
};

/**
 * Change "ok" button `selector`.
 *
 * @param {String} selector
 * @return {InteractiveDialog}
 * @api public
 */

InteractiveDialog.prototype.ok = function(selector){
  var ok = this.el.find('.ok').replaceWith(selector);
  ok.removeClass('hide');
  return this;
};

/**
 * Show the confirmation dialog and invoke `fn(ok)`.
 *
 * @param {Function} fn
 * @return {InteractiveDialog} for chaining
 * @api public
 */

InteractiveDialog.prototype.show = function(fn){
  ui.Dialog.prototype.show.call(this);
  this.el.find('.ok').focus();
  this.callback = fn || function(){};
  return this;
};

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

InteractiveDialog.prototype.render = function(options){
  ui.Dialog.prototype.render.call(this, options);
  var self = this
    , actions = $(html);

  this.el.addClass('interactive');
  this.el.append(actions);

  this.on('close', function(){
    self.emit('cancel');
    self.callback(false);
  });

  actions.find('.cancel').click(function(e){
    e.preventDefault();
    self.emit('cancel');
    self.callback(false);
    self.hide();
  });

  var ok = function() {
    self.emit('ok');
    self.callback(true);
    self.hide();
  }.bind(this);

  actions.find('.ok').click(function(e){
    e.preventDefault();
    ok();
  });

  // "Ok" on enter
  this.el.on('keydown', function (e) {
    if(e.which === 13 || e.keyCode === 13){
      ok();
      e.preventDefault();
    }
  }.bind(this));
};
