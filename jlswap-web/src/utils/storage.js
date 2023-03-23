export default {

    load (key) {
        let value = sessionStorage.getItem(key)
        if (value === null) return value
        try {
            value = JSON.parse(value)
        } catch (e) {
            value = null
        }
        return value
    },

    put (key, value) {
        value = JSON.stringify(value)
        sessionStorage.setItem(key, value)
    },

    remove (key = undefined) {
        if (typeof key === 'undefined') {
            sessionStorage.clear()
        } else {
            sessionStorage.removeItem(key)
        }
    },

    clear () {
        this.remove()
    }
}
