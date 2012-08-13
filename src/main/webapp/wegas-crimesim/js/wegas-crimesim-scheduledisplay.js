/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */

/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-crimesim-scheduledisplay', function (Y) {
    "use strict";

    var CONTENTBOX = 'contentBox',
    ScheduleDisplay;

    /**
     *  The schedule display class.
     */
    ScheduleDisplay = Y.Base.create("wegas-crimesim-scheduledisplay", Y.Widget,
        [Y.Wegas.Widget, Y.WidgetChild], {

            CONTENT_TEMPLATE: '<div><div class="schedule-questions"></div>'
            + '<div class="schedule-detail"><div class="schedule-icon-close"></div><h1></h1><div class="content"></div>'
            + '<div class="schedule-gallery"></div><h2>Anaylses</h2><div class="schedule-analysis"></div>'
            + '</div></div>',

            // *** Fields *** /
            menu: null,
            handlers: null,
            gallery: null,

            // *** Lifecycle Methods *** //
            renderUI: function () {
                this.menu = new Y.Wegas.Menu();
                this.renderDetailsPanel();
                this.gallery = new Y.Wegas.WegasGallery({
                    render:this.get(CONTENTBOX).one(".schedule-gallery"),
                    selectedHeight: 150
                });
            },

            bindUI: function () {
                var cb = this.get(CONTENTBOX);
                this.handlers = {};

                cb.delegate("click", function (e) {                             // Show the available menu options on cell click
                    var questionId =  e.target.ancestor( "tr" ).getAttribute( "data-questionid" ),
                    startTime = e.target.ancestor( "td" ).getAttribute( "data-startTime" ) * 1,
                    question = Y.Wegas.VariableDescriptorFacade.rest.findById( questionId );

                    this.menu.removeAll();                                      // Populate the menu
                    this.menu.add( this.genMenuItems( question, startTime ) );
                    this.menu.attachTo( e.target );                             // Display the menu button next to the arrow
                }, ".schedule-available .icon", this);

                this.menu.on( "button:click", this.onMenuClick, this );         // Listen for the choice menu click event

                cb.delegate( "click", function (e) {                            // Show the question detail on left label click
                    var questionId = e.target.ancestor( "tr" ).getAttribute( "data-questionid" );
                    this.currentQuestionId = questionId;
                    this.syncDetailsPanel();
                }, "td.schedule-leftcolum", this);

                cb.delegate("click",  this.hideDetails,                         // Hide the question detail on close icon click
                    ".schedule-icon-close", this);

                cb.delegate("click", this.onCancelReplyClick,                   // Hide the question detail on close icon click
                    ".icon .close-icon", this);

                this.handlers.response =                                        // If data changes, refresh
                Y.Wegas.app.dataSources.VariableDescriptor.after("response",
                    this.syncUI, this);

                this.handlers.playerChange =                                    // If current user changes, refresh (editor only)
                Y.Wegas.app.after('currentPlayerChange', this.syncUI, this);
            },

            /**
             *
             */
            syncUI: function () {
                this.syncSchedule();
                if ( this.currentQuestionId ) {
                    this.syncDetailsPanel();
                }
            },

            /**
            *
            */
            destructor: function () {
                this.gallery.destroy();
                this.menu.destroy();
                this.datatable.destroy();

                for (var i in this.handlers) {
                    this.handlers[i].detach();
                }
            },

            // *** Rendering methods *** //
            syncSchedule: function () {
                var perPeriodBudget = 15, perPeriodLoad = [], cIndex, choiceDescriptor, choiceInstance,
                questionInstance,  reply, i, j, k, question, cols, replies, names,
                questionsVarDesc = Y.Wegas.VariableDescriptorFacade.rest.find('name', "evidences").get("items"),
                questionInstances = [],
                period = Y.Wegas.VariableDescriptorFacade.rest.find('name', "period"),
                periodInstance = period.getInstance(),
                maxValue = period.get("maxValue"),
                totalPeriods = period.get("maxValue") - period.get("minValue"),
                acc = [ '<table class="schedule-table"><tr><th class="schedule-leftcolum">Evidences</th>' ],
                cb = this.get(CONTENTBOX).one(".schedule-questions"),
                currentTime = periodInstance.get( "value" ) - period.get( "minValue" );

                this.currentTime = currentTime;
                this.perPeriodLoad = perPeriodLoad;

                if (!period) {
                    cb.setContent("No time variable is set.");
                    return;
                }

                for (i = period.get("minValue"); i <= maxValue; i += 1) {
                    acc.push('<th class="schedule-maincolum"><div>' + i + '</div></th>'); // Generate table header
                    perPeriodLoad.push(0);                                          // Default value for perPeriodLoad calculation
                }
                acc.push("</tr>");

                for (i = 0; i < questionsVarDesc.length; i += 1) {                  // First pass to compute remaining time budget per period
                    question = questionsVarDesc[i];
                    questionInstance = question.getInstance();
                    for (j = 0; j < questionInstance.get("replies").length; j += 1) {
                        reply = questionInstance.get("replies")[j];
                        choiceDescriptor = reply.getChoiceDescriptor();
                        perPeriodLoad[reply.get("startTime")] += choiceDescriptor.get("cost");
                    }
                    questionInstances.push(questionInstance);
                }

                for (i = 0; i < questionsVarDesc.length; i += 1) {                  // Generate table body
                    question = questionsVarDesc[i];
                    questionInstance = questionInstances[i];

                    if (!questionInstance.get("active")) {                          // Do not render inactive questions
                        continue;
                    }

                    acc.push('<tr data-questionId="' + question.get("id") + '"><td class="schedule-leftcolum" >' +
                        (question.get("label") || question.get("name") || "undefined") + "</td>");
                    cols = [];
                    names = [];
                    replies = [];

                    for (j = 0; j <= totalPeriods; j += 1) {                        // Initially, all time slots are available
                        if (j >= currentTime) {
                            cols.push(["schedule-item", "schedule-available"]);
                        } else {
                            cols.push(["schedule-item"]);
                        }
                        replies.push(null);
                        names.push("");
                    }

                    for (j = 0; j < questionInstance.get("replies").length; j += 1) {
                        reply = questionInstance.get("replies")[j];
                        cIndex = reply.get("startTime");
                        choiceDescriptor = reply.getChoiceDescriptor(),
                        choiceInstance = choiceDescriptor.getInstance();

                        cols[cIndex] = ["schedule-unavailable", "schedule-task",
                        "schedule-unavailable-" + choiceDescriptor.get("duration")];

                        if (currentTime >= reply.get("startTime") && currentTime < reply.get("startTime") + choiceDescriptor.get("duration")) {
                            cols[cIndex].push("schedule-ongoingtask");
                        }

                        names[cIndex] = choiceDescriptor.get("name");
                        replies[cIndex] = reply;

                        for (k = 1; k < choiceDescriptor.get("duration"); k += 1) {
                            cols[cIndex + k] = ["schedule-unavailable"];
                        }

                        cols[cIndex].push((choiceInstance.get("active")) ? "schedule-active" : "schedule-inactive");
                    }

                    for (j = 0; j <= totalPeriods; j += 1) {
                        if (j > currentTime) {
                            cols[j].push("schedule-future");                        // Mark cells in the future
                        } else if (j < currentTime) {
                            cols[j].push("schedule-past");                          // Mark cells in the past
                        } else {
                            cols[j].push("schedule-present");                       // Mark cells in the past
                        }
                    }

                    for (j = 0; j < cols.length; j += 1) {                          // Render each cell
                        acc.push('<td data-startTime="', j,
                            '" class="', cols[j].join(" "), '"><div>');
                        if ( replies[j] ) {
                            acc.push('<div class="icon wegas-tooltip-trigger" title="',
                                escape( this.renderDetails( replies[j] ) ), '" data-replyid="',
                                replies[j].get("id"), '">',  names[j], '<div class="close-icon"></div></div>');
                        } else {
                            acc.push('<div class="icon"> <div class="close-icon"></div></div>');
                        }
                        acc.push('</div></td>');

                    }

                    acc.push("</tr>");
                }

                acc.push( '<tfoot><tr>',                                            // Generate table footer
                    '<td class="schedule-leftcolum">Available human resources</td>');

                for (i = 0; i < perPeriodLoad.length; i += 1) {
                    acc.push('<td>' + ( perPeriodBudget - perPeriodLoad[i]) + '/' + perPeriodBudget + '</td>' );
                }
                acc.push("</tr></tfoot></table>");

                cb.set( "innerHTML", acc.join( "" ) );                          // Update ContentBox
            },

            currentQuestionId: null,

            renderDetailsPanel: function () {
                this.datatable = new Y.DataTable({
                    columns: [{
                        key: "startTime",
                        //className: 'hidden',
                        label:"Period",
                        sortable:true,
                        className: "period"
                    }, {
                        key:"analyis",
                        label:"Analyse",
                        sortable:true
                    }, {
                        key:"answer",
                        label:"Result"
                    }, {
                        key:"fileLinks",
                        label:"Files",
                        emptyCellValue: "no files"
                    }]
                });
                this.datatable.render(this.get( CONTENTBOX ).one(".schedule-analysis"));
            },
            syncDetailsPanel: function () {
                var i, reply, status, replyData, cb = this.get(CONTENTBOX),
                question = Y.Wegas.VariableDescriptorFacade.rest.findById( this.currentQuestionId ),
                questionInstance = question.getInstance(),
                data = [];

                cb.one("h1").setContent( question.get("label") || question.get("name") || "undefined" );
                cb.one(".content").setContent( question.get("description") || "<em>No description</em>" );

                while ( this.datatable.getRow( 0 ) ) {
                    this.datatable.removeRow( 0 );
                }

                for (i = 0; i < questionInstance.get("replies").length; i += 1) {
                    reply = questionInstance.get("replies")[i];
                    replyData = Y.mix( reply.getAttrs(), reply.get( "result" ).getAttrs() ),
                    status = reply.getStatus( this.currentTime );

                    if (status === 1) {
                        replyData.answer = "analysis in progress";
                    } else if (status === 2) {
                        replyData.answer = "analysis planified";
                    }
                    replyData.analyis = reply.getChoiceDescriptor().get( "name" );
                    replyData.startTime =  replyData.startTime + 1;
                    data.push( replyData );
                }
                this.datatable.addRows( data );

                cb.one(".schedule-detail").setStyles( {
                    position: 'display',
                    display:"block",
                    overflowX:"auto"
                });
                /* gallery : [{srcUrl:'url', description:'text'},{}, ...]*/
                this.gallery.set("gallery",question.get("pictures"));
            },
            renderDetails: function ( reply ) {
                var choiceDescriptor = reply.getChoiceDescriptor(),
                status = reply.getStatus( this.currentTime ),
                ret = ['<div class="schedule-detail-reply"><h3>Period ',
                reply.get( "startTime" ) + 1 , ': ', choiceDescriptor.get("name") || "undefined",
                '</h3><div class="content">'];

                if (status === 0) {
                    ret.push( reply.get( "result" ).get( "answer" ));
                } else if (status === 1) {
                    ret.push("analysis in progress");
                } else {
                    ret.push("analysis planified");
                }
                ret.push("</div>");
                return ret.join("");
            },
            hideDetails: function () {
                this.get(CONTENTBOX).one(".schedule-detail").setStyles({
                    position: 'display',
                    display: "none"
                });
                this.currentQuestionId = null;
            },

            // *** Events Methods *** /

            onCancelReplyClick: function(e, args) {
                var replyId =  e.target.ancestor(".icon").getAttribute("data-replyid");

                Y.Wegas.VariableDescriptorFacade.rest.sendRequest({
                    request: "/QuestionDescriptor/CancelReply/" + replyId
                });
            },
            onMenuClick: function (e) {
                var data = e.target.get( "data" );

                Y.Wegas.VariableDescriptorFacade.rest.sendRequest({
                    request: "/QuestionDescriptor/SelectChoice/" + data.choice.get("id")
                    + "/Player/" + Y.Wegas.app.get('currentPlayer') + "/StartTime/" + data.startTime + "/"
                });
            },
            /**
         * Return a list of possible actions on a given action at a given time.
         */
            genMenuItems: function ( question, startTime ) {
                var perPeriodBudget = 15, ret = [], i, j, disabled, choice, choiceInstance;
                for ( i = 0; i < question.get("items").length; i += 1 ) {
                    choice = question.get("items")[i];
                    choiceInstance = choice.getInstance();

                    disabled = !choiceInstance.get("active") ||                 // Check if the choice is active
                    this.perPeriodLoad[startTime] + choice.get("cost")         // and if we have enough resources
                    > perPeriodBudget;

                    for ( j = 0; j < choice.get( "duration" ); j = j + 1 ) {
                        disabled = disabled                                     // finally we check if there is no other task assigned for this timeslot
                        || question.getRepliesByStartTime( startTime + j ).length > 0;
                    }
                    //this.perPeriodLoad[]
                    ret.push({
                        type: "Button",
                        label: choice.get( "label" ) || choice.get( "name" ) || "undefined",
                        data: {
                            choice: choice,
                            startTime: startTime
                        },
                        disabled: disabled
                    });
                }
                return ret;
            }
        });

    Y.namespace('Wegas').ScheduleDisplay = ScheduleDisplay;
});