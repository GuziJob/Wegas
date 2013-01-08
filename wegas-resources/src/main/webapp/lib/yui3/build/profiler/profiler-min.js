/*
YUI 3.8.0 (build 5744)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add("profiler",function(Y,NAME){function createReport(e){return report[e]={calls:0,max:0,min:0,avg:0,points:[]},report[e]}function saveDataPoint(e,t){var n=report[e];n||(n=createReport(e)),n.calls++,n.points.push(t),n.calls>1?(n.avg=(n.avg*(n.calls-1)+t)/n.calls,n.min=Math.min(n.min,t),n.max=Math.max(n.max,t)):(n.avg=t,n.min=t,n.max=t)}var container={},report={},stopwatches={},WATCH_STARTED=0,WATCH_STOPPED=1,WATCH_PAUSED=2,L=Y.Lang;Y.Profiler={clear:function(e){L.isString(e)?(delete report[e],delete stopwatches[e]):(report={},stopwatches={})},getOriginal:function(e){return container[e]},instrument:function(e,t){var n=function(){var n=new Date,r=t.apply(this,arguments),i=new Date;return saveDataPoint(e,i-n),r};return Y.mix(n,t),n.__yuiProfiled=!0,n.prototype=t.prototype,container[e]=t,container[e].__yuiFuncName=e,createReport(e),n},pause:function(e){var t=new Date,n=stopwatches[e];n&&n.state==WATCH_STARTED&&(n.total+=t-n.start,n.start=0,n.state=WATCH_PAUSED)},start:function(e){if(container[e])throw new Error("Cannot use '"+e+"' for profiling through start(), name is already in use.");report[e]||createReport(e),stopwatches[e]||(stopwatches[e]={state:WATCH_STOPPED,start:0,total:0}),stopwatches[e].state==WATCH_STOPPED&&(stopwatches[e].state=WATCH_STARTED,stopwatches[e].start=new Date)},stop:function(e){var t=new Date,n=stopwatches[e];n&&(n.state==WATCH_STARTED?saveDataPoint(e,n.total+(t-n.start)):n.state==WATCH_PAUSED&&saveDataPoint(e,n.total),n.start=0,n.total=0,n.state=WATCH_STOPPED)},getAverage:function(e){return report[e].avg},getCallCount:function(e){return report[e].calls},getMax:function(e){return report[e].max},getMin:function(e){return report[e].min},getFunctionReport:function(e){return report[e]},getReport:function(e){return report[e]},getFullReport:function(e){e=e||function(){return!0};if(L.isFunction(e)){var t={};for(var n in report)e(report[n])&&(t[n]=report[n]);return t}},registerConstructor:function(e,t){this.registerFunction(e,t,!0)},registerFunction:function(name,owner,registerPrototype){var funcName=name.indexOf(".")>-1?name.substring(name.lastIndexOf(".")+1):name,method,prototype;L.isObject(owner)||(owner=eval(name.substring(0,name.lastIndexOf(".")))),method=owner[funcName],prototype=method.prototype,L.isFunction(method)&&!method.__yuiProfiled&&(owner[funcName]=this.instrument(name,method),container[name].__yuiOwner=owner,container[name].__yuiFuncName=funcName,registerPrototype&&this.registerObject(name+".prototype",prototype))},registerObject:function(name,object,recurse){object=L.isObject(object)?object:eval(name),container[name]=object;for(var prop in object)typeof object[prop]=="function"?prop!="constructor"&&prop!="superclass"&&this.registerFunction(name+"."+prop,object):typeof object[prop]=="object"&&recurse&&this.registerObject(name+"."+prop,object[prop],recurse)},unregisterConstructor:function(e){L.isFunction(container[e])&&this.unregisterFunction(e,!0)},unregisterFunction:function(e,t){if(L.isFunction(container[e])){t&&this.unregisterObject(e+".prototype",container[e].prototype);var n=container[e].__yuiOwner,r=container[e].__yuiFuncName;delete container[e].__yuiOwner,delete container[e].__yuiFuncName,n[r]=container[e],delete container[e]}},unregisterObject:function(e,t){if(L.isObject(container[e])){var n=container[e];for(var r in n)typeof n[r]=="function"?this.unregisterFunction(e+"."+r):typeof n[r]=="object"&&t&&this.unregisterObject(e+"."+r,t);delete container[e]}}}},"3.8.0",{requires:["yui-base"]});
