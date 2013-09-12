/*
YUI 3.12.0 (build 8655935)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

if (typeof __coverage__ === 'undefined') { __coverage__ = {}; }
if (!__coverage__['build/axis-category/axis-category.js']) {
   __coverage__['build/axis-category/axis-category.js'] = {"path":"build/axis-category/axis-category.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":25},"end":{"line":1,"column":44}}},"2":{"name":"(anonymous_2)","line":28,"loc":{"start":{"line":28,"column":21},"end":{"line":29,"column":4}}},"3":{"name":"(anonymous_3)","line":42,"loc":{"start":{"line":42,"column":21},"end":{"line":43,"column":4}}},"4":{"name":"(anonymous_4)","line":59,"loc":{"start":{"line":59,"column":22},"end":{"line":60,"column":4}}},"5":{"name":"(anonymous_5)","line":80,"loc":{"start":{"line":80,"column":19},"end":{"line":81,"column":4}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":119,"column":59}},"2":{"start":{"line":9,"column":0},"end":{"line":9,"column":20}},"3":{"start":{"line":20,"column":0},"end":{"line":115,"column":3}},"4":{"start":{"line":30,"column":8},"end":{"line":31,"column":28}},"5":{"start":{"line":32,"column":8},"end":{"line":32,"column":21}},"6":{"start":{"line":44,"column":8},"end":{"line":46,"column":30}},"7":{"start":{"line":47,"column":8},"end":{"line":47,"column":21}},"8":{"start":{"line":61,"column":8},"end":{"line":62,"column":36}},"9":{"start":{"line":63,"column":8},"end":{"line":63,"column":24}},"10":{"start":{"line":64,"column":8},"end":{"line":64,"column":21}},"11":{"start":{"line":82,"column":8},"end":{"line":89,"column":32}},"12":{"start":{"line":90,"column":8},"end":{"line":90,"column":40}},"13":{"start":{"line":91,"column":8},"end":{"line":109,"column":9}},"14":{"start":{"line":93,"column":12},"end":{"line":93,"column":39}},"15":{"start":{"line":94,"column":12},"end":{"line":94,"column":59}},"16":{"start":{"line":95,"column":12},"end":{"line":108,"column":13}},"17":{"start":{"line":97,"column":16},"end":{"line":97,"column":27}},"18":{"start":{"line":98,"column":16},"end":{"line":98,"column":49}},"19":{"start":{"line":99,"column":16},"end":{"line":105,"column":18}},"20":{"start":{"line":106,"column":16},"end":{"line":106,"column":35}},"21":{"start":{"line":107,"column":16},"end":{"line":107,"column":40}},"22":{"start":{"line":110,"column":8},"end":{"line":113,"column":10}}},"branchMap":{"1":{"line":90,"type":"binary-expr","locations":[{"start":{"line":90,"column":21},"end":{"line":90,"column":31}},{"start":{"line":90,"column":35},"end":{"line":90,"column":39}}]},"2":{"line":95,"type":"if","locations":[{"start":{"line":95,"column":12},"end":{"line":95,"column":12}},{"start":{"line":95,"column":12},"end":{"line":95,"column":12}}]},"3":{"line":95,"type":"binary-expr","locations":[{"start":{"line":95,"column":15},"end":{"line":95,"column":42}},{"start":{"line":95,"column":46},"end":{"line":95,"column":61}}]}},"code":["(function () { YUI.add('axis-category', function (Y, NAME) {","","/**"," * Provides functionality for drawing a category axis for use with a chart."," *"," * @module charts"," * @submodule axis-category"," */","var Y_Lang = Y.Lang;","/**"," * CategoryAxis draws a category axis for a chart."," *"," * @class CategoryAxis"," * @constructor"," * @extends Axis"," * @uses CategoryImpl"," * @param {Object} config (optional) Configuration parameters."," * @submodule axis-category"," */","Y.CategoryAxis = Y.Base.create(\"categoryAxis\", Y.Axis, [Y.CategoryImpl], {","    /**","     * Returns a string corresponding to the first label on an","     * axis.","     *","     * @method getMinimumValue","     * @return String","     */","    getMinimumValue: function()","    {","        var data = this.get(\"data\"),","            label = data[0];","        return label;","    },","","    /**","     * Returns a string corresponding to the last label on an","     * axis.","     *","     * @method getMaximumValue","     * @return String","     */","    getMaximumValue: function()","    {","        var data = this.get(\"data\"),","            len = data.length - 1,","            label = data[len];","        return label;","    },","","    /**","     * Calculates and returns a value based on the number of labels and the index of","     * the current label.","     *","     * @method _getLabelByIndex","     * @param {Number} i Index of the label.","     * @return String","     * @private","     */","    _getLabelByIndex: function(i)","    {","        var label,","            data = this.get(\"data\");","        label = data[i];","        return label;","    },","","    /**","     * Returns an object literal containing and array of label values and an array of points.","     *","     * @method _getLabelData","     * @param {Object} startPoint An object containing x and y values.","     * @param {Number} edgeOffset Distance to offset coordinates.","     * @param {Number} layoutLength Distance that the axis spans.","     * @param {Number} count Number of labels.","     * @param {String} direction Indicates whether the axis is horizontal or vertical.","     * @param {Array} Array containing values for axis labels.","     * @return Array","     * @private","     */","    _getLabelData: function(constantVal, staticCoord, dynamicCoord, min, max, edgeOffset, layoutLength, count, dataValues)","    {","        var labelValue,","            i,","            points = [],","            values = [],","            point,","            labelIndex,","            data = this.get(\"data\"),","            offset = edgeOffset;","        dataValues = dataValues || data;","        for(i = 0; i < count; i = i + 1)","        {","            labelValue = dataValues[i];","            labelIndex = Y.Array.indexOf(data, labelValue);","            if(Y_Lang.isNumber(labelIndex) && labelIndex > -1)","            {","                point = {};","                point[staticCoord] = constantVal;","                point[dynamicCoord] = this._getCoordFromValue(","                    min,","                    max,","                    layoutLength,","                    labelIndex,","                    offset","                );","                points.push(point);","                values.push(labelValue);","            }","        }","        return {","            points: points,","            values: values","        };","    }","});","","","","}, '3.12.0', {\"requires\": [\"axis\", \"axis-category-base\"]});","","}());"]};
}
var __cov_5I7GX8nuMNZAAeOsedEb6g = __coverage__['build/axis-category/axis-category.js'];
__cov_5I7GX8nuMNZAAeOsedEb6g.s['1']++;YUI.add('axis-category',function(Y,NAME){__cov_5I7GX8nuMNZAAeOsedEb6g.f['1']++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['2']++;var Y_Lang=Y.Lang;__cov_5I7GX8nuMNZAAeOsedEb6g.s['3']++;Y.CategoryAxis=Y.Base.create('categoryAxis',Y.Axis,[Y.CategoryImpl],{getMinimumValue:function(){__cov_5I7GX8nuMNZAAeOsedEb6g.f['2']++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['4']++;var data=this.get('data'),label=data[0];__cov_5I7GX8nuMNZAAeOsedEb6g.s['5']++;return label;},getMaximumValue:function(){__cov_5I7GX8nuMNZAAeOsedEb6g.f['3']++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['6']++;var data=this.get('data'),len=data.length-1,label=data[len];__cov_5I7GX8nuMNZAAeOsedEb6g.s['7']++;return label;},_getLabelByIndex:function(i){__cov_5I7GX8nuMNZAAeOsedEb6g.f['4']++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['8']++;var label,data=this.get('data');__cov_5I7GX8nuMNZAAeOsedEb6g.s['9']++;label=data[i];__cov_5I7GX8nuMNZAAeOsedEb6g.s['10']++;return label;},_getLabelData:function(constantVal,staticCoord,dynamicCoord,min,max,edgeOffset,layoutLength,count,dataValues){__cov_5I7GX8nuMNZAAeOsedEb6g.f['5']++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['11']++;var labelValue,i,points=[],values=[],point,labelIndex,data=this.get('data'),offset=edgeOffset;__cov_5I7GX8nuMNZAAeOsedEb6g.s['12']++;dataValues=(__cov_5I7GX8nuMNZAAeOsedEb6g.b['1'][0]++,dataValues)||(__cov_5I7GX8nuMNZAAeOsedEb6g.b['1'][1]++,data);__cov_5I7GX8nuMNZAAeOsedEb6g.s['13']++;for(i=0;i<count;i=i+1){__cov_5I7GX8nuMNZAAeOsedEb6g.s['14']++;labelValue=dataValues[i];__cov_5I7GX8nuMNZAAeOsedEb6g.s['15']++;labelIndex=Y.Array.indexOf(data,labelValue);__cov_5I7GX8nuMNZAAeOsedEb6g.s['16']++;if((__cov_5I7GX8nuMNZAAeOsedEb6g.b['3'][0]++,Y_Lang.isNumber(labelIndex))&&(__cov_5I7GX8nuMNZAAeOsedEb6g.b['3'][1]++,labelIndex>-1)){__cov_5I7GX8nuMNZAAeOsedEb6g.b['2'][0]++;__cov_5I7GX8nuMNZAAeOsedEb6g.s['17']++;point={};__cov_5I7GX8nuMNZAAeOsedEb6g.s['18']++;point[staticCoord]=constantVal;__cov_5I7GX8nuMNZAAeOsedEb6g.s['19']++;point[dynamicCoord]=this._getCoordFromValue(min,max,layoutLength,labelIndex,offset);__cov_5I7GX8nuMNZAAeOsedEb6g.s['20']++;points.push(point);__cov_5I7GX8nuMNZAAeOsedEb6g.s['21']++;values.push(labelValue);}else{__cov_5I7GX8nuMNZAAeOsedEb6g.b['2'][1]++;}}__cov_5I7GX8nuMNZAAeOsedEb6g.s['22']++;return{points:points,values:values};}});},'3.12.0',{'requires':['axis','axis-category-base']});
