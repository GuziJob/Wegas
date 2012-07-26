/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */

/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-editor-treeview', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', WTreeView,
    EDITBUTTONTPL = "<span class=\"wegas-treeview-editmenubutton\"></span>";

    WTreeView = Y.Base.create("wegas-treeview", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget], {

        // *** Private fields ** //
        dataSource: null,
        treeView: null,

        // ** Lifecycle methods ** //
        initializer: function () {
            this.dataSource = Y.Wegas.app.dataSources[this.get('dataSource')];
        },

        renderUI: function () {
            this.treeView = new Y.TreeView();
            this.treeView.render(this.get(CONTENTBOX));
            this.menu = new Y.Wegas.Menu();
        },

        bindUI: function () {
            this.dataSource.after("response", this.syncUI, this);               // Listen updates on the target datasource

            this.treeView.on("treeleaf:click", this.onTreeViewClick, this);
            this.treeView.on("treenode:click", this.onTreeViewClick, this);
        },

        syncUI: function () {
            var treeViewElements = this.genTreeViewElements(this.dataSource.rest.getCache());
            this.treeView.removeAll();
            this.treeView.add(treeViewElements);
        },

        destroyer: function () {
            this.treeView.destroy();
            this.menu.destroy();
        },

        // ** Private methods ** //

        setItemsByEntity: function(entity, dataSource) {

        },

        // *** Private Methods *** //
        _onMenuClick: function (p_sType, args) {
            var menuItem = args[1],
            action = menuItem.value;

            switch (action.op) {
                case "addChild":
                    Y.Wegas.editor.edit({
                        '@class': action.childClass
                    }, function (value) {
                        this._currentDataSource.rest.post(value, this._currentData);
                    }, null, this);
                    break;
                case "delete":
                    this._currentDataSource.rest.deleteObject(this._currentData);
                    break;
                case "smeditor":
                    Y.Widget.getByNode(".yui3-wegas-statemachineviewer").set("entity", this._currentData); //TODO: create elsewhere
                    break;
            }
            this.hide();
        },
        onTreeViewClick: function (e) {

            Y.log(e.target.get("label") + " label was clicked", "info", "Wegas.WTreeView");

            var entity = e.target.get("data"),
            menuItems = entity.getMenuCfg(this.dataSource),
            domTarget = (e.domEvent) ? e.domEvent.target : e.details[0].domEvent.target;


            e.halt(true);                                                       // Stop the event so parent TreeNodes events wont execute
            e.stopPropagation();
            e.preventDefault();

            if (menuItems.length == 0) {
                return;
            }

            this.menu.removeAll();                                              // Populate the menu with the elements associated to the
            this.menu.add(menuItems);

            if (domTarget && domTarget.hasClass("wegas-treeview-editmenubutton")){           // If user clicked on the edit button
                this.menu.attachTo(domTarget);                                  // Display the edit button next to it
            } else {                                                            // Otherwise the user clicked on the node
                this.menu.item(0).fire("click");                                // Excute the actions associated to the first item of the menu
            }
        },

        genTreeViewElements: function (elements) {
            var ret = [], i, el, text;

            for (i in elements) {
                if (elements.hasOwnProperty(i)) {
                    el = elements[i];

                    if (el.get &&
                        (this.get("excludeClasses") === null
                            || !this.get('excludeClasses').hasOwnProperty(el['@class']))
                        && (this.get('includeClasses') === null
                            || this.get('includeClasses').hasOwnProperty(el['@class']))) {

                        switch (el.get('@class')) {
                            case 'StringDescriptor':
                            case 'NumberDescriptor':
                            case 'InboxDescriptor':
                            case 'ChoiceDescriptor':
                            case 'TriggerDescriptor':
                            case 'TaskDescriptor':
                            case 'ResourceDescriptor':
                            case 'DialogueDescriptor':
                                text = el.get('@class').replace("Descriptor", "") + ': ' + el.get("name");
                                ret.push({
                                    type: 'TreeNode',
                                    label: text,
                                    children: this.genScopeTreeViewElements(el),
                                    data: el,
                                    iconCSS: "wegas-icon-variabledescriptor",
                                    rightWidget: Y.Node.create(EDITBUTTONTPL)
                                //iconCSS: "wegas-icon-" + el.get('@class')
                                });
                                break;

                            case 'ListDescriptor':
                            case 'QuestionDescriptor':
                                text = el.get('@class').replace("Descriptor", "") + ': ' + el.get("name");
                                ret.push({
                                    type: 'TreeNode',
                                    label: text,
                                    children: this.genTreeViewElements(el.get("items")),
                                    data: el,
                                    rightWidget: Y.Node.create(EDITBUTTONTPL)
                                });
                                break;

                            case 'Game':
                                text = 'Game: ' + el.get("name") + ' (token:' + el.get("token") + ')';
                                ret.push({
                                    type: 'TreeNode',
                                    label: text,
                                    collapsed: false,
                                    children: this.genTreeViewElements(el.get("teams")),
                                    data: el,
                                    iconCSS: 'wegas-icon-game',
                                    rightWidget: Y.Node.create(EDITBUTTONTPL)
                                });
                                break;

                            case 'Team':
                                text = 'Team: ' + el.get("name");
                                ret.push({
                                    type: 'TreeNode',
                                    label: text,
                                    children: this.genTreeViewElements(el.get("players")),
                                    data: el,
                                    iconCSS: 'wegas-icon-team',
                                    rightWidget: Y.Node.create(EDITBUTTONTPL)
                                });
                                break;

                            case 'Player':
                                ret.push({
                                    label: 'Player: ' + el.get("name"),
                                    data: el,
                                    iconCSS: 'wegas-icon-player',
                                    rightWidget: Y.Node.create(EDITBUTTONTPL)
                                });
                                break;

                            default:
                                text = el.get('@class') + ': ' + el.get("name");
                                ret.push({
                                    label: text,
                                    data: el
                                });
                                break;

                            case 'Page':
                                text = 'Page: ' + el.label;
                                //                                ret.push({
                                //                                    type: 'Text',
                                //                                    label: text,
                                //                                    title: text,
                                //                                    expanded: true,
                                //                                    children: this.genPageTreeViewElements(el.children),
                                //                                    data: el
                                //                                });
                                break;

                        //                            case 'GameModel':
                        //                                text = 'Game model: ' + el.get("name");
                        //                                ret.push({
                        //                                    //  type:'Text',
                        //                                    label: text,
                        //                                    //  title: text,
                        //                                    expanded: true,
                        //                                    children: this.genTreeViewElements(el.get("games")),
                        //                                    data: el
                        //                                });
                        //                                break;
                        }
                    }
                }
            }
            return ret;
        },

        genScopeTreeViewElements: function (el) {
            var children = [], i, label, team, player, instance;

            for (i in el.get("scope").get("variableInstances")) {
                if (el.get("scope").get("variableInstances").hasOwnProperty(i)) {
                    instance = el.get("scope").get("variableInstances")[i];
                    label = '';
                    switch (el.get("scope").get('@class')) {
                        case 'PlayerScope':
                            player = Y.Wegas.GameFacade.rest.getPlayerById(i);
                            label = (player) ? player.get("name") : "undefined";
                            break;
                        case 'TeamScope':
                            team = Y.Wegas.GameFacade.rest.getTeamById(i);
                            label = (team) ? team.get("name") : "undefined";
                            break;
                        case 'GameScope':
                        case 'GameModelScope':
                            label = 'Global';
                            break;
                    }
                    children.push(this.genVariableInstanceElements(label, instance));
                }
            }
            return children;
        },

        genVariableInstanceElements: function (label, el) {
            var l;
            switch (el.get('@class')) {
                case 'StringInstance':
                case 'NumberInstance':
                case 'ListInstance':
                    return {
                        label: label + ': ' + el.get("value"),
                        data: el
                    };

                case 'QuestionInstance':
                    l = label + ((el.get("replies").length > 0) ? ': ' + el.get("replies").get("name") : ': unanswered');
                    return {
                        label: l,
                        data: el
                    };

                case 'InboxInstance':
                    var k, children = [];

                    label += "(" + el.get("messages").length + ")";

                    for (k = 0; k < el.get("messages").length; k += 1) {
                        children.push({
                            label: el.get("messages")[k].get("subject")
                        //data: el.get("messages")[k]
                        });
                    }
                    return {
                        type: 'TreeNode',
                        label: label,
                        data: el,
                        children: children
                    };

                default:
                    return {
                        label: label,
                        data: el
                    };
            }
        },

        genPageTreeViewElements: function (elts) {
            var ret = [], j, text, el,
            type2text = {
                PMGChoiceDisplay: "Choice displayer"
            };

            for (j = 0; j < elts.length; j += 1) {
                el = elts[j];
                text = (type2text[el.type] || el.type) + ': ' + (el.label || el.name || el.id || 'unnamed');
                switch (el.type) {
                    case 'List':
                        ret.push({
                            type: 'Text',
                            label: 'List: ' + (el.label || 'unnamed'),
                            title: 'List: ' + (el.label || 'unnamed'),
                            data: el,
                            children: this.genPageTreeViewElements(el.children)
                        });
                        break;
                    case 'VariableDisplay':
                        text = 'Variable displayer: ' + (el.variable);
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el
                        });
                        break;
                    case 'Text':
                        ret.push({
                            type: 'Text',
                            label: 'Text: ' + el.content.substring(0, 15) + "...",
                            title: el.content,
                            data: el
                        });
                        break;
                    case 'Button':
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el,
                            children: (el.subpage) ? this.genPageTreeViewElements([el.subpage]) : []
                        });
                        break;
                    default:
                        ret.push({
                            type: 'Text',
                            label: text,
                            title: text,
                            data: el
                        });
                        break;

                }
            }
            return ret;
        }
    }, {
        ATTRS : {
            includeClasses: {
                value: null
            },
            excludeClasses: {
                value: null
            },
            dataSource: {}
        }
    });


    Y.namespace('Wegas').WTreeView = WTreeView;
});