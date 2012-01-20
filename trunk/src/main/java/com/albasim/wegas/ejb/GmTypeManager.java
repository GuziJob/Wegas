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

import com.albasim.wegas.exception.InvalidContent;
import com.albasim.wegas.exception.NotFound;
import com.albasim.wegas.persistence.GameModel;
import com.albasim.wegas.persistence.GmEnumItem;
import com.albasim.wegas.persistence.GmMethod;
import com.albasim.wegas.persistence.GmType;
import com.albasim.wegas.persistence.GmUserEvent;
import com.albasim.wegas.persistence.VariableDescriptorEntity;
import com.albasim.wegas.persistence.type.GmComplexType;
import com.albasim.wegas.persistence.type.GmEnumType;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class GmTypeManager {

    private static final Logger logger = Logger.getLogger("EJB_GM");


    @EJB
    private WegasEntityManager aem;


    @EJB
    private GameModelManager gmm;


    @EJB
    private GmMethodManager mm;


    @EJB
    private VariableDescriptorManager vdm;


    @EJB
    private GmEnumItemManager eim;


    @EJB
    private GmUserEventManager uem;


    @EJB
    private Dispatcher dispatcher;


    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;


    /**
     * Resolve a type name of a game-design, by looking in the database (not yet persisted type
     * will not been found...)
     * 
     * @param gm the game-model which belongs the type
     * @param type the type name to look for
     * @return the type if found, null otherwise
     */
    public GmType resolveTypeName(GameModel gm, String type) {
        if (type != null && gm != null && !type.isEmpty()) {
            Object singleResult = em.createQuery("SELECT t from GmType t WHERE t.gameModel.id = ?1 AND t.name = ?2").setParameter(1, gm.getId()).setParameter(2, type).getSingleResult();
            if (singleResult instanceof GmType) {
                return (GmType) singleResult;
            }
        }
        return null;
    }


    /**
     * Resolve a type name of a game-design, by looking in the database (not yet persisted type
     * will not been found...)
     * The targeted type shall be an instance of ComplexType
     * 
     * @param gm the game-model which belongs the type
     * @param type the complex type name to look for
     * @return the type if found, null otherwise
     */
    public GmComplexType resolveComplexTypeName(GameModel gm, String type) {
        if (type != null && gm != null && !type.isEmpty()) {
            Object singleResult = em.createQuery("SELECT t from GmComplexType t WHERE t.gamemodel.id = ?1 AND t.name = '?2'").setParameter(1, gm.getId()).setParameter(2, type).getSingleResult();
            if (singleResult instanceof GmComplexType) {
                return (GmComplexType) singleResult;
            }
        }
        return null;
    }


    /**
     * Resolve a type name of a game-design, by looking in the database (not yet persisted type
     * will not been found...)
     * The targeted type shall be an instance of EnumType
     * 
     * @param gm the game-model which belongs the type
     * @param type the enum type name to look for
     * @return the type if found, null otherwise
     */
    public GmEnumType resolveEnumTypeName(GameModel gm, String type) {
        if (type != null && gm != null && !type.isEmpty()) {
            Object singleResult = em.createQuery(
                    "SELECT t from GmEnumType t WHERE t.gamemodel_id = ?1 AND t.name = '?2'").setParameter(1, gm.getId()).setParameter(2, type).getSingleResult();
            if (singleResult instanceof GmEnumType) {
                return (GmEnumType) singleResult;
            }
        }
        return null;
    }


    /**
     * Retrieve a type and make sure it belongs to the correct GameModel
     * 
     * @param gm the game model the type has to belong to
     * @param id ID of the type to look for.
     * 
     * @return The Type if gm is correct
     * 
     */
    public GmType getType(GameModel gm, String id) {
        GmType find = em.find(GmType.class, Long.parseLong(id));
        if (find == null) {
            throw new NotFound();
        }
        if (gm != find.getGameModel()) {
            throw new InvalidContent();
        }

       // dispatcher.registerObject(find, ch);


        return find;
    }


    /**
     * 
     * Retrieve a enum type and make sure it belongs to the correct GameModel
     * 
     * @param gm the game model the type has to belong to
     * @param IF of the enum type to look for
     * @return the enum type if gm is correct
     */
    public GmEnumType getEnumType(GameModel gm, String id) {
        GmEnumType find = em.find(GmEnumType.class, Long.parseLong(id));
        if (find == null) {
            throw new NotFound();
        } else {
            if (gm != find.getGameModel()) {
                throw new InvalidContent();
            }
            return find;
        }
    }


    /**
     * 
     * Retrieve a complex type definition by making sure it belongs to the gm GameModel
     * 
     * @param gm the game model the type has to belong to
     * @param id IF of the complex type to look for
     * @return the complex type if gm is correct
     */
    public GmComplexType getComplexType(GameModel gm, String id) {
        GmComplexType find = em.find(GmComplexType.class, Long.parseLong(id));
        if (find == null) {
            throw new NotFound();
        } else {
            if (gm != find.getGameModel()) {
                throw new InvalidContent();
            }
            return find;
        }
    }


    /**
     * Create a new type 
     * @param o  the type to propagateCreate
     */
    public void createType(GmType o) {
        typePrePersist(o);
        aem.create(o);
    }


    public void typePrePersist(GmType t) {
        dispatcher.create(t);

        if (t.getMethods() != null) {
            // Link methods to the type
            for (GmMethod m : t.getMethods()) {
                m.setBelongsTo(t);
                mm.methodPrePersist(m);
            }
        }
        if (t.getUserEvents() != null) {
            // Link user-events to the type
            for (GmUserEvent ue : t.getUserEvents()) {
                ue.setBelongsTo(t);
                uem.userEventPrePersist(ue);
            }
        }

        // Check for specific pre-persist operations
        if (t instanceof GmComplexType) {
            complexTypePrePersist((GmComplexType) t);
        } else if (t instanceof GmEnumType) {
            enumTypePrePersist((GmEnumType) t);
        }
    }


    private void enumTypePrePersist(GmEnumType eType) {
        for (GmEnumItem it : eType.getItems()) {
            it.setGmEnumType(eType);
            eim.enumItemPrePersist(it);
        }
    }


    private void complexTypePrePersist(GmComplexType cType) {
        if (cType.getVariableDescriptors() != null) {
            for (VariableDescriptorEntity vd : cType.getVariableDescriptors()) {
                vd.setParentComplexType(cType);
                vdm.varDescPrePersist(vd);
            }
        }
    }


    /**
     * Update a type
     * @param gmID the model it belongs to
     * @param tID ID of the type to propagateUpdate
     * @param theType  the user-provided type embedded updates
     */
    public GmType updateType(String gmID, String tID, GmType theType) {
        GameModel gm = gmm.getGameModel(gmID);
        GmType type = getType(gm, tID);

        // Make sure ID is correct
        if (type.equals(theType)) {
            theType.setGameModel(gm);
            GmType update = aem.update(theType);
            return update;
        }

        throw new InvalidContent();
    }


    /**
     * Destroy a type
     * 
     * @param gmID
     * @param typeID 
     */
    public void destroyType(String gmID, String typeID) {
        GameModel gm = gmm.getGameModel(gmID);
        GmType type = getType(gm, typeID);

        typePreDestroy(type);
        aem.destroy(type);
    }


    public void typePreDestroy(GmType t) {

        // see GmType.vardescs note
        /*for (GmVariableDescriptor vd : t.getDescriptors()){
        vdm.varDescPreDestroy(vd);
        }*/

        for (GmMethod m : t.getMethods()) {
            mm.methodPreDestroy(m);
        }

        for (GmUserEvent ue : t.getUserEvents()) {
            uem.userEventPreDestroy(ue);
        }

        if (t instanceof GmComplexType) {
            GmComplexType ct = (GmComplexType) t;
            for (VariableDescriptorEntity vd : ct.getVariableDescriptors()) {
                vdm.varDescPreDestroy(vd);
            }
        } else if (t instanceof GmEnumType) {
            GmEnumType et = (GmEnumType) t;
            for (GmEnumItem ei : et.getItems()) {
                eim.enumItemPreDestroy(ei);
            }

        }

        dispatcher.remove(t);
    }


    void detachAll(GameModel gameModel) {
        for (GmType type : gameModel.getTypes()) {
            detach(type);
        }
    }


    void detach(GmType theType) {

        mm.detachAll(theType);
        uem.detachAll(theType);

        if (theType instanceof GmComplexType) {
            vdm.detachAll((GmComplexType)theType);

        } else if (theType instanceof GmEnumType) {
            eim.detachAll((GmEnumType)theType);
        }

        //dispatcher.detach(theType, terminal);

    }


}