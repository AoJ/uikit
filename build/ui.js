var ui = {};
if (typeof module == "object" && module.exports) { module.exports = ui; }


;(function(exports, $){
/**
 * Expose `Emitter`.
 */

exports.Emitter = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter() {
  this.callbacks = {};
}

/**
 * Bind a given context to all callback functions, overriding the default "this"
 * @param  {Object} The context which will be bound on callback function
 * @return {Emitter}
 * @api public
  */

Emitter.prototype.context = function(c) {
  this.context = c;
  return this;
};

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  var addCallback = function(ev, cb){ (this.callbacks[ev] = this.callbacks[ev] || []).push(cb); }.bind(this);
  if (typeof event === 'string') {
    addCallback(event, fn);
  } else if (typeof event === 'object') {
    for (var key in event) {
      if (event.hasOwnProperty(key)) {
        addCallback(key, event[key]);
      }
    }
  }
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = function(event, fn){
  var callbacks = this.callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this.callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn);
  callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  var args = [].slice.call(arguments, 1)
    , callbacks = this.callbacks[event];

  if (callbacks) {
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      var context = this.context || this;
      if (typeof callbacks[i] === 'function') {
        callbacks[i].apply(context, args);
      }
    }
  }

  return this;
};


})(ui, jQuery);

