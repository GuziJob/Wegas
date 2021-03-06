/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.variable.scope;

import com.wegas.core.ejb.RequestFacade;
import com.wegas.core.persistence.AbstractEntity;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.GameModel;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.game.Team;
import com.wegas.core.persistence.variable.VariableDescriptor;
import com.wegas.core.persistence.variable.VariableInstance;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.*;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
@Entity
@XmlType(name = "PlayerScope")
public class PlayerScope extends AbstractScope {

    private static final Logger logger = LoggerFactory.getLogger(PlayerScope.class);
    /*
     * FIXME Here we should use UserEntity reference and add a key deserializer
     * module
     */
    @OneToMany(cascade = {CascadeType.ALL}, fetch = FetchType.LAZY, orphanRemoval = true, mappedBy = "playerScope")
    @JoinColumn(name = "playerscope_id", referencedColumnName = "id")
    @XmlTransient
    private Map<Long, VariableInstance> variableInstances = new HashMap<Long, VariableInstance>();

    /**
     *
     * @return
     */
    @Override
    public Map<Long, VariableInstance> getVariableInstances() {
        return this.variableInstances;
    }

    /**
     *
     * @param player
     * @return
     */
    @Override
    public VariableInstance getVariableInstance(Player player) {
        return this.variableInstances.get(player.getId());
    }

    /**
     *
     * @param playerId
     * @param v
     */
    @Override
    public void setVariableInstance(Long key, VariableInstance v) {
        this.variableInstances.put(key, v);
        v.setPlayerScopeKey(key);
        v.setPlayerScope(this);
    }

    /**
     *
     */
    @PrePersist
    public void prePersist() {
        this.propagateDefaultInstance(false);
    }

    /**
     *
     * @param force
     */
    @Override
    public void propagateDefaultInstance(boolean force) {
        VariableDescriptor vd = this.getVariableDescriptor();
        GameModel gm = vd.getGameModel();
        for (Game g : gm.getGames()) {
            for (Team t : g.getTeams()) {
                for (Player p : t.getPlayers()) {
                    VariableInstance vi = this.variableInstances.get(p.getId());
                    if (vi == null) {
                        this.setVariableInstance(p.getId(), vd.getDefaultInstance().clone());
                    } else if (force) {
                        vi.merge(vd.getDefaultInstance());
                    }
                }
            }
        }
    }

    /**
     *
     * @param a
     */
    @Override
    public void merge(AbstractEntity a) {
    }

    @Override
    public Map<Long, VariableInstance> getPrivateInstances() {
        Map<Long, VariableInstance> ret = new HashMap<>();
        Player cPlayer = RequestFacade.lookup().getPlayer();

        if (this.getBroadcastScope().equals(GameScope.class.getSimpleName())) {
            for (Team t : cPlayer.getGame().getTeams()) {
                for (Player p : t.getPlayers()) {
                    ret.put(p.getId(), this.getVariableInstance(p));
                }
            }
        } else if (this.getBroadcastScope().equals(TeamScope.class.getSimpleName())) {
            for (Player p : cPlayer.getTeam().getPlayers()) {
                ret.put(p.getId(), this.getVariableInstance(p));
            }
        } else {
            ret.put(cPlayer.getId(), this.getVariableInstance(cPlayer));
        }
        return ret;
    }
}
/*
 * public class UuidMapKeyDeserializerModule extends Module {
 *
 * @Override public String getModuleName() { return getClass().getName(); }
 *
 * @Override public Version version() { return Version.unknownVersion(); }
 *
 * @Override public void setupModule(SetupContext context) {
 * context.addKeyDeserializers(new KeyDeserializers() { @Override public
 * KeyDeserializer findKeyDeserializer(JavaType type, DeserializationConfig
 * config, BeanDescription beanDesc, BeanProperty property) throws
 * JsonMappingException { if (type.getRawClass().equals(UUID.class)) { return
 * new UuidDeserializer(); } return null; } }); }
 *
 * private static class UuidDeserializer extends KeyDeserializer { @Override
 * public UUID deserializeKey(String key, DeserializationContext ctxt) throws
 * IOException { return UUID.fromString(key); } } } class UserDeserializer
 * extends StdKeyDeserializer {
 *
 * protected UserDeserializer(Class<UserEntity> cls) { super(cls); }
 *
 * @Override protected Object _parse(String key, DeserializationContext ctxt)
 * throws Exception { ObjectMapper mapper = new ObjectMapper(); return
 * mapper.readValue(key, UserEntity.class); } }
 */
