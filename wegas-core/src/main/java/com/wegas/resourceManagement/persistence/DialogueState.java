/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.resourceManagement.persistence;

import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.variable.statemachine.State;
import javax.persistence.Entity;
import javax.persistence.Lob;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
public class DialogueState extends State {

    /**
     *
     */
    @Lob
    private String text;

    /**
     * @return the text
     */
    public String getText() {
        return text;
    }

    /**
     * @param text the text to set
     */
    public void setText(String text) {
        this.text = text;
    }

    @Override
    public void merge(AbstractEntity other) {
        this.text = ((DialogueState) other).text;
        super.merge(other);
    }
}
