/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-widgettoolbar', function (Y) {
    "use strict";

    /**
     *  @class Wegas.WidgetToolbar
     *  @module Wegas
     *  @constructor
     */
    var  WidgetToolbar = function () {
        WidgetToolbar.superclass.constructor.apply(this, arguments);
    };

    Y.extend(WidgetToolbar, Y.Plugin.Base, {

        // *** Lifecycle methods *** //
        initializer: function () {
            this.children = [];
            this.render();
        //this.afterHostEvent("render", this.render, this);
        },

        destructor: function () {
            var i;
            for (i = 0; i < this.children.length; i = i + 1) {
                this.children[i].destroy();
            }
        },

        // *** Private methods *** //
        render: function () {
            var i, host = this.get("host"),
            children = this.get("children");
            host.get('boundingBox').addClass("wegas-hastoolbar")
            .append('<div class="wegas-toolbar"><div class="wegas-toolbar-header"></div><div class="wegas-toolbar-panel"></div></div>');
            host.get('contentBox').addClass("wegas-toolbar-sibling");

            for (i = 0; i < children.length; i = i + 1) {
                this.children.push(this.add(children[i]));
            }
        },

        add: function (widget) {
            if (!(widget instanceof Y.Widget)) {
                widget = Y.Wegas.Widget.create(widget);
            }
            widget.render(this.get("header"));
            widget.addTarget(this.get("host"));
            return widget;
        },
        item: function (index) {
            return this.children[index];
        }

    }, {
        NS: "toolbar",
        NAME: "toolbar",
        ATTRS: {
            children: {
                value: []
            },
            header: {
                lazyAdd: false,
                value: false,
                getter : function () {
                    return this.get("host").get('boundingBox').one(".wegas-toolbar-header");
                }
            },
            panel: {
                lazyAdd: false,
                value: false,
                getter : function () {
                    return this.get("host").get('boundingBox').one(".wegas-toolbar-panel");
                }
            }
        }
    });

    Y.namespace('Plugin').WidgetToolbar = WidgetToolbar;
});


