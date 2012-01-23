/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.persistence.variabledescriptor;

import com.albasim.wegas.persistence.variableinstance.VariableInstanceEntity;

import com.albasim.wegas.persistence.GameModelEntity;
import com.albasim.wegas.persistence.NamedEntity;
import com.albasim.wegas.persistence.scope.ScopeEntity;
import com.albasim.wegas.persistence.scope.UserScopeEntity;


import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.annotate.JsonSubTypes;
import org.eclipse.persistence.oxm.annotations.XmlInverseReference;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
//@EntityListeners({GmVariableDescriptorListener.class})
@Table(uniqueConstraints =
@UniqueConstraint(columnNames = {"gamemodel_id", "name", "scope_id"}))
@XmlType(name = "VariableDescriptor", propOrder = {"@class", "id", "name", "scope", "defaultVariableInstance"})
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "StringVariableDescriptor", value = StringVariableDescriptorEntity.class),
    @JsonSubTypes.Type(name = "ListVariableDescriptorEntity", value = ListVariableDescriptorEntity.class),
        
})
public class VariableDescriptorEntity extends NamedEntity {

    private static final long serialVersionUID = 1L;
   
    @Id
    @Column(name = "variabledescriptor_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "var_desc_seq")
    private Long id;
    /**
     * 
     */
    @NotNull
    @Pattern(regexp = "^\\w*$")
    private String name;
    /**
     * 
     */
    @OneToOne(cascade = {CascadeType.ALL})
    private VariableInstanceEntity defaultVariableInstance;
  /*  @OneToOne(cascade = CascadeType.ALL)
    @NotNull
    //@JsonManagedReference
    @JoinColumn(name = "SCOPE_ID", unique = true, nullable = false, insertable = true, updatable = true)*/
    @OneToOne(cascade={CascadeType.ALL})
    private ScopeEntity scope;
    /**
     * 
     */
    @ManyToOne
    @JoinColumn(name="gamemodel_id")
    @XmlTransient
    private GameModelEntity gameModel;

    @Override
    
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @XmlTransient
    public void setGameModel(GameModelEntity gameModel) {
        this.gameModel = gameModel;
    }

    @XmlTransient
    @XmlInverseReference(mappedBy="variableDescriptors")
    public GameModelEntity getGameModel() {
        return this.gameModel;
    }

    /**
     * @return the scope
     */
    public ScopeEntity getScope() {
        return scope;
    }

    /**
     * @param scope the scope to set
     */
    public void setScope(UserScopeEntity scope) {
        this.scope = scope;
    }

    @PrePersist
    public void prePersist() {
        this.scope.setVariableDescscriptor(this);
    }

    /**
     * @return the defaultVariableInstance
     */
    public VariableInstanceEntity getDefaultVariableInstance() {
        return defaultVariableInstance;
    }

    /**
     * @param defaultVariableInstance the defaultValue to set
     */
    public void setDefaultVariableInstance(VariableInstanceEntity defaultVariableInstance) {
        this.defaultVariableInstance = defaultVariableInstance;
    }
}
