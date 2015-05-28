var Store = function() {

	var _changeListeners = [];
	var _eventListeners = {};
	var _storeEvent = {};
	var _storeChange = [];

	function addListener (changeHandlers, eventHandlers, name, fn) {
		if (typeof name === 'function') {
			fn = name;
			name = null;
		}
		if (name) {
			if (!eventHandlers[name]) {
				eventHandlers[name] = [];
			}
			eventHandlers[name].push(fn);
		} else {
			changeHandlers.push(fn);
		}
	}

	function removeListener (changeHandlers, eventHandlers, name, fn) {
		if (typeof name === 'function') {
			fn = name;
			name = null;
		}
		if (name) {
			if (eventHandlers[name]) {
				eventHandlers[name] = eventHandlers[name].filter(function(i) {
					return fn !== i;
				});
			}
		} else {
			changeHandlers = changeHandlers.filter(function(i) {
				return fn !== i;
			});
		}
	}

	function notifier(changeHandlers, eventHandlers, name, args, result) {
		if (eventHandlers[name]) {
			eventHandlers[name].forEach(function(fn) {
					fn.call(this, name, args, result);
			}.bind(this));
		}
		changeHandlers.forEach(function(fn) {
				fn.call(this, name, args, result);
		}.bind(this));
	}


	//add a wrapped function that can report the arguments and result
	//of all functions on the store.
	this.addMethod = function (key, fn) {
		this[key] = function() {
			var result = fn.apply(this, arguments);
			notifier.call(
				this,
				_storeChange,
				_storeEvent,
				key,
				Array.prototype.slice.call(arguments),
				result
			);
			return result;
		}.bind(this);
		return this;
	};


	this.notifyChange = notifier.bind(this, _changeListeners, _eventListeners);
	this.addChangeListener = addListener.bind(this, _changeListeners, _eventListeners);
	this.removeChangeListener = removeListener.bind(this, _changeListeners, _eventListeners);
	this.addStoreListener = addListener.bind(this, _storeChange, _storeEvent);
	this.removeStoreListener = removeListener.bind(this, _storeChange, _storeEvent);

	return this.extend.apply(this, arguments);

};

Store.prototype = {
	extend: function() {
		for (var i = 0; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					if (typeof source[key] ===  'function') {
						this.addMethod(key, source[key]);
					}
					else {
						this[key] = source[key];
					}
				}
			}
		}
		return this;
	}
};

module.exports = Store;
