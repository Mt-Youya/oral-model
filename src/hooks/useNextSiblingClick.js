export default (function () {
    function returnTarget(target) {
        if (target !== this) {
            return returnTarget.call(this, target.parentElement)
        }
        return target
    }

    const AriaName = "aria-expanded"

    return function useNextSiblingClick(e) {
        const target = returnTarget.call(this, e.target)
        const sibling = target.nextElementSibling
        const expanded = sibling.getAttribute(AriaName)
        if (expanded === "true") {
            sibling.setAttribute(AriaName, "false")
        } else {
            sibling.setAttribute(AriaName, "true")
        }
    }
})()
