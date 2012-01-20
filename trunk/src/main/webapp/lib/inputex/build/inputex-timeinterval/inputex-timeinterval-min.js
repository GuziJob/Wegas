YUI.add("inputex-timeinterval",function(c){var b=c.Lang,a=c.inputEx;a.TimeIntervalField=function(d){a.TimeIntervalField.superclass.constructor.call(this,d)};c.extend(a.TimeIntervalField,a.CombineField,{setOptions:function(f){a.TimeIntervalField.superclass.setOptions.call(this,f);var e=a.TimeIntervalField.units;var d=a.messages.timeUnits;this.options.unit=f.unit||e.SECOND;var h=[];for(var g=1;g<=60;g++){h.push({value:g})}this.options.fields=f.fields||[{type:"select",choices:h},{type:"select",choices:[{value:e.SECOND,label:d.SECOND},{value:e.MINUTE,label:d.MINUTE},{value:e.HOUR,label:d.HOUR},{value:e.DAY,label:d.DAY},{value:e.MONTH,label:d.MONTH},{value:e.YEAR,label:d.YEAR}]}];this.options.separators=f.separators||[false,"&nbsp;&nbsp;",false]},getValue:function(){var d=a.TimeIntervalField.superclass.getValue.call(this);return(parseInt(d[0],10)*d[1])/this.options.unit},setValue:function(h,e){var g=(typeof h=="string"?parseFloat(h,10):h)*this.options.unit;var d=a.TimeIntervalField.units;var f,i;if(g<d.SECOND){f=d.SECOND;i=1}else{if(g%d.YEAR===0){f=d.YEAR}else{if(g%d.MONTH===0){f=d.MONTH}else{if(g%d.DAY===0){f=d.DAY}else{if(g%d.HOUR===0){f=d.HOUR}else{if(g%d.MINUTE===0){f=d.MINUTE}else{f=d.SECOND}}}}}i=Math.floor(g/f)}a.TimeIntervalField.superclass.setValue.call(this,[i,f],e)}});a.TimeIntervalField.units={SECOND:1,MINUTE:60,HOUR:3600,DAY:86400,MONTH:2592000,YEAR:31536000};a.registerType("timeinterval",a.TimeIntervalField)},"3.0.0a",{requires:["inputex-combine","inputex-select"]});