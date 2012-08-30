/**
 * Expose `KoNotes`.
 */

exports.KoNotes = KoNotes;

/**
 *
 * @param {object} note
 * @param {boolean} editable
 */
var Note = function (note) {
	var note = note || {};
	this.note_id = note.note_id;
	this.author = note.author;
	this.date = note.date;
	this.content = note.content;
	this.editable = !!note.editable;
};

/**
 * Return a new `Alert` dialog with the given
 * `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

exports.koNotes = function (title, msg) {
	switch (arguments.length) {
		case 2:
			return new KoNotes({ title: title, message: msg });
		case 1:
			return new KoNotes({ message: title });
	}
};

/**
 * Initialize a new `KoNotes` dialog.
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

function KoNotes(options) {
	this.notes = ko.observableArray([]);
	ui.Dialog.call(this, options);
}

/**
 * Inherit from `Dialog.prototype`.
 */

KoNotes.prototype = new ui.Dialog();

/**
 *
 * @return {Function}
 * @api public
 */

KoNotes.prototype.createViewModel = function (notes) {

	this.notes = notes;
	this.active = ko.observable(this.notes()[0] || new Note({}));

	var self = this;
	this.select = function (note) {
		self.active(note);
	};
	this.selectDefault = function () {
		self.active(self.notes()[0]);
	};
	this.getActiveClass = function (note) {
		return self.active() === note ? 'ui-rev ui-active' : 'ui-rev';
	};
};


/**
 *
 * @param {string} noteId
 * @param {string} content
 * @param {string} author
 * @param {string} date
 * @param {boolean} editable
 * @return {KoNotes}
 * @api public
 */
KoNotes.prototype.addNote = function (noteId, content, author, date, editable) {

	this.notes.push(new Note({
		note_id:  noteId,
		author:   author,
		date:     date,
		content:  content,
		editable: editable
	}));
	return this;
};

/**
 * Change "cancel" button `text`.
 *
 * @param {String} text
 * @return {KoNotes}
 * @api public
 */

KoNotes.prototype.cancel = function (text) {
	var cancel = this.el.find('.ui-cancel');
	cancel.text(text);
	cancel.removeClass('ui-hide');
	return this;
};

/**
 * Change "ok" button `text`.
 *
 * @param {String} text
 * @return {KoNotes}
 * @api public
 */

KoNotes.prototype.ok = function (text) {
	var ok = this.el.find('.ui-ok');
	ok.text(text);
	ok.removeClass('ui-hide');
	return this;
};

/**
 * Show the confirmation dialog and invoke `fn(ok)`.
 *
 * @param {Function} fn
 * @return {KoNotes} for chaining
 * @api public
 */

KoNotes.prototype.show = function (fn) {
	ui.Dialog.prototype.show.call(this);
	this.el.find('.ui-ok').focus();
	this.callback = fn || function () {};
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

KoNotes.prototype.render = function (options) {
	ui.Dialog.prototype.render.call(this, options);
	var self = this
			, actions = $(html);

	this.el.addClass('ui-alert');
	this.el.append(actions);

	this.viewModel = new self.createViewModel(this.notes);
	ko.applyBindings(this.viewModel, this.el[0]);

	this.on('show', function() {
		self.viewModel.selectDefault();
	});

	this.on('close', function () {
		self.emit('cancel');
		self.callback(false);
		self.hide();
	});

	actions.find('.cancel').click(function (e) {
		e.preventDefault();
		self.emit('cancel');
		self.callback(false);
		self.hide();
	});

	actions.find('.ok').click(function (e) {
		e.preventDefault();
		self.emit('ok');
		self.callback(true);
		self.hide();
	});

};