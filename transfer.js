var log = console.log.bind(log)
var sourceElement = []
var targetElement = []

var qs = function (selector) {
    return document.querySelectorAll(selector)
}

var leftPanel = qs('#list-group-left')[0]
var rightPanel = qs('#list-group-right')[0]

var bindAll = function (selector, eventName, callback) {
    var e = qs(selector)
    for (var i = 0; i < e.length; i++) {
        e[i].addEventListener(eventName, function (event) {
            callback(event)
        })
    }
}

var checkFilter = {
    acceptNode: function (node) {
        return node.checked == true && node.className == 'form-check-input' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    }
}

var transfer = function (e, sourcePanel, targetPanel) {
    sourceElement = []
    var interator = document.createNodeIterator(sourcePanel, NodeFilter.SHOW_ELEMENT, checkFilter, false)
    var node = interator.nextNode()
    while (node !== null) {
        sourceElement.push(node)
        node = interator.nextNode()
    }
    for (var e of sourceElement) {
        var item = e.parentNode.parentNode.parentNode
        item.remove()
        e.checked = false
        targetPanel.append(item)
    }
}

// 根据选中与否，更新按钮状态
var updateButton = function () {
    var leftInterator = document.createNodeIterator(leftPanel, NodeFilter.SHOW_ELEMENT, checkFilter, false)
    if (leftInterator.nextNode()) {
        qs('#transfer_button_to_right')[0].disabled = false
    } else {
        qs('#transfer_button_to_right')[0].disabled = true
    }
    var rightInterator = document.createNodeIterator(rightPanel, NodeFilter.SHOW_ELEMENT, checkFilter, false)
    if (rightInterator.nextNode()) {
        qs('#transfer_button_to_left')[0].disabled = false
    } else {
        qs('#transfer_button_to_left')[0].disabled = true
    }
}

// 选中后，更新已选择项
var updateSelectedNum = function (panel) {
    var interator = document.createNodeIterator(panel, NodeFilter.SHOW_ELEMENT, checkFilter, false)
    var count = 0
    var itemCount = qs(`#${panel.id} .list-group-item`)
    var SelectNum = qs(`#${panel.id} .selected-num span`)[0]
    var node = interator.nextNode()
    while (node !== null) {
        node = interator.nextNode()
        count++
    }
    SelectNum.innerHTML = `<span>已选择 ${count}/${itemCount.length} 项</span>`
}

var itemFilter = {
    acceptNode: function (node) {
        return node.className == 'form-check-label' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    }
}

// 搜索
var search = function (panel, searchInputId) {
    var searchInput = qs(searchInputId)[0]
    // 获取search内容
    var text = searchInput.value;
    // 查找 item
    var interator = document.createNodeIterator(panel, NodeFilter.SHOW_ELEMENT, itemFilter, false)
    var node = interator.nextNode()
    while (node !== null) {
        if (text && node.childNodes[3].innerText.indexOf(text) !== -1) {
            // 改变样式
            node.style.color = '#409eff'
        } else {
            node.style.color = 'black'
        }
        node = interator.nextNode()
    }
}

// 清空搜索框
var clearSearch = function (searchId) {
    var searchInput = qs(searchId)[0]
    searchInput.value = ''
} 

var selectAll = function (listId) {
    var select = qs(`${listId} input:nth-of-type(1)`)[0]
    var item = qs(`${listId} .list-group-item input`)
    for (var e of item) {
        if (select.checked == true) {
            e.checked = true
        } else {
            e.checked = false
        }
    }
}

var checkSelectedAll = function (panel, listId) {
    var select = qs(`${listId} input:nth-of-type(1)`)[0]
    var item = qs(`${listId} .list-group-item input`)
    var count = 0
    for (var e of item) {
        if (e.checked == false) {
            select.checked = false
        } else {
            count++
            if (count == item.length) {
                select.checked = true
            }
        }
    }
}

var bindEvent = function () {
    bindAll('.form-check-input', 'input', function (event) {
        updateButton()
        if (event.target.parentNode.parentNode.parentNode.parentNode.id == 'list-group-left') {
            updateSelectedNum(leftPanel)
            checkSelectedAll(leftPanel, '#list-group-left')
        } else {
            updateSelectedNum(rightPanel)
            checkSelectedAll(rightPanel, '#list-group-right')
        }
    })
    bindAll('#list-left-all', 'input', function () {
        selectAll('#list-group-left')
        updateButton()
        updateSelectedNum(leftPanel)
    })
    bindAll('#list-right-all', 'input', function () {
        selectAll('#list-group-right')
        updateButton()
        updateSelectedNum(rightPanel)
    })
    bindAll('#transfer_button_to_right', 'click', function (event) {
        clearSearch('#left-search')
        transfer(event, leftPanel, rightPanel)
        updateSelectedNum(leftPanel)
        search(rightPanel, '#right-search')
        updateButton()
    })
    bindAll('#transfer_button_to_left', 'click', function (event) {
        clearSearch('#right-search')
        transfer(event, rightPanel, leftPanel)
        updateButton()
        updateSelectedNum(rightPanel)
        search(leftPanel, '#left-search')
    })
    bindAll('#left-search', 'input', function (event) {
        search(leftPanel, '#left-search')
    })
    bindAll('#right-search', 'input', function (event) {
        search(rightPanel, '#right-search')
    })
}

var templateControl = function (key, item) {
    var t =
        `
        <div class="list-group-item">
            <div class="form-check">
                <label for="${item.id}" class="form-check-label">
                    <input type="checkbox" class="form-check-input" id="${item.id}">
                    <span>${item.value}</span>
                </label>
            </div>
        </div>
        `
    return t
}

// 读取数据文件，并生成HTML
var insertControl = function (data, divName) {
    var div = document.querySelector(`#${divName}`)
    var key1 = Object.keys(data)
    for (var k of key1) {
        var item = data[k]
        var html = templateControl(k, item)
        div.insertAdjacentHTML('beforeend', html)
    }
}

var source = {
    orange: {
        id: 'orange',
        value: 'orange',
    },
    red: {
        id: 'red',
        value: 'red',
    },
}

var target = {
    yellow: {
        id: 'yellow',
        value: 'yellow',
        checked: false,
    },
    green: {
        id: 'green',
        value: 'green',
        checked: false,
    },
}

var __main = function () {
    insertControl(source, 'list-group-left')
    insertControl(target, 'list-group-right')
    bindEvent()
}

__main()