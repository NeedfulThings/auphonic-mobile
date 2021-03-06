var Core = require('Core');
var Elements = Core.Elements;

var DynamicMatcher = require('DynamicMatcher');

var UI = module.exports = new DynamicMatcher;
var Notice = require('./Notice');

UI.BackButton = require('./Elements/BackButton');
UI.ActionButton = require('./Elements/ActionButton');
UI.Title = require('./Elements/Title');

var isVisible = false;
var isDisabled = false;
var gesturesAreDisabled = false;
var transitionDelay = 1;

var preventDefault = function(event) {
  event.preventDefault();
};

Object.append(UI, {

  transition: function(container, previous, current, options) {
    var isImmediate = options && options.immediate;
    var direction = (options && options.direction) || 'right';
    var oppositeDirection = (direction == 'right' ? 'left' : 'right');
    var onTransitionEnd = options && options.onTransitionEnd;

    if (current) {
      if (!isImmediate) current.addClass(direction);
      container.adopt(current);
      current.transition({immediate: isImmediate}, function() {
        if (onTransitionEnd) onTransitionEnd();
      });
    }

    if (previous) {
      if (isImmediate) previous.dispose();
      else previous.transition(function() {
        this.dispose();
      });
    }

    (function() {
      // Close all notices on immediate transitions
      if (!isImmediate) Notice.closeAll({direction: oppositeDirection});

      if (previous) previous.addClass(oppositeDirection);
      if (current) current.removeClass(direction);
    }).delay(transitionDelay, this); // Use a higher delay to account for DOM insertion delays

    this.update(container);
  },

  highlight: function(element) {
    element = document.id(element);
    if (!element || this.isHighlighted(element)) return;

    element.addClass('selected');
    var parent = element.getParent('li');
    if (!parent) return;

    this.highlightedElement = element;
    var lists = parent.getSiblings().getElements('a.selected');
    Elements.removeClass(lists.flatten(), 'selected');
  },

  unhighlight: function(element) {
    element = document.id(element);
    if (element && this.isHighlighted(element)) {
      element.removeClass('selected');
      this.highlightedElement = null;
    }
  },

  getHighlightedElement: function() {
    return this.highlightedElement;
  },

  isHighlighted: function(element) {
    return document.id(element).hasClass('selected'); // oh no, state management!
  },

  disable: function(container, exception) {
    if (!container) container = document.body;
    if (container == document.body) isDisabled = true;

    container.addEvent('touchmove', preventDefault)
      .addClass('disable-events');

    if (exception) exception.addClass('enable-events');
  },

  enable: function(container, exception) {
    if (!container) container = document.body;
    if (container == document.body) isDisabled = false;

    container.removeEvent('touchmove', preventDefault)
      .removeClass('disable-events');

    if (exception) exception.removeClass('enable-events');
  },

  isDisabled: function() {
    return isDisabled;
  },

  disableGestures: function() {
    gesturesAreDisabled = true;
  },

  enableGestures: function() {
    gesturesAreDisabled = false;
  },

  gesturesAreDisabled: function() {
    return gesturesAreDisabled;
  },

  showChrome: function(options) {
    if (isVisible) return;
    isVisible = true;

    var main = document.id('ui');
    var login = document.id('login');
    var splash = document.id('splash');

    main.show();
    login.transition(options);
    splash.transition(options, function() {
      document.body.removeClass('chrome-invisible').addClass('chrome-visible');
      login.hide();
      splash.hide();
    });

    (function() {
      login.addClass('fade');
      splash.addClass('fade');
    }).delay(transitionDelay);
  },

  hideChrome: function(options) {
    if (!isVisible) return;
    isVisible = false;

    var main = document.id('ui');
    var login = document.id('login');
    var splash = document.id('splash');

    login.show().transition(options);
    splash.show().transition(options, function() {
      document.body.removeClass('chrome-visible').addClass('chrome-invisible');
      document.getElements('footer a.selected').removeClass('selected');
      main.hide();
    });

    (function() {
      login.removeClass('fade');
      splash.removeClass('fade');
    }).delay(50); // Let's keep the higher delay here for now.
  },

  setTransitionDelay: function(delay) {
    transitionDelay = delay;
  },

  getTransitionDelay: function() {
    return transitionDelay;
  }

});
