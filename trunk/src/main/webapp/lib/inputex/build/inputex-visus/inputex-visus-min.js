YUI.add("inputex-visus",function(c){var b=c.Lang,a=c.inputEx;a.visus={trimpath:function(f,g){if(!TrimPath){alert("TrimPath is not on the page. Please load inputex/lib/trimpath-template.js");return null}var e=TrimPath.parseTemplate(f.template);var d=e.process(g);return d},func:function(d,e){return d.func(e)},dump:function(d,e){return c.dump(e)}};a.renderVisu=function(k,g,h){var d=k||{};var l=d.visuType||"dump";if(!a.visus.hasOwnProperty(l)){throw new Error("inputEx: no visu for visuType: "+l)}var i=a.visus[l];if(!b.isFunction(i)){throw new Error("inputEx: no visu for visuType: "+l)}var m=null;try{m=i(d,g)}catch(j){throw new Error("inputEx: error while running visu "+l+" : "+j.message)}var e=null;if(h){if(b.isString(h)){e=c.one(h)}else{e=h}}if(e){if(c.Lang.isObject(m)&&m.tagName){e.innerHTML="";e.appendChild(m)}else{e.innerHTML=m}}return m}},"3.0.0a",{requires:["inputex","dump"]});