/*
YUI 3.8.0 (build 5744)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add("base-observable",function(e,t){function f(){}var n=e.Lang,r="destroy",i="init",s="bubbleTargets",o="_bubbleTargets",u=e.AttributeObservable,a=e.BaseCore;f._ATTR_CFG=u._ATTR_CFG.concat(),f._NON_ATTRS_CFG=["on","after","bubbleTargets"],f.prototype={_initAttribute:function(e){a.prototype._initAttribute.apply(this,arguments),u.call(this),this._eventPrefix=this.constructor.EVENT_PREFIX||this.constructor.NAME,this._yuievt.config.prefix=this._eventPrefix},init:function(e){return this.publish(i,{queuable:!1,fireOnce:!0,defaultTargetOnly:!0,defaultFn:this._defInitFn}),this._preInitEventCfg(e),this.fire(i,{cfg:e}),this},_preInitEventCfg:function(e){e&&(e.on&&this.on(e.on),e.after&&this.after(e.after));var t,r,i,u=e&&s in e;if(u||o in this){i=u?e&&e.bubbleTargets:this._bubbleTargets;if(n.isArray(i))for(t=0,r=i.length;t<r;t++)this.addTarget(i[t]);else i&&this.addTarget(i)}},destroy:function(){return this.publish(r,{queuable:!1,fireOnce:!0,defaultTargetOnly:!0,defaultFn:this._defDestroyFn}),this.fire(r),this.detachAll(),this},_defInitFn:function(e){this._baseInit(e.cfg)},_defDestroyFn:function(e){this._baseDestroy(e.cfg)}},e.mix(f,u,!1,null,1),e.BaseObservable=f},"3.8.0",{requires:["attribute-observable"]});
