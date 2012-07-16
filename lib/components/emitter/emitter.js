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
    addCallback(event);
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

