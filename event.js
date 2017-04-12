export default class Events {

	constructor(type) {
		this.eventStore = {}
	}

	on (type, listener) {
		let namespace = type.split('.')
		this.eventStore[type] = this.eventStore[type] || []
		listener.namespace = type

		this.eventStore[namespace[0]].push(listener)
	}

	once (type, listener) {
		listener.once = true;
		this.on(type, listener);
	}

	off (type, listener) {

		Object.keys(this.eventStore).forEach(eventType => {

			// 不含 namespace
			if (type === eventType && !listener) {
				delete this.eventStore[eventType];
				return;
			} else {
				let listeners = this.eventStore[eventType];

				listeners.forEach((fn, i) => {
					let isMatch = fn.namespace.indexOf(type) !== -1

					if (isMatch && (!listener || fn === listener)) {
						listeners[i] = null
					}
				})

				this.eventStore[eventType] = listeners.filter((fn)=>{
					return typeof fn === 'function'
				})
			}
		});
	}

	emit(type) {
		let result;

		Object.keys(this.eventStore).forEach(eventType => {
			if (eventType.indexOf(type) !== -1) {
				let listeners = this.eventStore[eventType];

				listeners.forEach((fn, i) => {
					if (typeof fn === 'function') {
						let res = fn.apply(this);

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