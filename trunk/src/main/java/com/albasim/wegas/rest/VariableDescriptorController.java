/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.rest;

import com.albasim.wegas.ejb.Dispatcher;
import com.albasim.wegas.ejb.GameModelManager;
import com.albasim.wegas.ejb.VariableDescriptorManager;
import com.albasim.wegas.helper.AlbaHelper;
import com.albasim.wegas.helper.IndexEntry;
import com.albasim.wegas.persistence.GameModel;
import com.albasim.wegas.persistence.VariableDescriptorEntity;
import java.util.Collection;


import java.util.logging.Logger;

import javax.ejb.EJB;
import javax.ejb.Stateless;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author maxence
 */
@Stateless
@Path("gm/{gmID : [1-9][0-9]*}/vardesc")
public class VariableDescriptorController {

    private static final Logger logger = Logger.getLogger("Authoring_GM_VariableDescriptor");

    @EJB Dispatcher dispatcher;
    @Context HttpServletRequest request;

    @EJB
    private GameModelManager gmm;

    @EJB 
    private VariableDescriptorManager vdm;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Collection<IndexEntry> create(
            @PathParam("gmID") String gmID) {
        GameModel theGameModel = gmm.getGameModel(gmID);
        return AlbaHelper.getIndex(theGameModel.getVariableDescriptors());
    }


    /**
     * Retrieve the list of game model variable descriptor
     *   To fetch complex type varDes see gm/x/type/y/var_desc
     * @param gmID game model id
     * @return OK
     */
    @GET
    @Path("{variableDescriptorId : [1-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public VariableDescriptorEntity get(@PathParam("gmID") Long gmID,
                                    @PathParam("variableDescriptorId") Long variableDescriptorId) {
        return vdm.getVariableDescriptor(variableDescriptorId);
    }


    /**
     * Create a global variable descriptor
     * 
     * @param is
     * @return 
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public VariableDescriptorEntity createForGameModel(
            @PathParam("gmID") String gmID,
            VariableDescriptorEntity theVarDesc) {
        GameModel theGameModel = gmm.getGameModel(gmID);
        theVarDesc.setParentGameModel(theGameModel);
        vdm.createVarDesc(theVarDesc);

        return theVarDesc;
    }


    /**
     * @param gmID
     * @return 
     */
    /*@PUT
    @Path("{variableDescriptorId : [1-9][0-9]*}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public GmVariableDescriptor propagateUpdate(@PathParam("gmID") String gmID,
                                       @PathParam("variableDescriptorId") String variableDescriptorId,
                                       GmVariableDescriptor theVarDesc) {
        GmVariableDescriptor updateVariableDescriptor = gmm.updateVariableDescriptor(gmID, variableDescriptorId, theVarDesc);
        return updateVariableDescriptor;
    }*/


    /**
     * 
     * @param gmID
     * @return 
     */
    @DELETE
    @Path("{variableDescriptorId : [1-9][0-9]*}")
    public Response destroy(@PathParam("gmID") String gmID,
                            @PathParam("variableDescriptorId") String variableDescriptorId) {

        vdm.destroyVariableDescriptor(gmID, variableDescriptorId);

        return Response.status(Response.Status.OK).build();
    }


}