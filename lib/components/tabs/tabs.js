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
  var tabContainers = $(tabs.toArray().map(getTabTarget));

  // Add CSS classes
  el.addClass('tabs');
  tabs.addClass('tab');
  tabContainers.addClass('tab-container');

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
  this.el.find('li.selected').removeClass('selected');
  this.selectedEl = $(el);
  this.selectedEl.addClass('selected');

  // Show relevant tab content
  hideAllTabs(this.el);
  $(getTabTarget(this.selectedEl)).show();

  // Emite event
  this.emit('tabchange');
};

var hideAllTabs = function(tabs) {
  // Build list of selectors
  var selectors = tabs.find('li').toArray().map(getTabTarget);
  // Select all the tab areas and hide
  $(selectors.join(', ')).hide();
};

var getTabTarget = function(el) {
  el = $(el);
  var tabTarget = el.attr('data-tab-target');
  if (!tabTarget) { tabTarget = el.attr('href'); }
  return tabTarget;
};