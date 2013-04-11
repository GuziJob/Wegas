/* YUI 3.9.1 (build 5852) Copyright 2013 Yahoo! Inc. http://yuilibrary.com/license/ */
YUI.add("clickable-rail",function(e,t){function n(){this._initClickableRail()}e.ClickableRail=e.mix(n,{prototype:{_initClickableRail:function(){this._evtGuid=this._evtGuid||e.guid()+"|",this.publish("railMouseDown",{defaultFn:this._defRailMouseDownFn}),this.after("render",this._bindClickableRail),this.on("destroy",this._unbindClickableRail)},_bindClickableRail:function(){this._dd.addHandle(this.rail),this.rail.on(this._evtGuid+e.DD.Drag.START_EVENT,e.bind(this._onRailMouseDown,this))},_unbindClickableRail:function(){if(this.get("rendered")){var e=this.get("contentBox"),t=e.one("."+this.getClassName("rail"));t.detach(this.evtGuid+"*")}},_onRailMouseDown:function(e){this.get("clickableRail")&&!this.get("disabled")&&(this.fire("railMouseDown",{ev:e}),this.thumb.focus())},_defRailMouseDownFn:function(e){e=e.ev;var t=this._resolveThumb(e),n=this._key.xyIndex,r=parseFloat(this.get("length"),10),i,s,o;t&&(i=t.get("dragNode"),s=parseFloat(i.getStyle(this._key.dim),10),o=this._getThumbDestination(e,i),o=o[n]-this.rail.getXY()[n],o=Math.min(Math.max(o,0),r-s),this._uiMoveThumb(o,{source:"rail"}),e.target=this.thumb.one("img")||this.thumb,t._handleMouseDownEvent(e))},_resolveThumb:function(e){return this._dd},_getThumbDestination:function(e,t){var n=t.get("offsetWidth"),r=t.get("offsetHeight");return[e.pageX-Math.round(n/2),e.pageY-Math.round(r/2)]}},ATTRS:{clickableRail:{value:!0,validator:e.Lang.isBoolean}}},!0)},"3.9.1",{requires:["slider-base"]});
