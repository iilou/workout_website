const daysofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function makeElement(tagName, className, text, attr) {
    var element = document.createElement(tagName);
    element.className = className;
    if (text) {
        element.textContent = text;
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    return element;
}
