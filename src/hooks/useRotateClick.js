export default (function () {
    function returnParent(target) {
        if (target !== this) {
            return returnParent.call(this, target.parentElement)
        }
        return target
    }

    const AriaName = "aria-expanded"

    return function useRotateClick(e) {
        const target = returnParent.call(this, e.target)
        const expanded = target.getAttribute(AriaName)
        if (expanded === "true") {
            target.setAttribute(AriaName, "false")
        } else {
            target.setAttribute(AriaName, "true")
        }
    }
})()
