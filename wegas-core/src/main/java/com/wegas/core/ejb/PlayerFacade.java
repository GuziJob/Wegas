/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.ejb;

import com.wegas.core.ejb.exception.PersistenceException;
import com.wegas.core.ejb.statemachine.StateMachineRunner;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.game.Team;
import com.wegas.core.persistence.variable.VariableInstance;
import com.wegas.core.security.ejb.UserFacade;
import java.util.List;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class PlayerFacade extends AbstractFacadeImpl<Player> {

    /**
     *
     */
    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;
    /**
     *
     */
    @EJB
    private StateMachineRunner stateMachineRunner;
    @EJB
    private TeamFacade teamEntityFacade;
    @EJB
    private UserFacade userFacade;

    /**
     *
     * @return
     */
    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    /**
     *
     * @param teamId
     * @param player
     */
    public void create(Long teamId, Player player) {
        Team team = teamEntityFacade.find(teamId);
        team.addPlayer(player);
        em.flush();
        em.refresh(player);
        team.getGame().getGameModel().propagateDefaultInstance(false);
        stateMachineRunner.playerUpdated(player);
        //this.create(player);
    }

    /**
     *
     * @param gameId
     * @param userId
     * @return
     * @throws PersistenceException
     */
    public Player findByGameIdAndUserId(Long gameId, Long userId) throws PersistenceException {
        Query findByGameIdAndUserId = em.createNamedQuery("findPlayerByGameIdAndUserId");
        findByGameIdAndUserId.setParameter("gameId", gameId);
        findByGameIdAndUserId.setParameter("userId", userId);
        return (Player) findByGameIdAndUserId.getSingleResult();
    }

    public List<VariableInstance> getAssociatedInstances(Player player) {
        Query findPlayerInstance = em.createNamedQuery("findPlayerInstances");
        return findPlayerInstance.setParameter("playerid", player.getId()).getResultList();
    }

    @Override
    public void remove(Player player) {
        List<VariableInstance> instances = this.getAssociatedInstances(player);
        this.em.remove(player);
        for (VariableInstance i : instances) {
            this.em.remove(i);
        }
    }

    /**
     *
     * @param gameId
     * @return
     */
    public List<Player> findByGameId(Long gameId) {
        Query findByGameId = em.createNamedQuery("findPlayerByGameId");
        findByGameId.setParameter("gameId", gameId);
        return findByGameId.getResultList();
    }

    /**
     *
     * @param g
     * @return
     */
    public Player findCurrentPlayer(Game g) {
        return this.findByGameIdAndUserId(g.getId(), userFacade.getCurrentUser().getId());
    }

    /**
     *
     */
    public PlayerFacade() {
        super(Player.class);
    }
}