/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add('wegas-editor-form', function(Y) {
    "use strict";

    var CONTENTBOX = "contentBox", inputEx = Y.inputEx, Lang = Y.Lang,
            Wegas = Y.Wegas, Form, EditEntityForm;

    /**
     * @name Y.Wegas.Form
     * @class  Class to submit a form, add a toolbar with buttons "submit" and
     * "cancel" to manage forms.
     * @extends Y.Widget
     * @augments Y.WidgetChild
     * @augments Y.Wegas.Widget
     * @constructor
     */
    Form = Y.Base.create("wegas-form", Y.Widget, [Y.WidgetChild, Wegas.Widget, Wegas.Editable], {
        /**
         * @lends Y.Wegas.Form#
         */
        // ** Lifecycle Methods ** //
        /**
         * @function
         * @private
         * @description plug a toolbar and publich "submit" event.
         */
        initializer: function() {
            this.plug(Y.Plugin.WidgetToolbar);                                  // A toolbar where to place the buttons
            this.publish("submit", {
                emitFacade: true
            });
            this.publish("updated", {
                emitFacade: true
            });
            this.updateTimer = new Wegas.Timer({
                duration: this.get("updateTimeout")
            });
        },
        /**
         * @function
         * @private
         * @description
         */
        bindUI: function() {
            this.on("update", this.updateTimer.reset, this.updateTimer);        // Whenever the form is updated, reset the update time
            this.updateTimer.on("timeOut", function() {
                this.fire("updateTimeOut");
            }, this);
        },
        /**
         * @function
         * @private
         * @description call function "renderToolbar".
         */
        syncUI: function() {
            Y.Array.each(this.get("buttons"), this.addButton, this);            // Render the buttons
            this.renderForm(this.get("cfg"));                                   // Render the form
        },
        /**
         * @function
         * @private
         * @returns {undefined}
         */
        destructor: function() {
            if (this.form) {
                this.form.destroy();
            }
            this.updateTimer.destroy();
        },
        renderForm: function(val) {
            inputEx.use(val, Y.bind(function(val) {                             // Load form dependencies
                var cfg = Y.clone(val);                                         // Duplicate so val will be untouched upon serialization
                Y.mix(cfg, {//                                                  // Add some default properties
                    parentEl: this.get(CONTENTBOX),
                    type: "group",
                    value: this.get("value", {internal: true})
                });
                if (this.form) {                                                // If there's already a form,
                    this.form.destroy();                                        // destroy it
                }
                this.form = inputEx(cfg);                                       // Initialize and render the new form
                //this.form.setValue(this.get("value"), false);                 // Set the form value
                this.form.on("updated", function() {//                          // Whenever a form is updated,
                    this.fire("update");                                        // throw an event
                }, this);

                this.form.parentWidget = this;                                  // @HACK some widgets need this reference
            }, this, val));
        },
        addButton: function(b) {
            b.on = {
                click: Y.bind(function(action) {                                // Push click event to the button, depending on their action field
                    if (!this.form.validate()) {
                        this.showMessageBis("error", "Some fields are not valid");
                        return;
                    }
                    this.fire(action, {
                        value: this.get("value")
                    });
                }
                , this, b.action)
            };
            this.toolbar.add(b);
        }
    }, {
        /** @lends Y.Wegas.Form */
        EDITORNAME: "Form",
        /**
         * <p><strong>Attributes</strong></p>
         * <ul>
         *    <li>value: value of fields of the form</li>
         *    <li>form: the form to manage (see YUI Form)</li>
         *    <li>cfg: configuation of the form (see YUI Form)</li>
         * </ul>
         *
         * @field
         * @static
         */
        ATTRS: {
            /**
             * Values of fields of the form
             */
            value: {
                "transient": true,
                setter: function(val) {
                    if (this.form) {
                        this.form.setValue(val, false);
                    }
                    return val;
                },
                getter: function(val, name, cfg) {
                    if (this.form && (!cfg || !cfg.internal)) {
                        return this.form.getValue();
                    } else {
                        return val;
                    }
                }
            },
            /**
             * Configuation of the form
             */
            cfg: {
                validator: Lang.isObject,
                setter: function(val) {
                    this.renderForm(val);
                    return val;
                },
                _inputex: {
                    legend: "Fields",
                    fields: inputEx.Group.groupOptions
                }
            },
            updateTimeout: {
                "transient": true,
                value: 1000
            },
            buttons: {
                value: [
                    {
                        type: "Button",
                        action: "submit",
                        label: "<span class=\"wegas-icon wegas-icon-save\" ></span>Save"
                    }
                ]
            }
        }
    });
    //Y.namespace("Wegas").Form = Form;

    EditEntityForm = Y.Base.create("wegas-form", Form, [], {
        bindUI: function() {
            EditEntityForm.superclass.bindUI.call(this);

            this.on("update", function() {                                      // When the form is updated,
                if (this.form.validate()) {                                     // display appropriate message in the toolbar
                    this.showMessageBis("success", "Saving...");
                } else {
                    this.showMessageBis("success", "Unable to save");
                }
            });
            this.on("updateTimeOut", this.save);                                // 2 seconds after user has stopped updating, save changes
            this.on("submit", this.save);                                       // Upon submit button click, save changes
        },
        /**
         * @function
         * @private
         * @description call function "renderToolbar".
         */
        syncUI: function() {
            var entity = this.get("entity");

            if ((Wegas.persistence.VariableDescriptor &&
                    (entity instanceof Wegas.persistence.VariableDescriptor
                            || entity instanceof Wegas.persistence.VariableInstance))// Those classes may not be loaded
                    || entity instanceof Wegas.persistence.JpaAccount
                    || entity instanceof Wegas.persistence.GameModel
                    || entity instanceof Wegas.persistence.Game) {              // @fixme we may get extended mode for any entities, just need to check if it causes bugs
                this.showOverlay();
                this.get("dataSource").cache.getWithView(entity, "EditorExtended", {// Retrieve the entity from the source
                    on: {
                        success: Y.bind(function(e) {
                            this.showUpdateForm(e.response.entity);             // and show the form
                            this.hideOverlay();
                        }, this)
                    }
                });
            } else {                                                            // Otherwise,
                this.showUpdateForm(entity);                                    // render the form directy
            }
        },
        showUpdateForm: function(entity) {
            this.set("value", entity.toObject());                               // Set the form value of the form,
            this.set("cfg", this.get("cfg") || entity.getFormCfg());            // and then its fields

            var menuItems = entity.getMenuCfg({dataSource: this.get("dataSource")}).slice(1);
            //var menuItems = Y.Array.filter(entity.getMenuCfg({dataSource: this.get("dataSource")}).slice(1), function(i) {
            //    return (!i.label || (i.label.indexOf("New") < 0 && i.label.indexOf("Edit") < 0));
            //});                                                               // Retrieve menu and remove the first item

            Y.Array.each(menuItems, function(i) {                               // @hack Add icons to some buttons
                switch (i.label) {
                    case "Delete":
                    case "New":
                    case "New element":
                    case "Copy":
                    case "View":
                    case "Open in editor":
                    case "Open":
                    case "Edit":
                        i.label = '<span class="wegas-icon wegas-icon-' + i.label.replace(/ /g, "-").toLowerCase() + '"></span>' + i.label;
                }
            });
            this.toolbar.add(menuItems);                                        // Add menu items to the form
        },
        save: function() {
            if (!this.form.validate()) {
                return;
            }

            this.get("dataSource").cache.put(this.get("value"), {
                on: {
                    success: Y.bind(function() {
                        this.showMessageBis("success", "All changes saved");
                    }, this),
                    failure: Y.bind(this.defaultFailureHandler, this)
                }
            });
        }
    }, {
        ATTRS: {
            entity: {},
            dataSource: {
                getter: function(val) {
                    if (Lang.isString(val)) {
                        return Wegas.Facade[val];
                    }
                    return val;
                }
            },
            buttons: {
                value: []
            }
        }
    });
    Y.namespace('Wegas').EditEntityForm = EditEntityForm;
});
