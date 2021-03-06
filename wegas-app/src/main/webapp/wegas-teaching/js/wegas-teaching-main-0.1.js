YUI.add( "wegas-teaching-main", function ( Y ) {
    "use strict";
    
    var CONTENTBOX = "contentBox", TeachingMain;
    
    TeachingMain = Y.Base.create("wegas-teaching-main", Y.Widget, [Y.WidgetChild, Y.Wegas.Widget, Y.Wegas.Editable], {
        
        // Graphic (Y.Graphic used to draw arrows)
        graphic: null,
        // Arrows (persistent data)
        arrow1: null,
        arrow2: null,
        arrow3: null,
        arrow4: null,
        arrow5: null,
        arrow6: null,
        arrow7: null,
        arrow8: null,
        arrow9: null,
        arrow10: null,
        arrow11: null,
        arrow12: null,
        // Arrow const
        ARROW_NONE: 0,
        ARROW_NORMAL: 1,
        ARROW_INVERSE: 2,
        ARROW_DOUBLE: 3,
        // Orientation const
        ORIENTATION_HORIZONTAL: 0,
        ORIENTATION_VERTICAL: 1,
        // Ref on selected arrow
        currentArrow: null,
        // Rectangles (persistent data)
        rectangle1: null,
        rectangle2: null,
        rectangle3: null,
        rectangle4: null,
        rectangle5: null,
        rectangle6: null,
        rectangle7: null,
        rectangle8: null,
        rectangle9: null,
        // Ref on selected rectangle
        currentRectangle: null,
        // Editors (modal form)
        arrowEditor: null,
        btnArrowNormal: null,
        btnArrowInverse: null,
        btnArrowDouble: null,
        btnArrowNone: null,
        rectangleEditor: null,
        editor: null,
        
        initializer: function(){
            /* Nothing */
        },
        
        showRectangleEditor: function(rectangle) {
            this.currentRectangle = rectangle;
            this.editor.set('content', rectangle.get('label'));
            this.editor.focus();
            this.rectangleEditor.show();
        },
        
        showArrowEditor: function(arrow) {
            this.currentArrow = arrow;
            this.setArrowEditorButtons(arrow.get('val'));
            document.getElementById('arrowCurrentText').value = arrow.get('text');
            // Set correct image (vertical or horizontal)
            if (arrow.get('orientation') == this.ORIENTATION_HORIZONTAL) {
                this.btnArrowNormal.set('label', '<span class="icon horizontal-normal"></span>');
                this.btnArrowInverse.set('label', '<span class="icon horizontal-inverse"></span>');
                this.btnArrowDouble.set('label', '<span class="icon horizontal-double"></span>');
                this.btnArrowNone.set('label', '<span class="icon horizontal-none"></span>');
            }
            else { // vertical
                this.btnArrowNormal.set('label', '<span class="icon vertical-normal"></span>');
                this.btnArrowInverse.set('label', '<span class="icon vertical-inverse"></span>');
                this.btnArrowDouble.set('label', '<span class="icon vertical-double"></span>');
                this.btnArrowNone.set('label', '<span class="icon vertical-none"></span>');
            }
            this.arrowEditor.show();
            Y.one('#arrowCurrentText').focus();
        },
        
        createArrow: function(x1, y1, x2, y2, id) {
            //var arrowInstance = Y.Wegas.Facade.VariableDescriptor.cache.find("name", "arrow" + id);
            //var val = arrowInstance.getInstance().get("value");
            var arrowInstance = Y.Wegas.Facade.VariableDescriptor.cache.find("name", "fleche" + id).getInstance();
            var val = arrowInstance.get("properties").value;
            var text = arrowInstance.get("properties").text;
            var color = this.getColorByVal(val);
            var orientation = x1 == x2; // true = 1: vertical (else horizontal)            
            
            var arrow = this.graphic.addShape({
                type: Y.TeachingArrow,
                stroke: {
                    weight: 5,
                    color: color
                },
                src: [x1, y1],
                tgt: [x2, y2],
                id: id,
                val: val,
                text: text,
                orientation: orientation
            });
            var handleClick = function(e, parent) {
                parent.showArrowEditor(arrow);
            };
            var node = Y.Node(arrow.get('node'));
            node.on('click', handleClick, this, this);
            
            this.createButton(x1, y1, id, orientation, handleClick);
            this.createLabel(x1, y1, id, text, orientation, handleClick);
            
            return arrow;
        },
                
        createButton: function(x1, y1, id, orientation, handleClick) {
            // Button to edit arrow
            var button = Y.one("#btnArrow" + (id-1));
            button.setStyle('position', 'absolute');
            
            // Apply styles (difference between vertical and horizontal arrow)
            if (orientation == this.ORIENTATION_VERTICAL) {
                button.setStyle('left', x1 - 60);
                button.setStyle('top', y1 + 26);
                
            }
            else { // horizontal
                button.setStyle('left', x1 + 16);
                button.setStyle('top', y1 - 40);
                
            }
            button.on('click', handleClick, this, this);
        },
                
        createLabel: function(x1, y1, id, text, orientation, handleClick) {
            var label = Y.one("#lblArrow" + (id-1));
            label.setStyle('position', 'absolute');
            var child = label.one('*');
            var content = child.one('*');
            content.setHTML(text);
            
            if (orientation == this.ORIENTATION_VERTICAL) {
                label.setStyle('left', x1 + 25);
                label.setStyle('top', y1 + 25);
                child.addClass('yui3-tooltip-align-right');
                child.setStyle('width', '70px');
                child.setStyle('height', '30px');
            }
            else { // horizontal
                label.setStyle('left', x1 + 13);
                label.setStyle('top', y1 + 25);
                child.addClass('yui3-tooltip-align-bottom');
                child.setStyle('width', '60px');
                child.setStyle('height', '30px');
            }
            label.on('click', handleClick, this, this);
            
            return content;
        },
        
        createRectangle: function(x, y, id, cb) {
            //var rectangles = Y.Wegas.Facade.VariableDescriptor.cache.find("name", "rectangles").getAttrs().items;
            //var val = rectangles[id].getInstance().get("value");
            var rectangleInstance = Y.Wegas.Facade.VariableDescriptor.cache.find("name", "rectangle" + (id + 1));
            var val = rectangleInstance.getInstance().get("value");
            
            var rectangle = new Y.Wegas.TeachingRectangle({
                x: x,
                y: y,
                label: val,
                id: id
            });
            var handleClick = function(e, parent) {
                parent.showRectangleEditor(rectangle);
            };
            Y.one("#rectangle" + id).on('click', handleClick, this, this);
            rectangle.render(cb.one("#rectangle" + id));
            return rectangle;
        },
        
        renderUI: function() {
            var cb = this.get(CONTENTBOX);
            cb.append("<div id='layer' style='width:100%;height:620px;'></div>");
            cb.append("<div id='arrowEditor'><div class='yui3-widget-bd' style='padding:8px;'><input id='arrowCurrentText' /><p><button id='btnArrowNormal'></button><button id='btnArrowInverse'></button><button id='btnArrowDouble'></button><button id='btnArrowNone'></button></p><button id='btnSaveArrow'>Sauvegarder</button></div></div>");
            cb.append("<div id='rectangleEditor'><div class='yui3-widget-bd' style='padding:8px;'><div id='editor'></div><button id='btnSaveRectangle'>Sauvegarder</button></div></div>");
            cb.append("<div id='rectangle0' class='invisible'></div>");
            cb.append("<div id='rectangle1' class='invisible'></div>");
            cb.append("<div id='rectangle2' class='invisible'></div>");
            cb.append("<div id='rectangle3' class='invisible'></div>");
            cb.append("<div id='rectangle4' class='invisible'></div>");
            cb.append("<div id='rectangle5' class='invisible'></div>");
            cb.append("<div id='rectangle6' class='invisible'></div>");
            cb.append("<div id='rectangle7' class='invisible'></div>");
            cb.append("<div id='rectangle8' class='invisible'></div>");
            cb.append("<button id='btnArrow0' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow1' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow2' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow3' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow4' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow5' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow6' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow7' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow8' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow9' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow10' class='yui3-button'>�diter</button>");
            cb.append("<button id='btnArrow11' class='yui3-button'>�diter</button>");
            cb.append("<div id='lblArrow0' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow1' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow2' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow3' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow4' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow5' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow6' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow7' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow8' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow9' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow10' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            cb.append("<div id='lblArrow11' class='yui3-tooltip'><div class='yui3-tooltip-content'><div class='yui3-widget-bd' style='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>Lien blabla blabla blabla</div><div class='yui3-widget-ft'><div></div></div></div></div>");
            
            this.graphic = new Y.Graphic({render: "#layer", autoDraw: true});
            /* Create and add 12 arrows */
            this.arrow1 = this.createArrow(100, 225, 100, 300, 1);
            this.arrow2 = this.createArrow(375, 225, 375, 300, 2);
            this.arrow3 = this.createArrow(650, 225, 650, 300, 3);
            this.arrow4 = this.createArrow(200, 150, 275, 150, 4);
            this.arrow5 = this.createArrow(475, 150, 550, 150, 5);
            this.arrow6 = this.createArrow(200, 375, 275, 375, 6);
            this.arrow7 = this.createArrow(475, 375, 550, 375, 7);
            this.arrow8 = this.createArrow(100, 450, 100, 525, 8);
            this.arrow9 = this.createArrow(375, 450, 375, 525, 9);
            this.arrow10 = this.createArrow(650, 450, 650, 525, 10);
            this.arrow11 = this.createArrow(200, 600, 275, 600, 11);
            this.arrow12 = this.createArrow(475, 600, 550, 600, 12);
            /* Create and add 9 rectangles */
            this.rectangle1 = this.createRectangle(3, 78, 0, cb);            
            this.rectangle2 = this.createRectangle(280, 78, 1, cb);
            this.rectangle3 = this.createRectangle(555, 78, 2, cb);
            this.rectangle4 = this.createRectangle(3, 305, 3, cb);
            this.rectangle5 = this.createRectangle(280, 305, 4, cb);
            this.rectangle6 = this.createRectangle(555, 305, 5, cb);
            this.rectangle7 = this.createRectangle(3, 530, 6, cb);
            this.rectangle8 = this.createRectangle(280, 530, 7, cb);
            this.rectangle9 = this.createRectangle(555, 530, 8, cb);
            /* Init editors */
            this.initArrowEditor();
            this.initRectangleEditor();
        },
        
        bindUI: function() {

        },
                
        syncUI: function() {
    
        },
                
        destructor: function() {

        },
        
        saveCurrentArrow: function() {
            Y.Wegas.Facade.VariableDescriptor.sendRequest({
                request: "/Script/Run/" + Y.Wegas.app.get('currentPlayer'),
                headers: {
                    'Content-Type': 'application/json; charset=ISO-8859-1',
                    'Managed-Mode': 'true'
                },
                cfg: {
                    method: "POST",
                    data: Y.JSON.stringify({
                        "@class": "Script",
                        "language": "JavaScript",
                        "content": "importPackage(com.wegas.core.script);\n" +
                            "\nfleche" + this.currentArrow.get("id") + ".properties.put('value','" + this.currentArrow.get("val") + "');" +
                            "\nfleche" + this.currentArrow.get("id") + ".properties.put('text','" + this.currentArrow.get("text") + "');"
                    })
                }
            });
        },
                
        saveCurrentRectangle: function() {            
            Y.Wegas.Facade.VariableDescriptor.sendRequest({
                request: "/Script/Run/" + Y.Wegas.app.get('currentPlayer'),
                headers: {
                    'Content-Type': 'application/json; charset=ISO-8859-1',
                    'Managed-Mode': 'true'
                },
                cfg: {
                    method: "POST",
                    data: Y.JSON.stringify({
                        "@class": "Script",
                        "language": "JavaScript",
                        "content": "importPackage(com.wegas.core.script);\nrectangle" + (this.currentRectangle.get("id") + 1) + ".value='" + String(this.currentRectangle.get("label")).replace(/'/g, '&#39;') + "';"
                    })
                }
            });
        },
                
        initArrowEditor: function() {
            this.arrowEditor = new Y.Panel({
                srcNode: "#arrowEditor",
                headerContent: "Editeur lien",
                xy: [120,100],
                width: 300,
                zIndex: 50000,
                modal: true,
                visible: false,
                render: true,
                plugins: [Y.Plugin.Drag]
            });
            
            var links = [];
            var listLinks = Y.Wegas.Facade.VariableDescriptor.cache.find("name", "links").getAttrs().items;
            for (var i = 0; i < listLinks.length; i++) {
                links.push(listLinks[i].getInstance().get("value"));
            }
            Y.one("#arrowCurrentText").plug(Y.Plugin.AutoComplete, {
                resultHighlighter: "phraseMatch",
                resultFilters: "phraseMatch",
                source: links
            });
            
            var onNormalClick = function(e, parent) {
                parent.setArrowEditorButtons(parent.ARROW_NORMAL);
            };
            this.btnArrowNormal = new Y.ToggleButton({
               srcNode: '#btnArrowNormal',
               label: '<span class="icon horizontal-normal"></span>'
            }).render();
            this.btnArrowNormal.on('click', onNormalClick, this, this);
            
            var onInverseClick = function(e, parent) {
                parent.setArrowEditorButtons(parent.ARROW_INVERSE);
            };
            this.btnArrowInverse = new Y.ToggleButton({
                srcNode: '#btnArrowInverse',
                label: '<span class="icon horizontal-inverse"></span>'
            }).render();
            this.btnArrowInverse.on('click', onInverseClick, this, this);
            
            var onDoubleClick = function(e, parent) {
                parent.setArrowEditorButtons(parent.ARROW_DOUBLE);
            };
            this.btnArrowDouble = new Y.ToggleButton({
                srcNode: '#btnArrowDouble',
                label: '<span class="icon horizontal-double"></span>'
            }).render();
            this.btnArrowDouble.on('click', onDoubleClick, this, this);
            
            var onNoneClick = function(e, parent) {
                parent.setArrowEditorButtons(parent.ARROW_NONE);
            };
            this.btnArrowNone = new Y.ToggleButton({
                srcNode: '#btnArrowNone',
                label: '<span class="icon horizontal-none"></span>'
            }).render();
            this.btnArrowNone.on('click', onNoneClick, this, this);
            
            var onSaveClick = function(e, parent) {
                var text = parent.getArrowEditorText();
                parent.currentArrow.setType(parent.getArrowEditorType());
                parent.currentArrow.setText(text);
                parent.saveCurrentArrow();
                Y.one("#lblArrow" + (parent.currentArrow.get('id') - 1)).one('*').one('*').setHTML(text);
                parent.arrowEditor.hide();
            };
            var btnSaveArrow = new Y.Button({
                srcNode: '#btnSaveArrow'
            }).render();
            btnSaveArrow.on('click', onSaveClick, this, this);
        },
                
        initRectangleEditor: function() {
            this.rectangleEditor = new Y.Panel({
               srcNode: "#rectangleEditor",
               headerContent: "Editeur d�finition",
               width: 300,
               zIndex: 50000,
               xy: [120, 100],
               modal: true,
               visible: false,
               render: true,
               plugins: [Y.Plugin.Drag]
            });
            
            var onSaveClick = function(e, parent) {
                parent.currentRectangle.set("label", parent.editor.get("content"));
                parent.currentRectangle.syncUI();
                parent.saveCurrentRectangle();
                parent.rectangleEditor.hide();
            };
            var btnSave = new Y.Button({
                srcNode: '#btnSaveRectangle'
            }).render();
            btnSave.on('click', onSaveClick, this, this);
            
            this.editor = new Y.EditorBase({
                content: '<p>Test</p>'
            });
            this.editor.plug(Y.Plugin.ITSAToolbar, {
                btnEmail: false, 
                btnFontfamily: false, 
                btnHeader: false, 
                btnFontsize: false, 
                btnHyperlink: false, 
                btnMarkcolor: false, 
                btnTextcolor: false, 
                grpAlign: false, 
                grpIndent: false, 
                grpLists: false, 
                grpSubsuper: false, 
                grpUndoredo: false,
                btnSize: 3
            });
            this.editor.render('#editor');
        },
        
        getColorByVal: function(val) {
            if (val == this.ARROW_NONE) {
                return 'rgb(200,200,200)';
            }
            else {
                return 'rgb(0,0,0)';
            }
        },
        
        setArrowEditorButtons: function(val) {
            this.btnArrowNormal.set('pressed', false);
            this.btnArrowInverse.set('pressed', false);
            this.btnArrowDouble.set('pressed', false);
            this.btnArrowNone.set('pressed', false);
            
            switch (parseInt(val)) {
                case this.ARROW_NORMAL:
                    this.btnArrowNormal.set('pressed', true);
                    break;
                case this.ARROW_INVERSE:
                    this.btnArrowInverse.set('pressed', true);
                    break;
                case this.ARROW_DOUBLE:
                    this.btnArrowDouble.set('pressed', true);
                    break;
                case this.ARROW_NONE:
                    this.btnArrowNone.set('pressed', true);
                    break;
                default:
                    console.log("unknown");
                    break;
            }
        },
        
        getArrowEditorType: function() {
            if (this.btnArrowNormal.get('pressed')) {
                return this.ARROW_NORMAL;
            }
            else if (this.btnArrowInverse.get('pressed')) {
                return this.ARROW_INVERSE;
            }
            else if (this.btnArrowDouble.get('pressed')) {
                return this.ARROW_DOUBLE;
            }
            else if (this.btnArrowNone.get('pressed')) {
                return this.ARROW_NONE;
            }
        },
                
        getArrowEditorText: function() {
            return Y.one('#arrowCurrentText').get('value');
        }
        
    }, {
        ATTRS: {
            
        }
    });
    
    Y.namespace("Wegas").TeachingMain = TeachingMain;
});
