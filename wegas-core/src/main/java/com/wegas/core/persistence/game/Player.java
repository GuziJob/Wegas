/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.game;

import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.security.persistence.User;
import java.util.logging.Logger;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlTransient;
import org.codehaus.jackson.annotate.JsonBackReference;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
@NamedQueries({
    @NamedQuery(name = "findPlayerByGameId", query = "SELECT player FROM Player player WHERE player.team.game.id = :gameId"),
    @NamedQuery(name = "findPlayerByGameIdAndUserId", query = "SELECT player FROM Player player WHERE player.user.id = :userId AND player.team.game.id = :gameId")
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class Player extends AbstractEntity {

    private static final Logger logger = Logger.getLogger("PlayerEntity");
    @Id
    @GeneratedValue
    private Long id;
    /**
     *
     */
    @ManyToOne(cascade = {CascadeType.PERSIST})
    private User user;
    /**
     *
     */
    private String name;
    /**
     * The game model this belongs to
     */
    @ManyToOne
    @NotNull
    @JsonBackReference(value = "player-team")
    @JoinColumn(name = "parentteam_id")
    //@XmlInverseReference(mappedBy = "players")
    private Team team;
    /**
     *
     */
    @Column(name = "parentteam_id", nullable = false, insertable = false, updatable = false)
    private int teamId;

    /**
     *
     */
    public Player() {
    }

    /**
     *
     * @param name
     */
    public Player(String name) {
        this.name = name;
    }

    /**
     *
     * @param a
     */
    @Override
    public void merge(AbstractEntity a) {
        Player p = (Player) a;
        this.setName(p.getName());
    }

    /**
     *
     * @return
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @return the user
     */
    @JsonBackReference(value = "player-user")
    public User getUser() {
        return user;
    }

    /**
     * @param user the user to set
     */
    @JsonBackReference(value = "player-user")
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * @return the team
     */
    @JsonBackReference(value = "player-team")
    public Team getTeam() {
        return team;
    }

    /**
     * @param team the team to set
     */
    @JsonBackReference(value = "player-team")
    public void setTeam(Team team) {
        this.team = team;
    }

    /**
     * @return the teamId
     */
    public int getTeamId() {
        return teamId;
    }

    // *** Sugar *** //
    /**
     *
     * @return
     */
    @XmlTransient
    @JsonIgnore
    public GameModel getGameModel() {
        return this.getTeam().getGame().getGameModel();
    }
    @XmlTransient
    @JsonIgnore
    public int getGameModelId() {
        return this.getTeam().getGame().getGameModel().getId().intValue();
    }


    /**
     *
     * @return
     */
    @XmlTransient
    @JsonIgnore
    public Game getGame() {
        return this.getTeam().getGame();
    }
    @XmlTransient
    @JsonIgnore
    public int getGameId() {
        return this.getTeam().getGame().getId().intValue();
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }
}