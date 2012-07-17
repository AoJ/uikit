
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

exports.interactiveDialog = function(title, msg){
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
  var cancel = this.el.find('.cancel');
  if (cancel.length > 0) { cancel.replaceWith(selector); }
  else { cancel = this.el.find(selector); }
  cancel.addClass('cancel').removeClass('hide');
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
  var ok = this.el.find('.ok');
  if (ok.length > 0) { ok.replaceWith(selector); }
  else { ok = this.el.find(selector); }
  ok.addClass('ok').removeClass('hide');
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

  // Move actions to outer parent if present
  this.el.find('.actions').appendTo(this.el);

  // Cancel/close
  var close = function() {
    self.callback(false);
    self.hide();
  };

  this.on('close', close);
  this.el.on('click', '.cancel', function(e){
    e.preventDefault();
    self.emit('close');
    close();
  });

  // OK
  var ok = function() {
    self.emit('ok');
    self.emit('close');
    self.callback(true);
    self.hide();
  }.bind(this);

  this.el.on('click', '.ok', function(e){
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

  // Focus on first input element
  setTimeout(function(){
      this.el.find('input:first').focus();
  }.bind(this));
};
