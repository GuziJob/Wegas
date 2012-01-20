/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.persistence.users;

import com.albasim.wegas.persistence.AnonymousEntity;
import com.albasim.wegas.persistence.TeamEntity;
import java.io.Serializable;
import java.util.Collection;
import java.util.logging.Logger;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.annotate.JsonTypeInfo;

/**
 *
 * @author maxence
 */
@Entity
@Table(uniqueConstraints =
@UniqueConstraint(columnNames = "name"))
@XmlRootElement
@XmlType(name = "User", propOrder = {"@class", "id", "name"})
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public class UserEntity extends AnonymousEntity {

    private static final Logger logger = Logger.getLogger("UserEntity");
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    private Long id;
    @NotNull
    @javax.validation.constraints.Pattern(regexp = "^\\w+$")
    private String name;
    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "user_team",
    joinColumns = {
        @JoinColumn(name = "teamId")
    },
    inverseJoinColumns = {
        @JoinColumn(name = "userId")
    })
    Collection<TeamEntity> teams;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public AnonymousEntity getParent() {
        return null;
    }
}