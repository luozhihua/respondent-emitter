export class Events {

	constructor(type) {
		this.eventStore = {}
	}

	on (type, listener) {
		this.eventStore[type] = this.eventStore[type] || []
		listener.namespace = type.split('.')

		this.eventStore[listener.namespace[0]].push(listener)
	}

	once (type, listener) {
		listener.once = true;
		this.on(type, listener);
	}

	off (type, listener) {

		Object.keys(this.eventStore).forEach(eventType => {
			if (eventType.indexOf(type) !== -1) {
				let listeners = this.eventStore[eventType];

				if (listener) {
					listeners.forEach((fn, i) => {
						if (fn === listener) {
							listeners[i] = null
						}
					})
					this.eventStore[eventType] = listeners.filter((fn)=>{
						return typeof fn === 'function'
					})
				} else {
					delete this.eventStore[eventType]
				}
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

						if (fn.once) {
							this.off(type, fn)
						}
					}

				})

			}
		});

		return result;
	}
}