//---------general helpers-----------//

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value))
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key)
    return value && JSON.parse(value)
}

function generateUUID(){ // from: http://stackoverflow.com/a/8809472/4932305
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function") {
        d += performance.now();; //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
}

function setEndOfContenteditable(contentEditableElement) // from: http://stackoverflow.com/a/3866442/4932305
{
    var range,selection;
    range = document.createRange()
    range.selectNodeContents(contentEditableElement)
    range.collapse(false)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}

//---------app specific helpers-----------//

function getDBFromLocalStorage() {
    if(localStorage.getObject('writerDB') === null) { // if writerDB key doesn't exist in localStorage
        // create a writerDB key in localStorage with an empty object as its value
        localStorage.setObject('writerDB', {})
    }
    return localStorage.getObject('writerDB')
}

function updateTitle(key, title) {
    var db = localStorage.getObject('writerDB') // get latest object
    if(key in db) { // if item exists
        db[key].title = title
        db[key].lastModifiedOn = new Date()
    } else { // create item because it doesn't exist
        db[key] = {
            title : title,
            content : '',
            createdOn : new Date(),
            lastModifiedOn: new Date()
        }
    }
    localStorage.setObject('writerDB', db) // save modified object
}

function updateContent(key, content) {
    var db = localStorage.getObject('writerDB') // get latest object
    if(key in db) { // if item exists
        db[key].content = content
        db[key].lastModifiedOn = new Date()
    } else { // create item because it doesn't exist
        db[key] = {
            title : '',
            content : content,
            createdOn : new Date(),
            lastModifiedOn: new Date()
        }
    }
    localStorage.setObject('writerDB', db) // save modified object
}

// dispose all items that have empty 'content' & 'title' fields
function removeEmptyItems() {
    var db = localStorage.getObject('writerDB') // get latest object
    Object.keys(db).forEach(function(key) {
        if(db[key]['title'] === "" && db[key]['content'] === "") deleteItem(key)
    })
}
 
function deleteItem(key) {
    var db = localStorage.getObject('writerDB') // get latest object
    if(key in db) delete db[key]
    localStorage.setObject('writerDB', db) // save modified object
}