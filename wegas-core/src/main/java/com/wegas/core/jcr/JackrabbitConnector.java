/*
 * Wegas
 * http://www.albasim.ch/wegas/
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.jcr;

import java.util.Properties;
import java.util.ResourceBundle;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.jcr.RepositoryException;
import org.apache.jackrabbit.api.JackrabbitRepository;
import org.apache.jackrabbit.api.JackrabbitRepositoryFactory;
import org.apache.jackrabbit.api.management.DataStoreGarbageCollector;
import org.apache.jackrabbit.api.management.RepositoryManager;
import org.apache.jackrabbit.core.RepositoryFactoryImpl;
import org.slf4j.LoggerFactory;

/**
 * Implementation specific garbageCollector
 *
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
@Startup
@Singleton
public class JackrabbitConnector {

    static final private org.slf4j.Logger logger = LoggerFactory.getLogger(JackrabbitConnector.class);
    final private ResourceBundle resourceBundle = ResourceBundle.getBundle("wegas");
    final private String DIR = System.getProperty("file.dir") + "/" + resourceBundle.getString("jcr.repository.home");
    private static JackrabbitRepository repo;
    private JackrabbitRepositoryFactory rf;

    @PostConstruct
    private void init() {
        rf = new RepositoryFactoryImpl();
        Properties prop = new Properties();
        prop.setProperty("org.apache.jackrabbit.repository.home", DIR);
        prop.setProperty("org.apache.jackrabbit.repository.conf", DIR + "/repository.xml");
        try {
            repo = (JackrabbitRepository) rf.getRepository(prop);
            logger.info("Jackrabbit will read setup from {}", DIR);
        } catch (RepositoryException ex) {
            logger.error("Check your repository setup {}", DIR);
        }
        //Enable GC on startup
        //this.runGC();
    }

    //@Schedule(minute = "0", hour = "3")
    private void runGC() {
        try {
            logger.info("Running Jackrabbit GarbageCollector");
            RepositoryManager rm = rf.getRepositoryManager(JackrabbitConnector.repo);
            SessionHolder.getSession(null);
            Integer countDeleted = 0;
            DataStoreGarbageCollector gc = rm.createDataStoreGarbageCollector();
            try {
                gc.mark();
                countDeleted = gc.sweep();
            } finally {
                gc.close();
            }

            SessionHolder.closeSession(null);
            rm.stop();
            logger.info("Jackrabbit GarbageCollector ended, {} items removed", countDeleted);
        } catch (RepositoryException ex) {
            logger.error("Jackrabbit garbage collector failed. Check repository configuration");
        }
    }

    /**
     *
     * @return
     */
    protected javax.jcr.Repository getRepo() {
        return JackrabbitConnector.repo;
    }

    @PreDestroy
    private void close() {
        JackrabbitConnector.repo.shutdown();
    }
}