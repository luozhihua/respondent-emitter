const STORE_NAME = 'RESPONDENT_EMITTER_STORE'
const STORE = typeof Symbol !== 'undefined' ? Symbol('STORE_NAME') : 'STORE_NAME';

export default class Events {

	constructor(type) {
		this[STORE] = {}
	}

	on (type, listener) {

		if (typeof type !== 'string') {
			for (let k in type) {
				this.on(k, type[k])
			}
		} else {
			let namespace = type.split('.')
			this[STORE][type] = this[STORE][type] || []
			listener.namespace = type

			this[STORE][namespace[0]].push(listener)
		}
	}

	once (type, listener) {
		if (typeof type !== 'string') {
			for (let k in type) {
				this.once(k, type[k])
			}
		} else {
			listener.once = true;
			this.on(type, listener);
		}
	}

	off (type, listener) {

		Object.keys(this[STORE]).forEach(eventType => {

			// 不含 namespace
			if (type === eventType && !listener) {
				delete this[STORE][eventType];
				return;
			} else {
				let listeners = this[STORE][eventType];

				listeners.forEach((fn, i) => {
					let isMatch = fn.namespace.indexOf(type) !== -1

					if (isMatch && (!listener || fn === listener)) {
						listeners[i] = null
					}
				})

				this[STORE][eventType] = listeners.filter((fn)=>{
					return typeof fn === 'function'
				})
			}
		});
	}

	emit(type, ...args) {
		let result;

		Object.keys(this[STORE]).forEach(eventType => {
			if (eventType.indexOf(type) !== -1) {
				let listeners = this[STORE][eventType];

				listeners.forEach((fn, i) => {
					if (typeof fn === 'function') {
						let res = fn.apply(this, args);

						result = result === false ? false : res;
						if (fn && fn.once) {
							this.off(type, fn)
						}
					}
				})
			}
		});

		return result;
	}
}