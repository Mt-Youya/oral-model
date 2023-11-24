export default (function () {
    const AriaName = "aria-selected"
    const ParentRoleName = "listitem"

    return function handleClick(e, callback) {
        if (e.target === this) return
        const target = e.target


        const parent = target.parentElement.role === ParentRoleName ? target.parentElement.parentElement : target.parentElement
        const siblings = [...parent.children].filter(el => el.role === ParentRoleName && el !== target)

        const activeTarget = target.parentElement.role === ParentRoleName ? target.parentElement : target

        for (const sibling of siblings) {
            sibling.setAttribute(AriaName, "false")
        }

        activeTarget.setAttribute(AriaName, "true")
        callback && callback()
    }
})()
