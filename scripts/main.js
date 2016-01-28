requirejs(["helpers"], function() {

    // define html parts
    var header = document.getElementsByTagName('header')[0]
    var main = document.getElementsByTagName('main')[0]

    // define limits
    var titleLimit = 67

    // get last saved object from localStorage
    var db = getDBFromLocalStorage()

    // TODO Sort by last modified date
    // load items from object into main view
    function loadItemList() {
        removeEmptyItems() // cleanup
        db = getDBFromLocalStorage() // get the latest saved object from localStorage
        Object.keys(db).forEach(function(key) {
            if(db[key]['title'] !== "") {
                main.innerHTML = `<section data-key='${key}'>${db[key]['title'].substr(0, titleLimit)}</section>` + main.innerHTML
            } else { // if  title is blank, then show the first couple characters of the content as the title
                main.innerHTML = `<section data-key='${key}'>${decodeURIComponent(db[key]['content']).substr(0, titleLimit)}</section>` + main.innerHTML
            }
        })
    }

    function frontPageInit() {
        var addNew = document.getElementsByTagName('button')['add-new']
        addNew.addEventListener('click', addNewItem)
        main.innerHTML = "" // keep main empty, so that there aren't any strays left from other pages
        loadItemList()
    }

    function itemAddAndEditDRY(key) {
        // handle delete button
        var delete_ = document.getElementsByTagName('button')['delete']
        delete_.addEventListener('click', function () {
            deleteItem(key)
            goBackHandler()
        })

        // handle undo button
        var undo = document.getElementsByTagName('button')['undo']
        undo.addEventListener('click', function () {
             document.execCommand('undo', false, null)
        })

        // handle redo button
        var redo = document.getElementsByTagName('button')['redo']
        redo.addEventListener('click', function () {
             document.execCommand('redo', false, null)
        })

        // handle goBack button
        var goBack = document.getElementsByTagName('button')['go-back']
        goBack.addEventListener('click', goBackHandler)
        function goBackHandler() {
            var headerSpan = header.getElementsByTagName('span')[0]
            var headerButtons = header.getElementsByClassName('buttons')[0]
            headerSpan.outerHTML = `<span>Writer</span>`
            headerButtons.innerHTML = `<button name="add-new">+</button>`
            frontPageInit()
        }

        // handle & save loaded item's title edits
        document.getElementsByTagName('span')[0].addEventListener('input', function(event) {
            var title = event.target.textContent
            updateTitle(key, title)
        })

        // handle & save loaded item's content edits
        document.getElementsByTagName('article')[0].addEventListener('input', function(event) {
            var content = encodeURIComponent(event.target.innerText)
            updateContent(key, content)
        })

        // convert any formatting to plain text while pasting
        for(var i=0; i<2; i++) { // 2 contenteditable's in a contentpage, hence the for loop
            document.querySelectorAll('[contenteditable]')[i].addEventListener('paste',function(e) {
                e.preventDefault()
                var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..')
                window.document.execCommand('insertText', false, text)
            })
        }
    }

    var contentPageButtonsString = `<button name='delete'>Delete</button><button name='undo'>Undo</button><button name='redo'>Redo</button><button name='go-back'><- Back</button>`

    function addNewItem() {
        var key = generateUUID()

        var headerSpan = header.getElementsByTagName('span')[0]
        var headerButtons = header.getElementsByClassName('buttons')[0]

        headerSpan.outerHTML = `<span contenteditable='true'></span>`
        headerButtons.innerHTML = contentPageButtonsString
        main.innerHTML = `<article contenteditable='true'></article>`
        var article = document.getElementsByTagName('article')[0]
        article.focus()

        itemAddAndEditDRY(key)
    }

    // load content page for the clicked item - procedure identical to addNewItem() but with a slight difference
    document.getElementsByTagName('main')[0].addEventListener('click', function(event) {
        if(event.target.tagName.toLowerCase() === 'section') {
            var clickedSection = event.target
            var key = clickedSection.dataset.key // key for the item to be loaded

            var headerSpan = header.getElementsByTagName('span')[0]
            var headerButtons = header.getElementsByClassName('buttons')[0]

            headerSpan.outerHTML = `<span contenteditable='true'>${db[key].title}</span>`
            headerButtons.innerHTML = contentPageButtonsString
            main.innerHTML = `<article contenteditable='true'></article>`
            var article = document.getElementsByTagName('article')[0]
            article.innerHTML = decodeURIComponent(db[key].content).replace(/(?:\r\n|\r|\n)/g, '<br>')
            setEndOfContenteditable(article) // set cursor at the end of text

            itemAddAndEditDRY(key)
        }
    })

    // frontpage initialization
    frontPageInit()

})