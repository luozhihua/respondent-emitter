let storeId = Symbol('event_store_id');

export default class Events {

	constructor(type) {
		this[storeId] = {}
	}

	on (type, listener) {

		if (typeof type !== 'string') {
			for (let k in type) {
				this.on(k, type[k])
			}
		} else {
			let namespace = type.split('.')
			this[storeId][type] = this[storeId][type] || []
			listener.namespace = type

			this[storeId][namespace[0]].push(listener)
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

		Object.keys(this[storeId]).forEach(eventType => {

			// 不含 namespace
			if (type === eventType && !listener) {
				delete this[storeId][eventType];
				return;
			} else {
				let listeners = this[storeId][eventType];

				listeners.forEach((fn, i) => {
					let isMatch = fn.namespace.indexOf(type) !== -1

					if (isMatch && (!listener || fn === listener)) {
						listeners[i] = null
					}
				})

				this[storeId][eventType] = listeners.filter((fn)=>{
					return typeof fn === 'function'
				})
			}
		});
	}

	emit(type, ...args) {
		let result;

		Object.keys(this[storeId]).forEach(eventType => {
			if (eventType.indexOf(type) !== -1) {
				let listeners = this[storeId][eventType];

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