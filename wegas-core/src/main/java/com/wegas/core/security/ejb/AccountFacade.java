/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.security.ejb;

import com.wegas.core.ejb.AbstractFacadeImpl;
import com.wegas.core.security.persistence.AbstractAccount;
import com.wegas.core.security.persistence.AbstractAccount_;
import com.wegas.core.security.persistence.Role;
import java.util.HashSet;
import java.util.Set;
import javax.ejb.EJB;
import javax.ejb.EJBException;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Stateless
@LocalBean
public class AccountFacade extends AbstractFacadeImpl<AbstractAccount> {

    /**
     *
     */
    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;
    /**
     *
     */
    @EJB
    private RoleFacade roleFacade;

    /**
     *
     */
    public AccountFacade() {
        super(AbstractAccount.class);
    }

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
     * @param entityId
     * @param account
     * @return
     */
    @Override
    public AbstractAccount update(final Long entityId, final AbstractAccount account) {
        Set<Role> revivedRoles = new HashSet<>();
        for (Role r : account.getRoles()) {
            try {
                revivedRoles.add(roleFacade.find(r.getId()));
            }
            catch (EJBException e) {
                // not able to revive this role
            }
        }
        AbstractAccount oAccount = super.update(entityId, account);
        oAccount.setRoles(revivedRoles);
        return oAccount;
    }

    /**
     *
     * @param entity
     */
    @Override
    public void create(AbstractAccount entity) {
        getEntityManager().persist(entity);
    }

    /**
     * Return a user based on his principal.
     *
     * @param username
     * @return
     * @throws NoResultException
     */
    public AbstractAccount findByUsername(String username) throws NoResultException {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery cq = cb.createQuery();
        Root<AbstractAccount> account = cq.from(AbstractAccount.class);
        cq.where(cb.equal(account.get(AbstractAccount_.username), username));
        Query q = em.createQuery(cq);
        return (AbstractAccount) q.getSingleResult();
    }

    /**
     *
     * @param email
     * @return
     * @throws NoResultException
     */
    public AbstractAccount findByEmail(String email) throws NoResultException {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery cq = cb.createQuery();
        Root<AbstractAccount> account = cq.from(AbstractAccount.class);
        cq.where(cb.equal(account.get(AbstractAccount_.email), email));
        Query q = em.createQuery(cq);
        return (AbstractAccount) q.getSingleResult();
    }
}