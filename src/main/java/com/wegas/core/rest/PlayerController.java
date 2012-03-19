/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2011
 */
package com.wegas.core.rest;

import com.wegas.core.ejb.PlayerEntityFacade;
import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.game.GameEntity;
import com.wegas.core.persistence.game.PlayerEntity;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.Path;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@Path("GameModel/{gameModelId : [1-9][0-9]*}/Game/{gameId : [1-9][0-9]*}/Team/{teamId : [1-9][0-9]*}/Player")
public class PlayerController extends AbstractRestController<PlayerEntityFacade> {

    private static final Logger logger = Logger.getLogger("Authoring_GM");
    /**
     *
     */
    @EJB
    private PlayerEntityFacade playerFacade;

    /**
     *
     * @param entity
     * @return
     */
    @Override
    public AbstractEntity create(AbstractEntity entity) {
        playerFacade.create(new Long(this.getPathParam("teamId")), (PlayerEntity) entity);
        return entity;
    }

    /**
     *
     * @return
     */
    @Override
    protected PlayerEntityFacade getFacade() {
        return this.playerFacade;
    }
}