;(function(exports, html, $){
/**
 * Active dialog.
 */

var active;

/**
 * Expose `Dialog`.
 */

exports.Dialog = Dialog;

/**
 * Return a new `Dialog` with the given
 * (optional) `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.dialog = function(title, msg){
  switch (arguments.length) {
    case 2:
      return new Dialog({ title: title, message: msg });
    case 1:
      return new Dialog({ message: title });
  }
};

/**
 * Initialize a new `Dialog`.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * Emits:
 *
 *    - `show` when visible
 *    - `hide` when hidden
 *
 * @param {Object} options
 * @api public
 */

function Dialog(options) {
  ui.Emitter.call(this);
  options = options || {};
  this.template = html;
  this.el = $(this.template);
  this.render(options);
  if (active && !active.hiding) active.hide();
  if (Dialog.effect) this.effect(Dialog.effect);
  active = this;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Dialog.prototype = new ui.Emitter();

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Dialog.prototype.render = function(options){
  var el = this.el
    , title = options.title
    , msg = options.message
    , self = this;

  el.find('.ui-close').click(function(){
    self.emit('close');
    self.hide();
    return false;
  });

  el.find('h1').html(title);
  if (!title) el.find('h1').remove();

  // message
  if ('string' == typeof msg) {
    el.find('p').html(msg);
  } else if (msg) {
    el.find('p').replaceWith(msg.el || msg);
  }

  setTimeout(function(){
    el.removeClass('ui-hide');
  }, 0);
};

/**
 * Enable the dialog close link.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.closable = function(){
  this.el.addClass('ui-closable');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.effect = function(type){
  this._effect = type;
  this.el.addClass('ui-' + type);
  return this;
};

/**
 * Make it modal!
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.modal = function(){
  this._overlay = ui.overlay();
  return this;
};

/**
 * Add an overlay.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.overlay = function(){
  var self = this;
  var overlay = ui.overlay({ closable: true });

  overlay.on('hide', function(){
    self.closedOverlay = true;
  });

  overlay.on('close', function(){
    self.emit('close');
  });

  this._overlay = overlay;
  return this;
};

/**
 * Close the dialog when the escape key is pressed.
 *
 * @api private
 */

Dialog.prototype.escapable = function(){
  var self = this;
  $(document).bind('keydown.dialog', function(e){
    if (27 != e.which) return;
    $(this).unbind('keydown.dialog');
    self.emit('escape');
    self.hide();
  });
};

/**
 * Show the dialog.
 *
 * Emits "show" event.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.show = function(){
  var overlay = this._overlay;

  if (overlay) {
    overlay.show();
    this.el.addClass('ui-modal');
  }

  // escape
  if (!overlay || overlay.closable) this.escapable();

  this.el.appendTo('body');

  // Update centered position with window size changes
  var updateSize = function() { this.el.css({ marginLeft: -(this.el.width() / 2) + 'px' }); }.bind(this);
  $(window).resize(function() {
    setTimeout(updateSize, 1);
  });
  setTimeout(updateSize, 0);

  this.emit('show');
  return this;
};


/**
 * Hide the dialog with optional delay of `ms`,
 * otherwise the dialog is removed immediately.
 *
 * Emits "hide" event.
 *
 * @return {Number} ms
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.hide = function(ms){
  var self = this;

  // prevent thrashing
  this.hiding = true;

  // duration
  if (ms) {
    setTimeout(function(){
      self.hide();
    }, ms);
    return this;
  }

  // hide / remove
  this.el.addClass('ui-hide');
  if (this._effect) {
    setTimeout(function(){
      self.remove();
    }, 500);
  } else {
    self.remove();
  }

  // modal
  if (this._overlay && !self.closedOverlay) this._overlay.hide();

  return this;
};

/**
 * Hide the dialog without potential animation.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.remove = function(){
  this.emit('hide');
  this.el.remove();
  $(document).unbind('keydown.dialog');
  return this;
};

})(ui, "<div id=\"ui-dialog\" class=\"ui-dialog ui-hide\">\n  <div class=\"ui-content\">\n    <h1>Title</h1>\n    <a href=\"#\" class=\"ui-close\">×</a>\n    <p>Message</p>\n  </div>\n</div>", jQuery);

;(function(exports, html, $){
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

})(ui, "<div id=\"ui-overlay\" class=\"ui-hide\"></div>", jQuery);

;(function(exports, html, $){
/**
 * Expose `Confirmation`.
 */

exports.Confirmation = Confirmation;

/**
 * Return a new `Confirmation` dialog with the given 
 * `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.confirm = function(title, msg){
  switch (arguments.length) {
    case 2:
      return new Confirmation({ title: title, message: msg });
    case 1:
      return new Confirmation({ message: title });
  }
};

/**
 * Initialize a new `Confirmation` dialog.
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

function Confirmation(options) {
  ui.Dialog.call(this, options);
};

/**
 * Inherit from `Dialog.prototype`.
 */

Confirmation.prototype = new ui.Dialog;

/**
 * Change "cancel" button `text`.
 *
 * @param {String} text
 * @return {Confirmation}
 * @api public
 */

Confirmation.prototype.cancel = function(text){
  this.el.find('.ui-cancel').text(text);
  return this;
};

/**
 * Change "ok" button `text`.
 *
 * @param {String} text
 * @return {Confirmation}
 * @api public
 */

Confirmation.prototype.ok = function(text){
  this.el.find('.ui-ok').text(text);
  return this;
};

/**
 * Show the confirmation dialog and invoke `fn(ok)`.
 *
 * @param {Function} fn
 * @return {Confirmation} for chaining
 * @api public
 */

Confirmation.prototype.show = function(fn){
  ui.Dialog.prototype.show.call(this);
  this.el.find('.ui-ok').focus();
  this.callback = fn || function(){};
  return this;
};

/**
 * Render with the given `options`.
 *
 * Emits "cancel" event.
 * Emits "ok" event.
 *
 * @param {Object} options
 * @api public
 */

Confirmation.prototype.render = function(options){
  ui.Dialog.prototype.render.call(this, options);
  var self = this
    , actions = $(html);

  this.el.addClass('ui-confirmation');
  this.el.append(actions);

  this.on('close', function(){
    self.emit('cancel');
    self.callback(false);
  });

  this.on('escape', function(){
    self.emit('cancel');
    self.callback(false);
  });

  actions.find('.ui-cancel').click(function(e){
    e.preventDefault();
    self.emit('cancel');
    self.callback(false);
    self.hide();
  });

  actions.find('.ui-ok').click(function(e){
    e.preventDefault();
    self.emit('ok');
    self.callback(true);
    self.hide();
  });
};

})(ui, "<div class=\"ui-actions\">\n  <button class=\"ui-cancel\">Cancel</button>\n  <button class=\"ui-ok ui-main\">Ok</button>\n</div>", jQuery);

;(function(exports, html, $){

/**
 * Expose `Alert`.
 */

exports.Alert = Alert;

/**
 * Return a new `Alert` dialog with the given
 * `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.alert = function(title, msg){
  switch (arguments.length) {
    case 2:
      return new Alert({ title: title, message: msg });
    case 1:
      return new Alert({ message: title });
  }
};

/**
 * Initialize a new `Alert` dialog.
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

function Alert(options) {
  ui.Dialog.call(this, options);
}

/**
 * Inherit from `Dialog.prototype`.
 */

Alert.prototype = new ui.Dialog();

/**
 * Change "cancel" button `text`.
 *
 * @param {String} text
 * @return {Alert}
 * @api public
 */

Alert.prototype.cancel = function(text){
  var cancel = this.el.find('.ui-cancel');
  cancel.text(text);
  cancel.removeClass('ui-hide');
  return this;
};

/**
 * Change "ok" button `text`.
 *
 * @param {String} text
 * @return {Alert}
 * @api public
 */

Alert.prototype.ok = function(text){
  var ok = this.el.find('.ui-ok');
  ok.text(text);
  ok.removeClass('ui-hide');
  return this;
};

/**
 * Show the confirmation dialog and invoke `fn(ok)`.
 *
 * @param {Function} fn
 * @return {Alert} for chaining
 * @api public
 */

Alert.prototype.show = function(fn){
  ui.Dialog.prototype.show.call(this);
  this.el.find('.ui-ok').focus();
  this.callback = fn || function(){};
  return this;
};

/**
 * Render with the given `options`.
 *
 * Emits "cancel" event.
 * Emits "ok" event.
 *
 * @param {Object} options
 * @api public
 */

Alert.prototype.render = function(options){
  ui.Dialog.prototype.render.call(this, options);
  var self = this
    , actions = $(html);

  this.el.addClass('ui-alert');
  this.el.append(actions);

  this.on('close', function(){
    self.emit('cancel');
    self.callback(false);
    self.hide();
  });

  actions.find('.cancel').click(function(e){
    e.preventDefault();
    self.emit('cancel');
    self.callback(false);
    self.hide();
  });

  actions.find('.ok').click(function(e){
    e.preventDefault();
    self.emit('ok');
    self.callback(true);
    self.hide();
  });

};

})(ui, "<div class=\"ui-actions\">\n  <button class=\"ui-cancel ui-hide\">Cancel</button>\n  <button class=\"ui-ok ui-main ui-hide\">Ok</button>\n</div>", jQuery);

;(function(exports, html, $){

/**
 * Expose `ColorPicker`.
 */

exports.ColorPicker = ColorPicker;

/**
 * RGB util.
 */

function rgb(r,g,b) {
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/**
 * RGBA util.
 */

function rgba(r,g,b,a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

/**
 * Mouse position util.
 */

function localPos(e) {
  var offset = $(e.target).offset();
  return {
      x: e.pageX - offset.left
    , y: e.pageY - offset.top
  };
}

/**
 * Initialize a new `ColorPicker`.
 *
 * Emits:
 *
 *    - `change` with the given color object
 *
 * @api public
 */

function ColorPicker() {
  ui.Emitter.call(this);
  this._colorPos = {};
  this.el = $(html);
  this.main = this.el.find('.ui-main').get(0);
  this.spectrum = this.el.find('.ui-spectrum').get(0);
  $(this.main).bind('selectstart', function(e){ e.preventDefault() });
  $(this.spectrum).bind('selectstart', function(e){ e.preventDefault() });
  this.hue(rgb(255, 0, 0));
  this.spectrumEvents();
  this.mainEvents();
  this.w = 180;
  this.h = 180;
  this.render();
}

/**
 * Inherit from `Emitter.prototype`.
 */

ColorPicker.prototype = new ui.Emitter;

/**
 * Set width / height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.size = function(n){
  return this
    .width(n)
    .height(n);
};

/**
 * Set width to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.width = function(n){
  this.w = n;
  this.render();
  return this;
};

/**
 * Set height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.height = function(n){
  this.h = n;
  this.render();
  return this;
};

/**
 * Spectrum related events.
 *
 * @api private
 */

ColorPicker.prototype.spectrumEvents = function(){
  var self = this
    , canvas = $(this.spectrum)
    , down;

  function update(e) {
    var offsetY = localPos(e).y
      , color = self.hueAt(offsetY - 4);
    self.hue(color.toString());
    self.emit('change', color);
    self._huePos = offsetY;
    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Hue / lightness events.
 *
 * @api private
 */

ColorPicker.prototype.mainEvents = function(){
  var self = this
    , canvas = $(this.main)
    , down;

  function update(e) {
    var color;
    self._colorPos = localPos(e);
    color = self.colorAt(self._colorPos.x, self._colorPos.y);
    self.color(color.toString());
    self.emit('change', color);

    self.render();
  }

  canvas.mousedown(function(e){
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Get the RGB color at `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Object}
 * @api private
 */

ColorPicker.prototype.colorAt = function(x, y){
  var data = this.main.getContext('2d').getImageData(x, y, 1, 1).data;
  return {
      r: data[0]
    , g: data[1]
    , b: data[2]
    , toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get the RGB value at `y`.
 *
 * @param {Type} name
 * @return {Type}
 * @api private
 */

ColorPicker.prototype.hueAt = function(y){
  var data = this.spectrum.getContext('2d').getImageData(0, y, 1, 1).data;
  return {
      r: data[0]
    , g: data[1]
    , b: data[2]
    , toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get or set `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.color = function(color){
  // TODO: update pos
  if (0 == arguments.length) return this._color;
  this._color = color;
  return this;
};

/**
 * Get or set hue `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.hue = function(color){
  // TODO: update pos
  if (0 == arguments.length) return this._hue;
  this._hue = color;
  return this;
};

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

ColorPicker.prototype.render = function(options){
  options = options || {};
  this.renderMain(options);
  this.renderSpectrum(options);
};

/**
 * Render spectrum.
 *
 * @api private
 */

ColorPicker.prototype.renderSpectrum = function(options){
  var el = this.el
    , canvas = this.spectrum
    , ctx = canvas.getContext('2d')
    , pos = this._huePos
    , w = this.w * .12
    , h = this.h;

  canvas.width = w;
  canvas.height = h;

  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgb(255, 0, 0));
  grad.addColorStop(.15, rgb(255, 0, 255));
  grad.addColorStop(.33, rgb(0, 0, 255));
  grad.addColorStop(.49, rgb(0, 255, 255));
  grad.addColorStop(.67, rgb(0, 255, 0));
  grad.addColorStop(.84, rgb(255, 255, 0));
  grad.addColorStop(1, rgb(255, 0, 0));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  if (!pos) return;
  ctx.fillStyle = rgba(0,0,0, .3);
  ctx.fillRect(0, pos, w, 1);
  ctx.fillStyle = rgba(255,255,255, .3);
  ctx.fillRect(0, pos + 1, w, 1);
};

/**
 * Render hue/luminosity canvas.
 *
 * @api private
 */

ColorPicker.prototype.renderMain = function(options){
  var el = this.el
    , canvas = this.main
    , ctx = canvas.getContext('2d')
    , w = this.w
    , h = this.h
    , x = (this._colorPos.x || w) + .5
    , y = (this._colorPos.y || 0) + .5;

  canvas.width = w;
  canvas.height = h;

  var grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, rgb(255, 255, 255));
  grad.addColorStop(1, this._hue);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgba(255, 255, 255, 0));
  grad.addColorStop(1, rgba(0, 0, 0, 1));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  var rad = 10;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;

  // outer dark
  ctx.strokeStyle = rgba(0,0,0,.5);
  ctx.arc(x, y, rad / 2, 0, Math.PI * 2, false);
  ctx.stroke();

  // outer light
  ctx.strokeStyle = rgba(255,255,255,.5);
  ctx.arc(x, y, rad / 2 - 1, 0, Math.PI * 2, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.restore();
};
})(ui, "<div class=\"ui-color-picker\">\n  <canvas class=\"ui-main\"></canvas>\n  <canvas class=\"ui-spectrum\"></canvas>\n</div>", jQuery);

;(function(exports, html, $){

/**
 * Notification list.
 */

var list;

/**
 * Expose `Notification`.
 */

exports.Notification = Notification;

// list

$(function(){
  list = $('<ul id="ui-notifications">');
  list.appendTo('body');
})

/**
 * Return a new `Notification` with the given 
 * (optional) `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.notify = function(title, msg){
  switch (arguments.length) {
    case 2:
      return new Notification({ title: title, message: msg })
        .show()
        .hide(4000);
    case 1:
      return new Notification({ message: title })
        .show()
        .hide(4000);
  }
};

/**
 * Construct a notification function for `type`.
 *
 * @param {String} type
 * @return {Function}
 * @api private
 */

function type(type) {
  return function(title, msg){
    return exports.notify.apply(this, arguments)
      .type(type);
  }
}

/**
 * Notification methods.
 */

exports.info = exports.notify;
exports.warn = type('warn');
exports.error = type('error');

/**
 * Initialize a new `Notification`.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * @param {Object} options
 * @api public
 */

function Notification(options) {
  ui.Emitter.call(this);
  options = options || {};
  this.template = html;
  this.el = $(this.template);
  this.render(options);
  if (Notification.effect) this.effect(Notification.effect);
};

/**
 * Inherit from `Emitter.prototype`.
 */

Notification.prototype = new ui.Emitter;

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Notification.prototype.render = function(options){
  var el = this.el
    , title = options.title
    , msg = options.message
    , self = this;

  el.find('.ui-close').click(function(){
    self.hide();
    return false;
  });

  el.click(function(e){
    e.preventDefault();
    self.emit('click', e);
  });

  el.find('h1').text(title);
  if (!title) el.find('h1').remove();

  // message
  if ('string' == typeof msg) {
    el.find('p').text(msg);
  } else if (msg) {
    el.find('p').replaceWith(msg.el || msg);
  }

  setTimeout(function(){
    el.removeClass('ui-hide');
  }, 0);
};

/**
 * Enable the dialog close link.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.closable = function(){
  this.el.addClass('ui-closable');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.effect = function(type){
  this._effect = type;
  this.el.addClass('ui-' + type);
  return this;
};

/**
 * Show the notification.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.show = function(){
  this.el.appendTo(list);
  return this;
};

/**
 * Set the notification `type`.
 *
 * @param {String} type
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.type = function(type){
  this._type = type;
  this.el.addClass('ui-' + type);
  return this;
};

/**
 * Make it stick (clear hide timer), and make it closable.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.sticky = function(){
  return this.hide(0).closable();
};

/**
 * Hide the dialog with optional delay of `ms`,
 * otherwise the notification is removed immediately.
 *
 * @return {Number} ms
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.hide = function(ms){
  var self = this;

  // duration
  if ('number' == typeof ms) {
    clearTimeout(this.timer);
    if (!ms) return this;
    this.timer = setTimeout(function(){
      self.hide();
    }, ms);
    return this;
  }

  // hide / remove
  this.el.addClass('ui-hide');
  if (this._effect) {
    setTimeout(function(){
      self.remove();
    }, 500);
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the notification without potential animation.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Notification.prototype.remove = function(){
  this.el.remove();
  return this;
};
})(ui, "<li class=\"ui-notification ui-hide\">\n  <div class=\"ui-content\">\n    <h1>Title</h1>\n    <a href=\"#\" class=\"ui-close\">×</a>\n    <p>Message</p>\n  </div>\n</li>", jQuery);

;(function(exports, html, $){

/**
 * Expose `SplitButton`.
 */

exports.SplitButton = SplitButton;

/**
 * Initialize a new `SplitButton`
 * with an optional `label`.
 *
 * @param {String} label
 * @api public
 */

function SplitButton(label) {
  ui.Emitter.call(this);
  this.el = $(html);
  this.events();
  this.render({ label: label });
  this.state = 'hidden';
}

/**
 * Inherit from `Emitter.prototype`.
 */

SplitButton.prototype = new ui.Emitter;

/**
 * Register event handlers.
 *
 * @api private
 */

SplitButton.prototype.events = function(){
  var self = this
    , el = this.el;

  el.find('.ui-button').click(function(e){
    e.preventDefault();
    self.emit('click', e);
  });

  el.find('.ui-toggle').click(function(e){
    e.preventDefault();
    self.toggle();
  });
};

/**
 * Toggle the drop-down contents.
 *
 * @return {SplitButton}
 * @api public
 */

SplitButton.prototype.toggle = function(){
  return 'hidden' == this.state
    ? this.show()
    : this.hide();
};

/**
 * Show the drop-down contents.
 *
 * @return {SplitButton}
 * @api public
 */

SplitButton.prototype.show = function(){
  this.state = 'visible';
  this.emit('show');
  this.el.addClass('ui-show');
  return this;
};

/**
 * Hide the drop-down contents.
 *
 * @return {SplitButton}
 * @api public
 */

SplitButton.prototype.hide = function(){
  this.state = 'hidden';
  this.emit('hide');
  this.el.removeClass('ui-show');
  return this;
};

/**
 * Render the split-button with the given `options`.
 *
 * @param {Object} options
 * @return {SplitButton}
 * @api private
 */

SplitButton.prototype.render = function(options){
  var options = options || {}
    , button = this.el.find('.ui-button')
    , label = options.label;

  if ('string' == label) button.text(label);
  else button.text('').append(label);
  return this;
};

})(ui, "<div class=\"ui-split-button\">\n  <a class=\"ui-text\" href=\"#\">Action</a>\n  <a class=\"ui-toggle\" href=\"#\"><span></span></a>\n</div>", jQuery);

;(function(exports, html, $){

/**
 * Expose `Menu`.
 */

exports.Menu = Menu;

/**
 * Create a new `Menu`.
 *
 * @return {Menu}
 * @api public
 */

exports.menu = function(){
  return new Menu;
};

/**
 * Initialize a new `Menu`.
 *
 * Emits:
 *
 *   - "show" when shown
 *   - "hide" when hidden
 *   - "remove" with the item name when an item is removed
 *   - * menu item events are emitted when clicked
 *
 * @api public
 */

function Menu() {
  ui.Emitter.call(this);
  this.items = {};
  this.el = $(html).hide().appendTo('body');
  this.el.hover(this.deselect.bind(this));
  $('html').click(this.hide.bind(this));
  this.on('show', this.bindKeyboardEvents.bind(this));
  this.on('hide', this.unbindKeyboardEvents.bind(this));
};

/**
 * Inherit from `Emitter.prototype`.
 */

Menu.prototype = new ui.Emitter;

/**
 * Deselect selected menu items.
 *
 * @api private
 */

Menu.prototype.deselect = function(){
  this.el.find('.ui-selected').removeClass('ui-selected');
};

/**
 * Bind keyboard events.
 *
 * @api private
 */

Menu.prototype.bindKeyboardEvents = function(){
  $(document).bind('keydown.menu', this.onkeydown.bind(this));
  return this;
};

/**
 * Unbind keyboard events.
 *
 * @api private
 */

Menu.prototype.unbindKeyboardEvents = function(){
  $(document).unbind('keydown.menu');
  return this;
};

/**
 * Handle keydown events.
 *
 * @api private
 */

Menu.prototype.onkeydown = function(e){
  switch (e.keyCode) {
    // up
    case 38:
      e.preventDefault();
      this.move('prev');
      break;
    // down
    case 40:
      e.preventDefault();
      this.move('next');
      break;
  }
};

/**
 * Focus on the next menu item in `direction`.
 * 
 * @param {String} direction "prev" or "next"
 * @api public
 */

Menu.prototype.move = function(direction){
  var prev = this.el.find('.ui-selected').eq(0);

  var next = prev.length
    ? prev[direction]()
    : this.el.find('li:first-child');

  if (next.length) {
    prev.removeClass('ui-selected');
    next.addClass('ui-selected');
    next.find('a').focus();
  }
};

/**
 * Add menu item with the given `text` and optional callback `fn`.
 *
 * When the item is clicked `fn()` will be invoked
 * and the `Menu` is immediately closed. When clicked
 * an event of the name `text` is emitted regardless of
 * the callback function being present.
 *
 * @param {String} text
 * @param {Function} fn
 * @return {Menu}
 * @api public
 */

Menu.prototype.add = function(text, fn){
  var self = this
    , el = $('<li><a href="#">' + text + '</a></li>')
    .addClass('ui-' + slug(text))
    .appendTo(this.el)
    .click(function(e){
      e.preventDefault();
      e.stopPropagation();
      self.hide();
      self.emit(text);
      fn && fn();
    });

  this.items[text] = el;
  return this;
};

/**
 * Remove menu item with the given `text`.
 *
 * @param {String} text
 * @return {Menu}
 * @api public
 */

Menu.prototype.remove = function(text){
  var item = this.items[text];
  if (!item) throw new Error('no menu item named "' + text + '"');
  this.emit('remove', text);
  item.remove();
  delete this.items[text];
  return this;
};

/**
 * Check if this menu has an item with the given `text`.
 *
 * @param {String} text
 * @return {Boolean}
 * @api public
 */

Menu.prototype.has = function(text){
  return !! this.items[text];
};

/**
 * Move context menu to `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Menu}
 * @api public
 */

Menu.prototype.moveTo = function(x, y){
  this.el.css({
    top: y,
    left: x
  });
  return this;
};

/**
 * Show the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.show = function(){
  this.emit('show');
  this.el.show();
  return this;
};

/**
 * Hide the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.hide = function(){
  this.emit('hide');
  this.el.hide();
  return this;
};

/**
 * Generate a slug from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function slug(str) {
  return str
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

})(ui, "<div class=\"ui-menu\">\n</div>", jQuery);

;(function(exports, html, $){

/**
 * Expose `Card`.
 */

exports.Card = Card;

/**
 * Create a new `Card`.
 *
 * @param {Mixed} front
 * @param {Mixed} back
 * @return {Card}
 * @api public
 */

exports.card = function(front, back){
  return new Card(front, back);
};

/**
 * Initialize a new `Card` with content
 * for face `front` and `back`.
 *
 * Emits "flip" event.
 *
 * @param {Mixed} front
 * @param {Mixed} back
 * @api public
 */

function Card(front, back) {
  ui.Emitter.call(this);
  this._front = front || $('<p>front</p>');
  this._back = back  || $('<p>back</p>');
  this.template = html;
  this.render();
};

/**
 * Inherit from `Emitter.prototype`.
 */

Card.prototype = new ui.Emitter;

/**
 * Set front face `val`.
 *
 * @param {Mixed} val
 * @return {Card}
 * @api public
 */

Card.prototype.front = function(val){
  this._front = val;
  this.render();
  return this;
};

/**
 * Set back face `val`.
 *
 * @param {Mixed} val
 * @return {Card}
 * @api public
 */

Card.prototype.back = function(val){
  this._back = val;
  this.render();
  return this;
};

/**
 * Flip the card.
 *
 * @return {Card} for chaining
 * @api public
 */

Card.prototype.flip = function(){
  this.emit('flip');
  this.el.toggleClass('ui-flipped');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Dialog} for chaining
 * @api public
 */

Card.prototype.effect = function(type){
  this.el.addClass('ui-' + type);
  return this;
};

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Card.prototype.render = function(options){
  var self = this
    , el = this.el = $(this.template);
  el.find('.ui-front').empty().append(this._front.el || $(this._front));
  el.find('.ui-back').empty().append(this._back.el || $(this._back));
  el.click(function(){
    self.flip();
  });
};
})(ui, "<div class=\"ui-card\">\n  <div class=\"ui-wrapper\">\n    <div class=\"ui-face ui-front\">1</div>\n    <div class=\"ui-face ui-back\">2</div>\n  </div>\n</div>", jQuery);

;(function(exports, html, $){
/**
 * Tabs.
 */



/**
 * Expose `Tabs`.
 */

exports.Tabs = Tabs;

/**
 * Return a new `Tabs` with the given
 * (optional) `title` and `msg`.
 *
 * @param {Object} selector or jQuery element
 * @return {Tabs}
 * @api public
 */

exports.tabs = function(tabs) {
  tabs = $(tabs);
  return new Tabs({ tabs: $(tabs) });
};

/**
 * Initialize a new `Tabs`.
 *
 * Options:
 *
 *    - `parent` element that contains the tab <li>'s
 *
 * Emits:
 *
 *    - `show` when visible
 *    - `hide` when hidden
 *
 * @param {Object} options
 * @api public
 */

function Tabs(options) {
  ui.Emitter.call(this);
  options = options || {};

  // Unused
  this.template = html;
  this.tabs = options.parent;
  this.render(options);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Tabs.prototype = new ui.Emitter();

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Tabs.prototype.render = function(options){
  var el = this.el = options.tabs;
  var tabs = el.find('li');
  var tabContainers = $(tabs.toArray().map(getTabTarget).join(', '));

  // Add CSS classes
  el.addClass('ui-tabs');
  tabs.addClass('ui-tab');
  tabContainers.addClass('ui-tab-container');

  // Listen for tab clicks
  tabs.click(function(e) {
    this.selectTab($(e.currentTarget));
    e.preventDefault();
  }.bind(this));

  // Prep UI
  hideAllTabs(this.el);
  this.selectTab(el.find('li:first'));
};

/**
 * Select the given tab
 * @param  {Object} el - Select the given tab (selector or jQuery element)
 */

Tabs.prototype.selectTab = function(el) {
  // Set tab as selected
  this.el.find('li.ui-selected').removeClass('ui-selected');
  this.selectedEl = $(el);
  this.selectedEl.addClass('ui-selected');

  // Show relevant tab content
  hideAllTabs(this.el);
  this.el.parent().find(getTabTarget(this.selectedEl)).show();

  // Emite events
  this.emit('tabchange');
  $(window).resize();
};


//
// Local utility methods

var hideAllTabs = function(tabs) {
  // Build list of selectors
  var selectors = tabs.find('li').toArray().map(getTabTarget);
  var parent = tabs.parent();
  // Select all the tab areas and hide
  parent.find(selectors.join(', ')).hide();
};

var getTabTarget = function(el) {
  el = $(el);
  var tabTarget = el.attr('data-tab-target');
  if (!tabTarget) { tabTarget = el.attr('href'); }
  return tabTarget;
};

})(ui, "", jQuery);

;(function(exports, html, $){

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
  var cancel = this.el.find('.ui-cancel');
  if (cancel.length > 0) { cancel.replaceWith(selector); }
  else { cancel = this.el.find(selector); }
  cancel.addClass('ui-cancel').removeClass('ui-hide');
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
  var ok = this.el.find('.ui-ok');
  if (ok.length > 0) { ok.replaceWith(selector); }
  else { ok = this.el.find(selector); }
  ok.addClass('ui-ok').removeClass('ui-hide');
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

  this.el.addClass('ui-interactive');
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

})(ui, "", jQuery);

;(function(exports, html, $){

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
})(ui, "", jQuery);