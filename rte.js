// Add AMD/CommonJS boilerplate.
/*global $*/
function RTE(id) {
    var element = $('#' + id);
    this.cursorId = 'elementary-rte-cursor-for' + id;
    var cursor = $('<span id="' + this.cursorId + '" style="border-right: 1px solid #808080; display: inline-block; height: 1em; vertical-align: -3px; margin-right: -1px;"></span>');

    function placeCursor(node, offset) {
        if (node === cursor[0]) { return; }
        if (node.nodeType === 3) {
            node.splitText(offset);
            node.parentNode.insertBefore(cursor[0], node.nextSibling);
            node.parentNode.normalize();
        } else {
            if (node === element[0]) {
                node.insertBefore(cursor[0], node.firstChild);
                moveCursorRightOneStep(true);
            } else {
                node.insertBefore(cursor[0], node.childNodes[offset]);
            }
        }
    }

    function isCursorAtParentLevel() {
        return cursor.parent()[0] === element[0];
    }

    function isCursorAtStartOfEditor() {
        var container = cursor.parent()[0];
        while (container && !container.previousSibling) {
            if (container.parentNode === element[0]) {
                return true;
            }
            container = container.parentNode;
        }
        return false;
    }

    function isWhitespace(textNode) {
        return /^\s*$/.test(textNode.wholeText);
    }

    function moveCursorRightOneStep(stayBeforeText) {
        var cursorElement = cursor[0];
        if (cursorElement.nextSibling) {
            if (cursorElement.nextSibling.nodeType === 1) {
                cursor.prependTo($(cursorElement.nextSibling));
            }
            if (cursorElement.nextSibling.nodeType === 3 && stayBeforeText !== true) {
                var letter;
                if (cursorElement.nextSibling.length > 1 && !isWhitespace(cursorElement.nextSibling)) {
                    cursorElement.nextSibling.splitText(1);
                }
                $(cursorElement.nextSibling).insertBefore(cursor);
            }
        } else {
            // If not at parent level move out
            if (!isCursorAtParentLevel()) {
                cursor.parent()[0].normalize();
                cursor.insertAfter(cursor.parent());
                moveCursorRightOneStep(true);
            }
        }
    }

    function moveCursorLeftOneStep(stayAfterText) {
        var cursorElement = cursor[0];
        if (cursorElement.previousSibling) {
            if (cursorElement.previousSibling.nodeType === 1) {
                cursor.appendTo($(cursorElement.previousSibling));
            }
            if (cursorElement.previousSibling.nodeType === 3 && stayAfterText !== true) {
                var letter;
                if (cursorElement.previousSibling.length > 1 && !isWhitespace(cursorElement.previousSibling)) {
                    cursorElement.previousSibling.splitText(cursorElement.previousSibling.length - 1);
                }
                $(cursorElement.previousSibling).insertAfter(cursor);
            }
        } else {
            // If not at parent level move out
            if (!isCursorAtParentLevel()) {
                cursor.parent()[0].normalize();
                if (!isCursorAtStartOfEditor()) {
                    cursor.insertBefore(cursor.parent());
                    moveCursorLeftOneStep(true);
                }
            }
        }
    }

    function moveCursorDownOneStep() {
        // Normalize parent node.
        // Check the coordinates of the following text nodes
        // If on same line as cursor, look for next sibling of parent
        // Binary search next text node to find coords just below cursor
        // Insert cursor there.
    }

    function resetCursor() {
        cursor.prependTo(element);
        moveCursorRightOneStep(true);
    }

    resetCursor();

    // keyhandler
    var keyhandlers = {
        37: /* left arrow*/ moveCursorLeftOneStep,
        39: /* right arrow */ moveCursorRightOneStep
    };

    element.keydown(function (e) {
        if (keyhandlers[e.keyCode]) {
            keyhandlers[e.keyCode](e);
        }
    });
    element.keypress(function (e) {
        var newText = document.createTextNode(String.fromCharCode(parseInt(e.charCode, 10)));
        $(newText).insertBefore(cursor);
    });

    element.mousedown(function () {
        element[0].focus();
    });
    element.click(function () {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var node = selection.anchorNode;
        placeCursor(node, range.startOffset);
    });

    if (!element.attr('tabindex')) {
        element.attr('tabindex', 0);
    }
}

RTE.create = function (id) {
    if (typeof id !== 'string' || !$('#' + id).length) return null;
    return new RTE(id);
};
