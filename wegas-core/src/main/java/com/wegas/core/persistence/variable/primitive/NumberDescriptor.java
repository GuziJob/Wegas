/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.variable.primitive;

import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.variable.VariableDescriptor;
import javax.persistence.Entity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
public class NumberDescriptor extends VariableDescriptor<NumberInstance> {

    private static final long serialVersionUID = 1L;
    private static final Logger logger = LoggerFactory.getLogger(NumberDescriptor.class);
    /**
     *
     */
    private Long minValue;
    /**
     *
     */
    private Long maxValue;

    public NumberDescriptor() {
        super();
    }

    public NumberDescriptor(String name) {
        super(name);
    }

    /**
     *
     * @param a
     */
    @Override
    public void merge(AbstractEntity a) {
        NumberDescriptor other = (NumberDescriptor) a;
        this.setMinValue(other.getMinValue());
        this.setMaxValue(other.getMaxValue());
        super.merge(a);
    }

    /**
     * @return the minValue
     */
    public Long getMinValue() {
        return minValue;
    }

    /**
     * @param minValue the minValue to set
     */
    public void setMinValue(Long minValue) {
        this.minValue = minValue;
    }

    /**
     * @return the maxValue
     */
    public Long getMaxValue() {
        return maxValue;
    }

    /**
     * @param maxValue the maxValue to set
     */
    public void setMaxValue(Long maxValue) {
        this.maxValue = maxValue;
    }

    // **** Sugar for editor *** //
    /**
     *
     * @param p
     * @param value
     */
    public void setValue(Player p, double value) {
        this.getInstance(p).setValue(value);
    }

    /**
     *
     * @param p
     * @param value
     */
    public void setValue(Player p, int value) {
        this.getInstance(p).setValue(value);
    }

    /**
     *
     * @param p
     * @param value
     */
    public void add(Player p, double value) {
        NumberInstance instance = this.getInstance(p);
        instance.setValue(instance.getValue() + value);
    }

    /**
     *
     * @param p
     * @param value
     */
    public void add(Player p, int value) {
        NumberInstance instance = this.getInstance(p);
        instance.setValue(instance.getValue() + value);
    }

    /**
     *
     * @param p
     * @return
     */
    public double getValue(Player p) {
        return this.getInstance(p).getValue();
    }
}