'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var storeId = Symbol('event_store_id');

var Events = function () {
	function Events(type) {
		_classCallCheck(this, Events);

		this[storeId] = {};
	}

	_createClass(Events, [{
		key: 'on',
		value: function on(type, listener) {

			if (typeof type !== 'string') {
				for (var k in type) {
					this.on(k, type[k]);
				}
			} else {
				var namespace = type.split('.');
				this[storeId][type] = this[storeId][type] || [];
				listener.namespace = type;

				this[storeId][namespace[0]].push(listener);
			}
		}
	}, {
		key: 'once',
		value: function once(type, listener) {
			if (typeof type !== 'string') {
				for (var k in type) {
					this.once(k, type[k]);
				}
			} else {
				listener.once = true;
				this.on(type, listener);
			}
		}
	}, {
		key: 'off',
		value: function off(type, listener) {
			var _this = this;

			Object.keys(this[storeId]).forEach(function (eventType) {

				// 不含 namespace
				if (type === eventType && !listener) {
					delete _this[storeId][eventType];
					return;
				} else {
					var listeners = _this[storeId][eventType];

					listeners.forEach(function (fn, i) {
						var isMatch = fn.namespace.indexOf(type) !== -1;

						if (isMatch && (!listener || fn === listener)) {
							listeners[i] = null;
						}
					});

					_this[storeId][eventType] = listeners.filter(function (fn) {
						return typeof fn === 'function';
					});
				}
			});
		}
	}, {
		key: 'emit',
		value: function emit(type) {
			var _this2 = this;

			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			var result = void 0;

			Object.keys(this[storeId]).forEach(function (eventType) {
				if (eventType.indexOf(type) !== -1) {
					var listeners = _this2[storeId][eventType];

					listeners.forEach(function (fn, i) {
						if (typeof fn === 'function') {
							var res = fn.apply(_this2, args);

							result = result === false ? false : res;
							if (fn && fn.once) {
								_this2.off(type, fn);
							}
						}
					});
				}
			});

			return result;
		}
	}]);

	return Events;
}();

exports.default = Events;
