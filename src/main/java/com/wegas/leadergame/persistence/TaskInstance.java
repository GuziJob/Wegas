/*
 * Wegas.
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.leadergame.persistence;

import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.variable.VariableInstance;
import java.util.Map;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
public class TaskInstance extends VariableInstance {

    private static final long serialVersionUID = 1L;
    /**
     *
     */
    private Boolean active = true;
    /**
     *
     */
    @ElementCollection
    private Map<String, String> properties;
    /**
     *
     */
    @ElementCollection
    private Map<String, String> skillset;

    /**
     *
     * @param a
     */
    @Override
    public void merge(AbstractEntity a) {
        TaskInstance other = (TaskInstance) a;
        this.setActive(other.getActive());
        this.properties.clear();
        this.properties.putAll(other.getProperties());
        this.skillset.clear();
        this.skillset.putAll(other.getProperties());
    }

    /**
     * @return the active
     */
    public Boolean getActive() {
        return active;
    }

    /**
     * @param active the active to set
     */
    public void setActive(Boolean active) {
        this.active = active;
    }

    /**
     * @return the properties
     */
    public Map<String, String> getProperties() {
        return properties;
    }

    /**
     * @param properties the properties to set
     */
    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

    /**
     *
     * @param key
     * @param val
     */
    public void setProperty(String key, String val) {
        this.properties.put(key, val);
    }

    /**
     *
     * @param key
     * @return
     */
    public String getProperty(String key) {
        return this.properties.get(key);
    }
    
    /**
     * @return the skillset
     */
    public Map<String, String> getSkillset() {
        return skillset;
    }

    /**
     * @param skillset the skillset to set
     */
    public void setSkillset(Map<String, String> skillset) {
        this.skillset = skillset;
    }

    /**
     *
     * @param key
     * @param val
     */
    public void setSkillset(String key, String val) {
        this.skillset.put(key, val);
    }

    /**
     *
     * @param key
     * @return
     */
    public String getSkillset(String key) {
        return this.skillset.get(key);
    }
}
