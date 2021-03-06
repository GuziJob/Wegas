/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 * @deprecated Not used any more
 * 
 * @module editbutton
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-editor-buttons', function(Y) {
    "use strict";

    var SelectGameButton, SelectPlayerButton;
    /**
     * A button that display all current game's player and that sets the
     * Wegas.Facade.Game.get('currentPlayerId') on click.
     *
     * @class Y.Wegas.SelectPlayerButton
     * @constructor
     * @extends Y.Wegas.Button
     * @param {Object} cfg The button config object
     */
    SelectPlayerButton = Y.Base.create("button", Y.Wegas.Button, [], {
        /** @lends Y.Wegas.SelectPlayerButton# */

        /**
         *  @function
         *  @private
         */
        bindUI: function() {
            SelectPlayerButton.superclass.bindUI.apply(this, arguments);
            this.plug(Y.Plugin.WidgetMenu);

            this.menu.on("button:click", function(e) {
                Y.Wegas.Facade.Game.cache.set('currentPlayerId', e.target.get("data").get("id"));
            });

            Y.Wegas.Facade.Game.after("response", this.syncUI, this);
            Y.Wegas.Facade.Game.cache.after("currentPlayerIdChange", this.syncUI, this);
        },
        /**
         *  @function
         *  @private
         */
        syncUI: function() {
            SelectPlayerButton.superclass.bindUI.apply(this, arguments);
            var j, k, cTeam, menuItems = [],
                    cGame = Y.Wegas.Facade.Game.cache.getCurrentGame(),
                    cPlayer = Y.Wegas.Facade.Game.cache.getCurrentPlayer();

            this.set("label", "Current player: " + cPlayer.get("name"));      // Update the label

            for (j = 0; j < cGame.get("teams").length; j = j + 1) {
                cTeam = cGame.get("teams")[j];

                // if (cTeam.get("players").length == 0) {
                //    continue;
                // }

                menuItems.push({
                    type: "Text",
                    content: "<b>" + cTeam.get("name") + "</b>"
                });

                for (k = 0; k < cTeam.get("players").length; k = k + 1) {
                    cPlayer = cTeam.get("players")[k];
                    menuItems.push({
                        type: "Button",
                        label: cPlayer.get("name"),
                        data: cPlayer
                    });
                }
            }

            this.menu.set("children", menuItems);
        }
    }, {
        /** @lends Y.Wegas.SelectPlayerButton */
        ATTS: {
            entity: {}
        }
    });
    Y.namespace("Wegas").SelectPlayerButton = SelectPlayerButton;

    /**
     * @deprecated It should load game list on demand.
     *  
     * @class Y.Wegas.SelectGameButton
     * @constructor
     * @extends Y.Wegas.Button
     * @param {Object} cfg The button config object
     */
    SelectGameButton = Y.Base.create("button", Y.Wegas.Button, [], {
        /** @lends Y.Wegas.SelectGameButton# */
        bindUI: function() {
            SelectGameButton.superclass.bindUI.apply(this, arguments);
            this.plug(Y.Plugin.WidgetMenu);

            Y.Wegas.Facade.GameIndex.after("response", this.syncUI, this);
        },
        syncUI: function() {
            SelectGameButton.superclass.syncUI.apply(this, arguments);

            var j, menuItems = [],
                    cGame = Y.Wegas.Facade.Game.cache.getCurrentGame(),
                    games = Y.Wegas.Facade.GameIndex.cache.findAll();

            this.set("label", "Current game: " + cGame.get("name"));      // Update the label

            for (j = 0; j < games.length; j = j + 1) {
                menuItems.push({
                    type: "Button",
                    label: games[j].get("name"),
                    plugins: [{
                            fn: "OpenGameAction",
                            cfg: {
                                target: "self",
                                entity: games[j]
                            }
                        }]
                });
            }
            this.menu.set("children", menuItems);
        }
    });
    Y.namespace("Wegas").SelectGameButton = SelectGameButton;

});
