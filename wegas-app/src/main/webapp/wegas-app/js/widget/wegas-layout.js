/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @fileOverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add("wegas-layout", function(Y) {
    "use strict";
    /**
     * @extends Y.Wegas.Widget
     * @constructor
     * @returns {undefined}
     */
    function Layout() {
        Y.Wegas.Widget.apply(this, arguments);
        /*Check for Y.WidgetParent*/
        if (!this._add) {
            Y.log("Extension 'Y.WidgetParent' must be defined before Y.Wegas.Layout in " + this.constructor.NAME,
                    "error", "Y.Wegas.Layout");
        }
        /*Check for Y.Wegas.Editable*/
        if (!this.toJSON) {
            Y.log("Extension 'Y.Wegas.Editable' must be defined before Y.Wegas.Layout in " + this.constructor.NAME,
                    "error", "Y.Wegas.Layout");
        }
        this.onceAfter("render", function() {
            this.get("boundingBox").addClass("wegas-layout");
        });
    }
    /* Copy prototype , extension -> no proto chain copy // 'extends' */
    Y.mix(Layout.prototype, Y.Wegas.Widget.prototype);
    /* And override it */
    Y.mix(Layout.prototype, {
        /**
         * @function
         * @public
         * @return object
         * @description Children serialization
         */
        toObject: function() {
            var i, object, children = [], args = Array.prototype.slice.call(arguments);
            object = Y.Wegas.Editable.prototype.toObject.apply(this, args);
            for (i = 0; i < this.size(); i = i + 1) {
                children.push(this.item(i).toObject(args));
            }
            object.children = children;
            return object;
        },
        getEditorLabel: function() {
            return;
        }
    }, true);
    Y.mix(Layout, {
        ATTRS: Y.mix({
            defaultChildType: {
                value: "Text",
                "transient": true
            },
            children: {
                "transient": true
            },
            root: {
                "transient": true
            },
            parent: {
                "transient": true
            }
        }, Y.Wegas.Widget.ATTRS),
        EDITMENU: [{
                type: "Button",
                label: "Edit",
                plugins: [{
                        fn: "EditWidgetAction"
                    }
                ]
            }, {
                type: "Button",
                label: "New element",
                plugins: [{
                        fn: "WidgetMenu",
                        cfg: {
                            //menuCfg: {
                            //    points: ["tl", "tr"]
                            //},
                            //event: "mouseenter",
                            children: [{
                                    type: "Button",
                                    label: "Element",
                                    plugins: [{
                                            fn: "WidgetMenu",
                                            cfg: {
                                                menuCfg: {
                                                    points: ["tl", "tr"]
                                                },
                                                event: "mouseenter",
                                                children: [{
                                                        type: "Button",
                                                        label: "Box",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childCfg: {
                                                                        type: "Box",
                                                                        plugins: [{
                                                                                fn: "CSSBackground",
                                                                                cfg: {
                                                                                    styles: {
                                                                                        backgroundColor: "#c8c8c8"
                                                                                    }
                                                                                }
                                                                            }]
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Text",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Text"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Image",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Image"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Button",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Button"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Form",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Form"
                                                                }
                                                            }
                                                        ]
                                                    }]
                                            }
                                        }
                                    ]}, {
                                    type: "Button",
                                    label: "Variable display",
                                    plugins: [{
                                            fn: "WidgetMenu",
                                            cfg: {
                                                menuCfg: {
                                                    points: ["tl", "tr"]
                                                },
                                                event: "mouseenter",
                                                children: [{
                                                        type: "Button",
                                                        label: "Template",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Template"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Gauge",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "GaugeDisplay"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Question list",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "MCQTabView"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Inbox",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "InboxDisplay"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Chart",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "Chart"
                                                                }
                                                            }]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }, {
                                    type: "Button",
                                    label: "Layouts",
                                    plugins: [{
                                            fn: "WidgetMenu",
                                            cfg: {
                                                menuCfg: {
                                                    points: ["tl", "tr"]
                                                },
                                                event: "mouseenter",
                                                children: [{
                                                        type: "Button",
                                                        label: "SlideShow",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childCfg: {
                                                                        type: "ChoiceList",
                                                                        plugins: [{
                                                                                fn: "SlideShow"
                                                                            }]
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Tabview",
                                                        cssClass: "wegas-advanced-feature",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "TabView"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Page display",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "PageLoader"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "List",
                                                        cssClass: "wegas-advanced-feature",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "List"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Choice list",
                                                        cssClass: "wegas-advanced-feature",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "ChoiceList"
                                                                }
                                                            }
                                                        ]
                                                    }, {
                                                        type: "Button",
                                                        label: "Absolute layout",
                                                        cssClass: "wegas-advanced-feature",
                                                        plugins: [{
                                                                fn: "AddChildWidgetAction",
                                                                cfg: {
                                                                    childType: "AbsoluteLayout"
                                                                }
                                                            }
                                                        ]
                                                    }

                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }, {
                type: "Button",
                label: "Delete",
                plugins: [{
                        fn: "DeleteLayoutWidgetAction"
                    }
                ]
            }],
        _buildCfg: {
            aggregate: ["EDITMENU"]
        }
    });
    Y.namespace("Wegas").Layout = Layout;
});
