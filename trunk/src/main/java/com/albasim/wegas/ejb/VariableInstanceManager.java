/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.ejb;

import com.albasim.wegas.exception.NotFound;
import com.albasim.wegas.helper.AnonymousEntityMerger;
import com.albasim.wegas.persistence.scope.ScopeEntity;
import com.albasim.wegas.persistence.variabledescriptor.VariableDescriptorEntity;
import com.albasim.wegas.persistence.variableinstance.VariableInstanceEntity;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class VariableInstanceManager {

    private static final Logger logger = Logger.getLogger("EJB_GM");
    @EJB
    private VariableDescriptorManager vdm;
    @EJB
    private WegasEntityManager wem;
    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;

    public VariableInstanceEntity getVariableInstance(Long vID) {
        VariableInstanceEntity v = em.find(VariableInstanceEntity.class, vID);
        return v;
    }

    public VariableInstanceEntity createInstance(Long gameModelId, Long variableDescriptorId, Long userId, VariableInstanceEntity newInstance) {

        VariableDescriptorEntity vd = vdm.getVariableDescriptor(variableDescriptorId);
        ScopeEntity s = vd.getScope();

        s.setVariableInstances(userId, newInstance);

        /*
         * FIXME Does it hurt to create a new entity even although there was already one existing entity
         */
        em.persist(newInstance);
        em.merge(s);
        em.flush();
        //wem.create(newInstance);
        return newInstance;
    }

    public VariableInstanceEntity update(Long variableInstanceId, VariableInstanceEntity variableInstance) {
        VariableInstanceEntity vi = this.getVariableInstance(variableInstanceId);
        vi = (VariableInstanceEntity) AnonymousEntityMerger.merge(vi, variableInstance);
        vi = wem.update(vi);
        return vi;
    }
}
