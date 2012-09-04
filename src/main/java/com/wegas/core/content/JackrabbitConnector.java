/*
 * Wegas.
 *
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.content;

import java.util.Properties;
import java.util.ResourceBundle;
import javax.annotation.PostConstruct;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.SimpleCredentials;
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
    final private SimpleCredentials admin = new SimpleCredentials(resourceBundle.getString("jcr.admin.username"), resourceBundle.getString("jcr.admin.password").toCharArray());
    final private String DIR = resourceBundle.getString("jcr.repository.home");
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
            logger.debug("Jackrabbit setup done");
        } catch (RepositoryException ex) {
            logger.error("Check your repository setup {}", DIR);
        }
        this.runGC();
    }

    @Schedule(minute = "0", hour = "3")
    private void runGC() {
        try {
            logger.info("Running Jackrabbit GarbageCollector");
            RepositoryManager rm = rf.getRepositoryManager(JackrabbitConnector.repo);
            Session session = JackrabbitConnector.repo.login(admin);
            Integer countDeleted = 0;
            DataStoreGarbageCollector gc = rm.createDataStoreGarbageCollector();
            try {
                gc.mark();
                countDeleted = gc.sweep();
            } finally {
                gc.close();
            }

            session.logout();
            rm.stop();
            logger.info("Jackrabbit GarbageCollector ended, {} items removed", countDeleted);
        } catch (RepositoryException ex) {
            logger.error("Jackrabbit garbage collector failed. Check repository configuration");
        }
    }

    protected javax.jcr.Repository getRepo() {
        return JackrabbitConnector.repo;
    }
}