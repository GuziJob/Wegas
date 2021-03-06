/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add("wegas-button", function(Y) {
    "use strict";

    var CONTENTBOX = 'contentBox',
            BOUNDINGBOX = 'boundingBox',
            Button;

    /**
     * @name Y.Wegas.Button
     * @extends Y.Button
     * @borrows Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.Editable
     * @class Custom Button implementation.
     * @constructor
     * @description Custom Button implementation. Adds Y.WidgetChild and
     * Y.Wegas.Widget extensions to the original Y.Button
     */
    Button = Y.Base.create("button", Y.Button, [Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.Editable], {
        /** @lends Y.Wegas.Button# */
        // *** Private fields *** //

        // *** Lifecycle Methods *** //
        /**
         * @function
         * @private
         * @description Set variable with initials values.
         * Plug tooltip add given (by ATTRS) css class to contentbox
         */
        initializer: function() {
            Button.superclass.initializer.apply(this, arguments);

            this.publish("click", {
                emitFacade: true,
                bubbles: true,
                defaultFn: function() {                                         // Force event activation by default
                }
            });
            //this.constructor.CSS_PREFIX = "yui3-button";                      // Revert changes done by Y.Wegas.Widget so styling will work
            this._cssPrefix = "yui3-button";

            if (this.get("cssClass")) {
                this.get(CONTENTBOX).addClass(this.get("cssClass"));
            }

            if (this.get("tooltip")) {
                this.plug(Y.Plugin.Tooltip, {
                    content: this.get("tooltip")
                });
            }
        },
        getEditorLabel: function() {
            return Y.Wegas.Helper.stripHtml(this.get("label"));
        },
        /**
         * @function
         * @private
         * @description Call widget parent to execute its proper render function.
         * add "wegas-button" class to bounding box.
         */
        renderUI: function() {
            Button.superclass.renderUI.apply(this, arguments);
            this.get(BOUNDINGBOX).addClass("wegas-button");
        },
        _getLabel: function(value) {
            return value;
        }
    }, {
        /**
         * @lends Y.Wegas.Button
         */
        EDITORNAME: "Button",
        /**
         * @field
         * @static
         * @description
         * <p><strong>Attributes</strong></p>
         * <ul>
         *    <li>label: the label of the button</li>
         *    <li>data: the data used by the button</li>
         *    <li>tooltip: the tooltip of the button</li>
         *    <li>disabled: boolean to choose state of the button</li>
         *    <li>cssClass: cssClass of the button</li>
         *    <li>plugins: impact to bind at the buttons</li>
         * </ul>
         */
        ATTRS: {
            label: {
                type: "string",
                optional: true
            },
            labelHTML: {
                "transient": true
            },
            data: {},
            tooltip: {
                type: "string",
                optional: true,
                "transient": true
            },
            disabled: {
                type: "boolean",
                _inputex: {
                    wrapperClassName: 'inputEx-fieldWrapper wegas-advanced-feature'
                }
            },
            cssClass: {
                value: null
            }
        }
    });
    Y.namespace('Wegas').Button = Button;

    /* @fixme @hack So we can display html tag inside a button */
    Y.Button.prototype._setLabel = function(label, name, opts) {
        if (!opts || opts.src !== 'internal') {
            this.set('labelHTML', label, {src: 'internal'});
        }
        return label;
    };

    /**
     * Plugin which adds an unread message counter to a widget.
     *
     * @class Y.Wegas.UnreadCount
     * @extends Y.Plugin.Base
     * @borrows Y.Wegas.Plugin, Y.Wegas.Editable
     */
    var UnreadCount = Y.Base.create("wegas-unreadCount", Y.Plugin.Base, [Y.Wegas.Plugin, Y.Wegas.Editable], {
        /** @lends Y.Plugin.UnreadCount# */

        // *** Private fields *** //
        // *** Lifecycle methods *** //
        /**
         * @function
         * @private
         * @description Set variable with initials values.
         */
        initializer: function() {
            this.handlers = {};
            this.bindUI();
        },
        /**
         * @function
         * @private
         * @description bind function to events.
         * When VariableDescriptorFacade is updated, do sync.
         * When plugin's host is render, do sync.
         */
        bindUI: function() {
            this.handlers.update = Y.Wegas.Facade.VariableDescriptor.after("update", this.syncUI, this);
            this.afterHostEvent("render", this.syncUI, this);
        },
        /**
         * @function
         * @private
         * @description call function 'getUnreadCount' to set the number of
         * unread on the host.
         */
        syncUI: function() {
            var cb = this.get('host').get(CONTENTBOX),
                    target = cb.one(".unread-count"),
                    unreadCount = this.getUnreadCount();

            if (!target) {                                                      // If the counter span has not been rendered, do it
                cb.append('<span class="unread-count"></span>');
                target = cb.one(".unread-count");
            }

            if (unreadCount > 0) {                                              // Update the content
                target.setContent("<span class='value'>" + unreadCount + "</span>");
            } else {
                target.setContent("");
            }
        },
        /**
         * @function
         * @private
         * @description Detach all functions created by this widget
         */
        destructor: function() {
            for (var k in this.handlers) {
                this.handlers[k].detach();
            }
        },
        // *** Private methods *** //
        /**
         * @function
         * @private
         * @return Number of unread.
         * @description Count the number of unread reply in given variable.
         */
        getUnreadCount: function() {
            var i, instance, messages, items, count = 0,
                    descriptor = this.get('variable.evaluated');

            if (!descriptor) {
                return 0;
            }

            if (descriptor instanceof Y.Wegas.persistence.ListDescriptor) {     // For ListDescriptors, we count the children instance's
                items = descriptor.flatten();
                for (i = 0; i < items.length; i = i + 1) {
                    if (Y.Wegas.persistence.QuestionDescriptor
                            && items[i] instanceof Y.Wegas.persistence.QuestionDescriptor) {
                        instance = items[i].getInstance();
                        //count += instance.get("unread") ? 1 : 0;
                        if (instance.get("replies")) {
                            count += instance.get("replies").length === 0 && instance.get("active") ? 1 : 0; // only count if it is active
                        }
                    }
                }
            }

            if (descriptor instanceof Y.Wegas.persistence.InboxDescriptor) {
                messages = descriptor.getInstance().get("messages");            // For InboxVariableDescriptors, we count the replies
                count = descriptor.getInstance().get("unreadCount");
//                for (i = 0; i < messages.length; i = i + 1) {
//                    count += messages[i].get("unread") ? 1 : 0;
//                }
            }

            return count;
        }
    }, {
        NS: "UnreadCount",
        NAME: "UnreadCount",
        /**
         * @lends Y.Plugin.UnreadCount
         */
        /**
         * @field
         * @static
         * @description
         * <p><strong>Attributes</strong></p>
         * <ul>
         *    <li>variable: The target variable, returned either based on the name
         *     attribute, and if absent by evaluating the expr attribute.</li>
         * </ul>
         */
        ATTRS: {
            /**
             * The target variable, returned either based on the variableName attribute,
             * and if absent by evaluating the expr attribute.
             */
            variable: {
                getter: Y.Wegas.Widget.VARIABLEDESCRIPTORGETTER,
                _inputex: {
                    _type: "variableselect",
                    label: "List to count unread",
                    classFilter: ["ListDescriptor"]
                }
            }
        }
    });
    Y.namespace('Plugin').UnreadCount = UnreadCount;

    /**
     * @name Y.Wegas.OpenPageButton
     * @extends Y.Wegas.Button
     * @class Shortcut to create a Button with an OpenPageAction plugin
     * @constructor
     * @description Shortcut to create a Button with an OpenPageAction plugin
     */
    Y.Wegas.OpenPageButton = Y.Base.create("button", Y.Wegas.Button, [], {
        /** @lends Y.Wegas.OpenPageButton# */
        /**
         * @function
         * @private
         * @param cfg
         * @description plug the plugin "OpenPageAction" with a given
         *  configuration.
         */
        initializer: function(cfg) {
            this.plug(Y.Plugin.OpenPageAction, cfg);
        }
    });

    Y.Wegas.NewDescriptorButton = Y.Base.create("button", Y.Wegas.Button, [], {
        /** @lends Y.Wegas.NewDescriptorButton# */
        /**
         * @function
         * @private
         * @param cfg
         */
        initializer: function() {
            this.plug(Y.Plugin.WidgetMenu, {
                children: Y.Array.map(Y.Wegas.persistence.ListDescriptor.EDITMENU[1].plugins[0].cfg.children, function(o) {
                    return Y.mix({
                        type: "NewEntityButton"
                    }, o);
                })
            });
        }
    });
});
