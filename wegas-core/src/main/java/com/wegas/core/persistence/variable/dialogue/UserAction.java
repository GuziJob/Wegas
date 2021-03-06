/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.variable.dialogue;

import com.wegas.core.persistence.game.Script;
import java.io.Serializable;
import java.util.Map;
import javax.persistence.*;
import javax.xml.bind.annotation.XmlType;

/**
 *
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
//@Entity
@Table(name = "user_action",
uniqueConstraints = {
    @UniqueConstraint(columnNames = {"dialogue_id", "name"})
})
@XmlType(name = "")
public class UserAction implements Serializable {

    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    @JoinColumn(name = "dialogue_id", nullable = false)
    private DialogueDescriptor dialogue;
    @Column(name = "label")
    private String label;
    @Column(name = "name")
    private String name;
    private String notes;
    @Embedded
    private Script impact;
    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL)
    @MapKeyColumn(name = "response_name", insertable = false, updatable = false)
    private Map<String, ResponseModel> responseModels;

    /**
     *
     */
    public UserAction() {
    }

    /**
     *
     * @return
     */
    public DialogueDescriptor getDialogue() {
        return dialogue;
    }

    /**
     *
     * @param dialogue
     */
    public void setDialogue(DialogueDescriptor dialogue) {
        this.dialogue = dialogue;
    }

    /**
     *
     * @return
     */
    public Long getId() {
        return id;
    }

    /**
     *
     * @return
     */
    public Script getImpact() {
        return impact;
    }

    /**
     *
     * @param impact
     */
    public void setImpact(Script impact) {
        this.impact = impact;
    }

    /**
     *
     * @return
     */
    public String getLabel() {
        return label;
    }

    /**
     *
     * @param label
     */
    public void setLabel(String label) {
        this.label = label;
    }

    /**
     *
     * @return
     */
    public String getName() {
        return name;
    }

    /**
     *
     * @param name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     *
     * @return
     */
    public String getNotes() {
        return notes;
    }

    /**
     *
     * @param notes
     */
    public void setNotes(String notes) {
        this.notes = notes;
    }

    /**
     *
     * @return
     */
    public Map<String, ResponseModel> getResponseModels() {
        return responseModels;
    }

    /**
     *
     * @param responseModels
     */
    public void setResponseModels(Map<String, ResponseModel> responseModels) {
        this.responseModels = responseModels;
    }

    @Override
    public String toString() {
        return "UserAction{" + "id=" + id + ", label=" + label + ", name=" + name + ", notes=" + notes + ", impact=" + impact + ", responseModels=" + responseModels + '}';
    }
}
