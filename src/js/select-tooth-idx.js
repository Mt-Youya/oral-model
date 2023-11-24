export default class SelectToothIdx {
    constructor(container, pos, initSelected, onSelect) {
        const elem = document.createElement('div')
        const arr = [[55, 51], [61, 65], [17, 11], [21, 27], [47, 41], [31, 37], [85, 81], [71, 75]]
        const elems = []
        for (let i = 0; i < arr.length; i += 2) {
            const left = arr[i]
            const right = arr[i + 1]
            const seq = (a, b) => {
                const res = []
                const step = a > b ? -1 : 1
                while ( a != b) {
                    res.push(`<div class="tooth-idx ${a == initSelected ? 'selected' : ''}">${a}</div>`)
                    a += step
                }
                res.push(`<div class="tooth-idx">${a}</div>`)
                return res.join('')
            }
            elems.push(`<div>${seq(left[0], left[1])}${seq(right[0], right[1])}</div>`)
        }
        elem.className = 'yayan-float-window'
        elem.style = `left: ${pos[0]}; top: ${pos[1]};`
        elem.innerHTML = elems.join('')
        container.appendChild(elem)
        const onClick = e => {
            onSelect(parseInt(e.target.innerText, 10))
            this.delete()
        }
        elem.querySelectorAll('.tooth-idx').forEach(item => {
            item.addEventListener('click', onClick)
        })

        this.elem = elem
    }

    delete() {
        this.elem.remove()
    }
}