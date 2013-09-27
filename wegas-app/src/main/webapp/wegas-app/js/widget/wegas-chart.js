/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Yannick Lagger <lagger.yannick@gmail.com>
 */

YUI.add('wegas-chart', function(Y) {
    var CONTENTBOX = 'contentBox',
            Chart = Y.Base.create("wegas-chart", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.Editable], {
        renderUI: function() {
            this.handlers = [];
            this.get(CONTENTBOX).setStyles({
                width: this.checkType(this.get("chartWidth")),
                height: this.checkType(this.get("chartHeight"))
            });
        },
        bindUI: function() {
            this.handlers.push(
                    Y.Wegas.Facade.VariableDescriptor.after("update", this.syncUI, this));
        },
        syncUI: function() {
            var i;
            this.vdList = [];
            var variable = this.get("variables");
            for (i = 0; i < variable.length; i++) {
                var vd = Y.Wegas.Facade.VariableDescriptor.cache.find("name", variable[i].name);
                if (!vd) {
                    this.showMessage("error", "Variables not found");
                    return;
                }
                vd.position = i;
                if (variable[i].label)
                    vd.label = variable[i].label;
                else
                    vd.label = variable[i].name;
                this.historyRequest(vd);
            }
        },
        destructor: function() {
            if (this.chart) {
                this.chart.destroy();
            }
            for (var i = 0; i < this.handlers.length; i = i + 1) {
                this.handlers[i].detach();
            }
            Y.Wegas.DataSource.abort(this.historyRequestId);
        },
        historyRequest: function(vd) {
            this.historyRequestId = Y.Wegas.Facade.VariableDescriptor.cache.getWithView(vd.getInstance(), "Extended", {
                on: {
                    success: Y.bind(function(r) {
                        var a = Y.JSON.parse(r.data.responseText);
                        a.entities[0].label = vd.label;
                        this.vdList.splice(vd.position, 0, a.entities[0]);
                        if (this.vdList.length === this.get("variables").length) {
                            this.createChart();
                        }
                    }, this),
                    failure: function(r) {
                        if (r.serverResponse.status === 0) {
                            Y.log("Abort history query", "info", "Y.Wegas.Chart");
                        } else {
                            Y.error("Error by loading history data");
                        }
                    }
                }
            });
        },
        /**
         * Creat a YUI3 Charts combospline' with values of a resource's moral and confidence historic values.
         * If any resource is given, the chart will be not created.
         * @ Param NumberDescriptor numberDescriptor, the source of chart's values
         */
        createChart: function() {
            if (this.chart) {
                this.chart.destroy();
            }
            if (this.vdList.length < 1)
                return;
            var i, cb = this.get(CONTENTBOX),
                    seriesCollection = [],
                    rawSeries = [],
                    obj;

            for (i = 0; i < this.vdList.length; i++) {
                obj = {
                    yDisplayName: this.vdList[i].label
                };
                seriesCollection.push(obj);
                rawSeries.push(this.vdList[i].history);
            }

            this.chart = new Y.Chart({
                type: this.get("chartType"),
                seriesCollection: seriesCollection,
                // categoryType:"time",                                         // Start sur l'axe mais l'axe devient time
                axes: {
                    values: {
                        minimum: this.findMinValue(),
                        maximum: this.findMaxValue()
                    }
                },
                legend: {
                    styles: {
                        gap: 0
                    },
                    position: this.get("legendPosition")
                },
                tooltip: this.chartTooltip,
                dataProvider: this.getChartValues(this.findNumberOfValue(), rawSeries),
                horizontalGridlines: this.get("horizontalGridlines"),
                verticalGridlines: this.get("verticalGridlines")
            });
            this.chart.render(cb);
        },
        findMinValue: function() {
            if (!this.get("minValue")) {
                return null;
            } else {
                return this.get("minValue");
            }
        },
        findMaxValue: function() {
            if (!this.get("maxValue")) {
                return null;
            } else {
                return this.get("maxValue");
            }
        },
        findNumberOfValue: function() {
            var i, number = null;
            if (!this.get("numberOfValue")) {
                for (i = 0; i < this.vdList.length; i++) {
                    if (number === null || this.vdList[i].history.length > number) {
                        number = this.vdList[i].history.length;
                    }
                }
                return number;
            } else {
                return this.get("numberOfValue");
            }
        },
        /**
         * Create series for the chart.
         * i = numberOfValues
         * For each series, If number of values is smaller than i, copy the last value to create a serie with i values.
         * If number of values is greater than i, keep only the i last values.
         * @param Integer numberOfValues, the number of value wanted in the series.
         * @param Array rawSeries, an array of array of Integer.
         */
        getChartValues: function(numberOfValues, rawSeries) {
            var i, j, fitSeries = new Array(), serieRawData = new Array(), serieFitData = new Array();
            for (i = 0; i < numberOfValues; i++) {
                serieFitData.push(i + 1);
            }
            fitSeries.push(serieFitData.slice());
            for (i = 0; i < rawSeries.length; i++) {
                serieRawData = rawSeries[i];
                serieFitData.length = 0;
                for (j = numberOfValues - 1; j >= 0; j--) {
                    if (serieRawData.length - 1 >= j) {
                        serieFitData.push(serieRawData[serieRawData.length - (j + 1)]);
                    }
                }
                fitSeries.push(serieFitData.slice());
            }

            if (fitSeries[0].length === 0) {
                for (i = 1; i < 10; i++) {
                    fitSeries[0].push(i);
                }
            }
            return fitSeries;
        },
        chartTooltip: {
            markerLabelFunction: function(categoryItem, valueItem, itemIndex, series, seriesIndex) {
                var msg = new Y.Node.create("<div></div>"),
                        boldTextBlock = new Y.Node.create("<div></div>");
                boldTextBlock.appendChild('<p>' + valueItem.displayName + ': ' + valueItem.axis.get("labelFunction").apply(this, [valueItem.value]) + '</p>');
                msg.appendChild(boldTextBlock);
                return msg;
            }
        },
        checkType: function(value) {
            value = value.trim();
            if (value.substr(-2) !== "px" && value.substr(-2) !== "pt" && value.substr(-2) !== "em" && value.substr(-1) !== "%" && value.substr(-2) !== "ex") {
                return value + "px";
            } else {
                return value;
            }

        }
    }, {
        EDITORNAME: "Chart",
        ATTRS: {
            /**
             * The target variable, returned either based on the variableName attribute,
             * and if absent by evaluating the expr attribute.
             */
            variables: {
                getter: Y.Wegas.Widget.VARIABLEDESCRIPTORGETTER,
                _inputex: {
                    _type: "list",
                    useButtons: true,
                    elementType: {
                        type: "variableselect",
                        label: "variable"
                    },
                    index: 1
                }
            },
            chartType: {
                type: "string",
                value: "combo",
                choices: ['combo', 'line'],
                _inputex: {
                    label: "Chart type",
                    index: 0
                }
            },
            minValue: {
                optional: true,
                _inputex: {
                    _type: "integer",
                    label: "Min. value",
                    index: 2,
                    negative: true
                }
            },
            maxValue: {
                optional: true,
                _inputex: {
                    _type: "integer",
                    label: "Max. value",
                    index: 3,
                    negative: true
                }
            },
            chartWidth: {
                value: "250px",
                type: "string",
                _inputex: {
                    label: "Width",
                    index: 5
                }
            },
            chartHeight: {
                value: "200px",
                type: "string",
                _inputex: {
                    label: "Height",
                    index: 6
                }
            },
            numberOfValue: {
                _inputex: {
                    _type: "integer",
                    label: "Number of value",
                    index: 4,
                    required: false
                }
            },
            horizontalGridlines: {
                value: true,
                type: "boolean",
                _inputex: {
                    label: "Horizontal Gridlines",
                    index: 8
                }
            },
            verticalGridlines: {
                value: true,
                type: "boolean",
                _inputex: {
                    label: "Vertical Gridlines",
                    index: 9
                }
            },
            legendPosition: {
                value: "bottom",
                type: "string",
                choices: ['bottom', 'left', 'right', 'top'],
                _inputex: {
                    value: "bottom",
                    index: 7
                }
            }
        }
    });

    Y.namespace('Wegas').Chart = Chart;
});
