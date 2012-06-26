/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-inputex', function(Y) {
    "use strict";

    var inputEx = Y.inputEx,
    lang = Y.Lang;

    YUI_config.groups.inputex.modulesByType.html = "wegas-inputex-rte";         // @fix so inputex will use our own widgets when using f = Y.inpuex(cfg)

    /**
     * Ace code editor field
     */
    inputEx.AceField = function(options) {
        inputEx.AceField.superclass.constructor.call(this,options);
    };
    Y.extend(inputEx.AceField, inputEx.Field, {
        /**
         * Set the default values of the options
         * @param {Object} options Options object as passed to the constructor
         */
        setOptions: function (options) {
            inputEx.AceField.superclass.setOptions.call(this, options);

            this.options.language = options.language || "javascript";
            this.options.height = options.height || "150px";
        },

        /**
	 * Render the field using the YUI Editor widget
	 */
        renderComponent: function () {
            this.el = Y.Node.create('<div style="height: ' + this.options.height +';width: 100%;position: initial;">'
                + (this.options.value ? this.options.value : "") + '</div>');
            this.fieldContainer.appendChild(this.el.getDOMNode());
            this.fieldContainer.style["position"] = "relative";

            this.editor = ace.edit(this.el.getDOMNode());
            this.editor.setHighlightActiveLine(false);
            this.editor.renderer.setHScrollBarAlwaysVisible(false);
            this.session = this.editor.getSession();

            var Mode = require("ace/mode/" + this.options.language).Mode;
            this.session.setMode(new Mode());

            Y.Wegas.app.on("layout:resize", function() {
                Y.on('domready', this.editor.resize, this.editor);
            }, this);

            this.session.addEventListener("tokenizerUpdate", Y.bind(function(e) {
                var i, token,
                tokens = this.session.getTokens(e.data.first, e.data.last);

                for (i = 0; i > tokens.length; i += 1) {
                    token = tokens[i];                                          //identifier
                }
            }, this));
        },

        genTree: function(token) {

        },

        /**
	 * Set the html content
	 * @param {String} value The html string
	 * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the 'updated' event or not (default is true, pass false to NOT send the event)
	 */
        setValue: function(value, sendUpdatedEvt) {
            this.session.setValue(value);
            if(sendUpdatedEvt !== false) {
                // fire update event
                this.fireUpdatedEvt();
            }
        },

        /**
	 * Get the ace content
	 * @return {String} the ace area content string
	 */
        getValue: function() {
            return this.session.getValue();
        }
    });

    // Register this class as "html" type
    inputEx.registerType("ace", inputEx.AceField, []);

    /*
     * @hack prevents KeyValueField to return the selector field
     */
    Y.inputEx.KeyValueField.prototype.getValue = function () {
        return this.inputs[1].getValue();
    };
    /*
     * @hack Automatically add the "optional" message when necessary
     */
    Y.inputEx.StringField.prototype.setOptions = function (options) {
        Y.inputEx.StringField.superclass.setOptions.call(this, options);

        this.options.regexp = options.regexp;
        this.options.size = options.size;
        this.options.maxLength = options.maxLength;
        this.options.minLength = options.minLength;
        this.options.typeInvite = options.typeInvite;
        if (!this.options.required && !this.options.typeInvite) { // !!!MODIFIED!!!
            this.options.typeInvite = "optional";
        }
        this.options.readonly = options.readonly;
        this.options.autocomplete = lang.isUndefined(options.autocomplete) ?
        inputEx.browserAutocomplete :
        (options.autocomplete === false || options.autocomplete === "off") ? false : true;
        this.options.trim = (options.trim === true) ? true : false;
    };
});