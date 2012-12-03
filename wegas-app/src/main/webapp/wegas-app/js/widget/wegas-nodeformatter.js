/**
 * @author Benjamin Gerber <ger.benjamin@gmail.com>
 */

YUI.add('wegas-nodeformatter', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', NodeFormatter;

    NodeFormatter = Y.Base.create("wegas-nodeformatter", Y.Widget, [Y.Wegas.Widget], {
        makeNodeText: function (value, label, className) {
            var node = Y.Node.create('<div class="nodeformatter-properties"></div>');
            value = (value != null ? value : 'undefine');
            if (className) {
                node.addClass(className);
            }
            if (label) {
                node.append('<span class="label">' + label + '</span>');
            }
            node.append('<span class="value">' + value + '</span>');
            return node;
        },
        makeNodeImage: function (attrs, className) {
            var k, node = new Y.Node.create('<div class="nodeformatter-img"></div>');
            node.append('<img></img>');
            if (className) {
                node.one('img').addClass(className);
            }
            if (typeof attrs !== 'object') {
                return node;
            }
            for (k in attrs) {
                node.one('img').set(k, attrs[k]);
            }
            return node;
        },
        makeNodeValueBox: function (value, maxVal, label, className) {
            var i, acc = [], node = new Y.Node.create('<div class="nodeformatter-valuebox"></div>');
            value = (value != null ? value : 'undefine');
            maxVal = (maxVal || 'undefine');
            label = (label || 'undefine');
            if (className) {
                node.addClass(className);
            }
            for (i = 0; i < value; i += 1) {
                acc.push('<div class="box-unit"></div>');
            }
            node.append('<div class="label">' + label + '</div>');
            node.append('<span class="box-units">' + acc.join('') + '</span>');
            node.append('<span class="box-value">(' + value + '<span class="box-valueMax">/' + maxVal + '</span>)</span>');
            return node;
        },
        makeNodePosition: function (html, selector, value, invert, className) {
            var node = new Y.Node.create('<div class="nodeformatter-position"></div>');
            value = (typeof value === 'number') ? value : -1;
            invert = (invert == 'true') ? true : false;
            if (className) {
                node.addClass(className);
            }
            node.append(html);
            node.all(selector).each(function (n, i, q) {
                i = (invert) ? (q.size() - 1 - i) : i;
                if (i < value) {
                    n.addClass('previous');
                } else if (i == value) {
                    n.addClass('current');
                } else {
                    n.addClass('next');
                }
            });
            return node;
        }

    }, {
        ATTRS: {}
    });

    Y.namespace('Wegas').NodeFormatter = NodeFormatter;
});