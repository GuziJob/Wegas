/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.app.jsf.controllers;

import com.sun.faces.util.Util;
import com.wegas.core.ejb.LibraryFacade;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.GameModel;
import com.wegas.core.persistence.game.Player;
import java.io.Serializable;
import java.util.Locale;
import javax.ejb.EJB;
import javax.faces.bean.ManagedProperty;
import javax.faces.context.FacesContext;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
public class AbstractGameController implements Serializable {

    /**
     *
     */
    @ManagedProperty("#{param.id}")
    protected Long playerId;
    /**
     *
     */
    @EJB
    private LibraryFacade libraryFacade;
    /**
     *
     */
    protected Player currentPlayer = null;

    public Locale calculateLocale(FacesContext context) {
        Util.notNull("context", context);
        Locale locale;

//        if (context.getViewRoot() != null) {
        locale = context.getViewRoot().getLocale();
//        }

//        if (locale != null) {
        return locale;
//        }
//        /**
//         * *******************
//         */
//        // determine the locales that are acceptable to the client based on the
//        // Accept-Language header and the find the best match among the
//        // supported locales specified by the client.
//        Iterator<Locale> locales = context.getExternalContext().getRequestLocales();
//        while (locales.hasNext()) {
//            Locale perf = locales.next();
//            locale = findMatch(context, perf);
////            if (locale != null) {
////                break;
////            }
//        }
//        // no match is found.
//        if (locale == null) {
//            if (context.getApplication().getDefaultLocale() == null) {
//                locale = Locale.getDefault();
//            } else {
//                locale = context.getApplication().getDefaultLocale();
//            }
//        }
//        return locale;
    }

    public String getClientScripts() {
        return libraryFacade.getLibraryContent(this.getCurrentGameModel().getId(), "ClientScript");
    }

    public String getStyleSheets() {
        return libraryFacade.getLibraryContent(this.getCurrentGameModel().getId(), "CSS");
    }

    /**
     *
     * @return the game the game the current player belongs to.
     */
    public Game getCurrentGame() {
        return this.getCurrentPlayer().getTeam().getGame();
    }

    /**
     *
     * @return
     */
    public GameModel getCurrentGameModel() {
        return this.getCurrentGame().getGameModel();
    }

    /**
     * @return the currentPlayer
     */
    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    /**
     * @return the id
     */
    public Long getPlayerId() {
        return playerId;
    }

    /**
     * @param playerId
     */
    public void setPlayerId(final Long playerId) {
        this.playerId = playerId;
    }
}
