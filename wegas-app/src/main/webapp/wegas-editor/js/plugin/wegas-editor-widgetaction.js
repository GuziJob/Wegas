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
YUI.add('wegas-editor-widgetaction', function(Y) {
    "use strict";

    var Plugin = Y.Plugin, Action = Y.Plugin.Action, Wegas = Y.Wegas,
            WidgetAction;

    /**
     * @class
     * @name Y.Plugin.WidgetAction
     * @extends Y.Plugin.Action
     * @constructor
     */
    WidgetAction = function() {
        WidgetAction.superclass.constructor.apply(this, arguments);
    };
    Y.extend(WidgetAction, Action, {}, {
        /** @lends Y.Wegas.EntityAction */
        NS: "WidgetAction",
        NAME: "WidgetAction",
        ATTRS: {
            widget: {},
            dataSource: {
                getter: function(val) {
                    if (!val) {
                        return Wegas.Facade.Page;
                    }
                    return val;
                }
            }
        }
    });
    //Plugin.WidgetAction = WidgetAction;

    /**
     * @name Y.Plugin.EditWidgetAction
     * @extends Y.Plugin.WidgetAction
     * @constructor
     */
    var EditWidgetAction = function() {
        EditWidgetAction.superclass.constructor.apply(this, arguments);
    };
    Y.extend(EditWidgetAction, WidgetAction, {
        /**
         * @function
         * @private
         */
        execute: function() {
            Plugin.EditEntityAction.hideRightTabs();
            var widget = this.get("widget"),
                    form = Plugin.EditEntityAction.showEditForm(widget, Y.bind(function(val, entity) {
                        Plugin.EditEntityAction.showEditFormOverlay();
                        var i, plugins = {}, plugin, cfg, oldCfg = entity.get("root").toObject();
                        entity.setAttrs(val);
                        for (i = 0; i < val.plugins.length; i += 1) {
                            plugin = Y.Plugin[Y.Wegas.Plugin.getPluginFromName(val.plugins[i].fn)];
                            if (!Y.Lang.isUndefined(entity._plugins[plugin.NS])) {      //that plugin exists on target
                                entity[plugin.NS].setAttrs(val.plugins[i].cfg);
                                plugins[plugin.NS] = true;                              //store namespace as treated
                            } else {
                                entity.plug(plugin, val.plugins[i].cfg);
                                plugins[plugin.NS] = true;                              //store namespace as treated
                            }
                        }
                        for (i in entity.get("plugins")) {                                    // remove
                            if (Y.Lang.isUndefined(plugins[entity.get("plugins")[i].fn])) {                       //An inexistant namespace
                                entity.unplug(entity.get("plugins")[i].fn);
                            }
                        }
                        cfg = entity.get("root").toObject();
                        if (Y.JSON.stringify(cfg) !== Y.JSON.stringify(oldCfg)) {
                            this.get("dataSource").cache.patch(cfg, Y.bind(function() {
                                entity.fire("AttributesChange", {attrs: val});
                                Plugin.EditEntityAction.hideEditFormOverlay();
                                Plugin.EditEntityAction.showFormMessage("success", "Item has been saved.");
                                this.highlight(Plugin.EditEntityAction.currentEntity, true);
                            }, this));
                        } else {
                            Plugin.EditEntityAction.hideEditFormOverlay();
                        }
                    }, this), Y.bind(function(entity) {
                        if (entity) {
                            this.highlight(entity, false);
                        }
                    }, this)),
                    menuItems = Y.Array.filter(widget.getMenuCfg().slice(0), function(i) {

                        switch (i.label) {                                              // @hack add icons to some buttons
                            case "Delete":
                            case "Edit":
                                i.label = '<span class="wegas-icon wegas-icon-' + i.label.replace(/ /g, "-").toLowerCase() + '"></span>' + i.label;
                        }

                        // return (!i.label || (i.label.indexOf("New") < 0 && i.label.indexOf("Edit") < 0));
                        return (!i.label || (i.label !== "New" && i.label.indexOf("Edit") < 0));
                    });                                                                 // Retrieve menu and remove the first item

            this.highlight(widget, true);
            form.toolbar.add(menuItems).item(0).get("contentBox").setStyle("marginLeft", "10px");
        },
        highlight: function(widget, val) {
            if (!widget.get("destroyed")) {
                if (val || Y.Lang.isUndefined(val)) {
                    widget.get("boundingBox").addClass("highlighted");
                }else{
                    widget.get("boundingBox").removeClass("highlighted");
                }
            }
        }
    }, {
        NS: "EditWidgetAction",
        NAME: "EditWidgetAction"
    });
    Plugin.EditWidgetAction = EditWidgetAction;

    /**
     * @class
     * @name Y.Plugin.AddChildWidgetAction
     * @extends Y.Plugin.WidgetAction
     * @constructor
     */
    var AddChildWidgetAction = function() {
        AddChildWidgetAction.superclass.constructor.apply(this, arguments);
    };
    Y.extend(AddChildWidgetAction, WidgetAction, {
        execute: function() {
            Wegas.Editable.use(this.get("childCfg"), Y.bind(function() { // Load target widget dependencies
                var newWidget = Y.Wegas.Widget.create(this.get("childCfg"));

                Plugin.EditEntityAction.showEditForm(newWidget, Y.bind(function(val) {
                    Plugin.EditEntityAction.showEditFormOverlay();
                    var targetWidget = this.get("widget"), widget = Y.Wegas.Widget.create(val);
                    targetWidget.add(widget);

                    this.get("dataSource").cache.patch(targetWidget.get("root").toObject(), Y.bind(function() {
                        var tw = new Y.Wegas.Text();
                        Plugin.EditEntityAction.showFormMessage("success", "Element has been saved");
                        Plugin.EditEntityAction.hideEditFormOverlay();
                        tw.plug(Plugin.EditWidgetAction, {widget: this});
                        tw.EditWidgetAction.execute();
                    }, widget));
                }, this));
            }, this));
        }
    }, {
        NS: "AddChildWidgetAction",
        NAME: "AddChildWidgetAction",
        ATTRS: {
            childType: {},
            childCfg: {
                value: {},
                getter: function(v) {
                    if (!v.type) {
                        v.type = this.get("childType");
                    }
                    return v;
                }
            }
        }
    });
    Plugin.AddChildWidgetAction = AddChildWidgetAction;

    /**
     * @class
     * @name Y.Plugin.DeleteWidgetAction
     * @extends Y.Plugin.WidgetAction
     * @constructor
     */
    var DeleteWidgetAction = function() {
        DeleteWidgetAction.superclass.constructor.apply(this, arguments);
    };
    Y.extend(DeleteWidgetAction, WidgetAction, {
        execute: function() {
            if (confirm("Are your sure you want to delete this element ?")) {
                var targetWidget = this.get("widget"),
                        root = targetWidget.get("root");
                targetWidget.destroy();
                this.get("dataSource").cache.patch(root.toObject());
            }
        }
    }, {
        NS: "DeleteWidgetAction",
        NAME: "DeleteWidgetAction"
    });
    Plugin.DeleteWidgetAction = DeleteWidgetAction;
    /**
     * @class
     * @name Y.Plugin.DeleteLayoutWidgetAction
     * @extends Y.Plugin.WidgetAction
     * @constructor
     */
    Plugin.DeleteLayoutWidgetAction = function() {
        Plugin.DeleteLayoutWidgetAction.superclass.constructor.apply(this, arguments);
    };
    Y.extend(Plugin.DeleteLayoutWidgetAction, WidgetAction, {
        execute: function() {
            var targetWidget = this.get("widget"),
                    root = targetWidget.get("root");
            if (targetWidget.size() > 0) {
                alert("Please delete content first");
            } else if (confirm("Are your sure your want to delete this widget and all of its content ?")) {
                if (root !== targetWidget) {
                    targetWidget.destroy();
                } else if (targetWidget.item && targetWidget.item(0)) { // @TODO: Panic mode, to change
                    targetWidget.destroyAll();
                }

                this.get("dataSource").cache.patch(root.toObject());
            }
        }
    }, {
        NS: "DeleteLayoutWidgetAction",
        NAME: "DeleteLayoutWidgetAction"
    });

});