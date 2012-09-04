/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.ejb;

import com.wegas.core.persistence.game.Player;
import java.util.Locale;
import java.util.ResourceBundle;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.NamingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <francois-xavier.aeberhard@red-agent.com>
 */
@Stateless
@LocalBean
public class RequestManagerFacade {

    private static final Logger logger = LoggerFactory.getLogger(RequestManagerFacade.class);
    /**
     *
     */
    @Inject
    private RequestManager requestManager;
    /**
     *
     */
    @EJB
    private PlayerFacade playerFacade;

    /**
     * @return the variableInstanceManager
     */
    public RequestManager getRequestManager() {
        return requestManager;
    }

    public void setView(Class view) {
        this.requestManager.setView(view);
    }

    public void setPlayer(Long playerId) {
        Player p = playerFacade.find(playerId);
        //playerFacade.getEntityManager().detach(p);
        this.requestManager.setPlayer(p);
    }

    /**
     *
     * @return The player associated with the current request, if any.
     */
    public Player getPlayer() {
        return this.requestManager.getPlayer();
    }

    public static RequestManagerFacade lookup() {
        try {
            return Helper.lookupBy(RequestManagerFacade.class);
        }
        catch (NamingException ex) {
            logger.error("Error retrieving requestmanager", ex);
            return null;
        }
    }
    
    public ResourceBundle getResourceBundle(){
        return this.requestManager.getResourceBundle();
    }
    
    public void setResourceBundle(Locale lang){
        this.requestManager.setResourceBundle(lang);
    }
}