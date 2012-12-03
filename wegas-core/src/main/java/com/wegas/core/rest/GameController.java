/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.rest;

import com.wegas.core.ejb.GameFacade;
import com.wegas.core.ejb.GameModelFacade;
import com.wegas.core.ejb.PlayerFacade;
import com.wegas.core.ejb.TeamFacade;
import com.wegas.core.ejb.exception.PersistenceException;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.GameModel;
import com.wegas.core.persistence.game.Team;
import com.wegas.core.security.ejb.UserFacade;
import java.util.Collection;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.persistence.NoResultException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@Path("GameModel/{gameModelId : [1-9][0-9]*}/Game/")
public class GameController extends AbstractRestController<GameFacade, Game> {

    /**
     *
     */
    @EJB
    private GameModelFacade gameModelEntityFacade;
    /**
     *
     */
    @EJB
    private GameFacade gameFacade;
    /**
     *
     */
    @EJB
    private UserFacade userFacade;
    /**
     *
     */
    @EJB
    private TeamFacade teamFacade;
    /**
     *
     */
    @EJB
    private PlayerFacade playerFacade;

    /**
     *
     * @return
     */
    @Override
    public Collection<Game> index() {
        GameModel gameModel = gameModelEntityFacade.find(new Long(this.getPathParam("gameModelId")));
        return gameModel.getGames();
    }

    @Override
    public Game create(Game entity) {
        this.gameFacade.create(new Long(this.getPathParam("gameModelId")), entity);
        return entity;
    }

    /**
     * This method process a string token. It checks if the given token
     * corresponds to a game and then to a team, and return the corresponding
     * result.
     *
     * @param token
     * @return
     */
    @GET
    @Path("/JoinGame/{token : .*}/")
    @Produces(MediaType.APPLICATION_JSON)
    @TransactionAttribute()
    public Object joinGame(@PathParam("token") String token) throws Exception {
        Game game = null;
        Team team = null;
        try {
            team = teamFacade.findByToken(token);                               // we try to lookup for a team entity.
            game = team.getGame();
        }
        catch (PersistenceException e2) {
            try {
                game = gameFacade.findByToken(token);                           // We check if there is game with given token
            }
            catch (PersistenceException e) {
                throw new Exception("Could not find any game associated with this token.");
            }
        }
        try {                                                                   // We check if logged user is already registered in the target game
            playerFacade.findByGameIdAndUserId(
                    game.getId(), userFacade.getCurrentUser().getId());
            throw new Exception("You are already registered to this game.");    // There user is already registered to target game
        }
        catch (PersistenceException e) {                                        // If there is no NoResultException, everything is ok, we can return the game
            return ( team != null ) ? team : game;
        }
    }

    @GET
    @Path("/JoinTeam/{teamId : .*}/")
    @Produces(MediaType.APPLICATION_JSON)
    public Game joinTeam(@PathParam("teamId") Long teamId) {
        return teamFacade.joinTeam(teamId, userFacade.getCurrentUser().getId()).getGame();
    }

    /**
     *
     * @return
     */
    @Override
    protected GameFacade getFacade() {
        return gameFacade;
    }
}