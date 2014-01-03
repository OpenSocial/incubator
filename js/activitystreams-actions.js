/**
 * Copyright 2013 OpenSocial Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Utility library for working with Activity Streams Actions
 * Requires underscorejs.
 *
 * @author Matt Marum
 * @namespace ActivityStreams
 */

if (typeof window !== 'undefined' && !window.ActivityStreams) {
    window.ActivityStreams = {};
}
if(typeof exports !== 'undefined'){
    this._ = require('underscore');
    var ActivityStreams = exports;
}
(function(){
    var _ = this._ || window._;

    /**
     * ActionsException class
     * @class
     * @memberOf ActivityStreams
     */
    var ActionsException = ActivityStreams.ActionsException = function(message){
        this.message = message;
        this.name = "ActionsException";
        this.toString = function(){
            return this.name + ": " + this.message;
        };
    };

    /**
     * Class for handling Activity Stream Actions.
     * See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02} for details on Action Handlers.
     * @class
     * @memberOf ActivityStreams
     */
    var Actions = ActivityStreams.Actions = function(){
        /**
         * Action Handler registry
         * @type {Object}
         * @private
         */
        this._actionHandlers = {};
    };

    Actions.prototype = {
        /**
         * Register an Action Handler callback
         * @memberOf ActivityStreams.Actions
         * @param {ActionHandler} actionHandler Handler to register
         * @throws {ActivityStreams.ActionsException} if ActionHandler is not valid
         */
        registerActionHandler: function(actionHandler) {
            if (_.isObject(actionHandler) && _.isString(actionHandler.objectType)) {
                this._actionHandlers[actionHandler.objectType] = actionHandler;
            } else {
                throw new ActionsException("ActionHandler is not an Object or is missing type");
            }
        },
        /**
         * Get list of Actions that can be handled for this ActivityObject
         * @memberOf ActivityStreams.Actions
         * @param {ActivityObject} aObject ActivityObject to fetch actions from
         * @returns {Array} List of Action names
         */
        getActionsWithHandlers: function(aObject) {
            var actions = [];
            if (aObject && aObject.actions) {
                _.each(aObject.actions, function(handlerDef, actionName){
                    if (_.isString(handlerDef)) {
                         // A string is assumed to be a URL, which means an HttpActionHandler will be used
                        if (this._actionHandlers['HttpActionHandler']) {
                            actions.push(actionName);
                            return;
                        }
                    } else if (_.isObject(handlerDef) && !_.isArray(handlerDef)) {
                        handlerDef = [handlerDef];
                    }
                    if(_.isArray(handlerDef)) {
                        var add = _.any(handlerDef, function(def){
                            if (_.isObject(def) && def.objectType) {
                                return this._actionHandlers[def.objectType];
                            }
                        }, this);
                        if (add) actions.push(actionName);
                    }
                }, this);
            }
            return actions;
        },
        /**
         * Called during {@link ActivityStreams.Actions.triggerAction} when an action being triggered ought to seek
         * confirmation from user prior to carrying out action.  Implementations should trigger onConfirm callback
         * to continue with action as needed.
         *
         * Default implementation auto-confirms, consumers should override this function to properly implement user
         * confirmation.
         *
         * See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02#section-2}
         *
         * @memberOf ActivityStreams.Actions
         * @param {String} action Name of action being triggered
         * @param {Object} handlerDef Activity Handler definition that is being used
         * @param {Function} onConfirm Callback to trigger if user confirms this action
         * @param {*} context (Optional) Consumer context that was passed when this action was triggered
         */
        confirmAction: function(action, handlerDef, onConfirm, context){
            //default behavior
            onConfirm();
        },
        /**
         * Triggers the appropriate action handler for the given action on the given activity
         * @memberOf ActivityStreams.Actions
         * @param {String} action Name of action being triggered
         * @param {ActivityObject} aObject ActivityStreams object being used
         * @param {*} context (Optional) Consumer context that ActionHandler should receive
         * @returns {Boolean} True if an appropriate action handler was found, false otherwise.
         */
        triggerAction: function(action, aObject, context) {
            context = context || this;
            if (_.isString(action) && aObject && aObject.actions) {
                var handlerDef = aObject.actions[action];
                if (_.isString(handlerDef)) {
                    // We assume this is a URL and will use HttpActionHandler
                    handlerDef = {
                        objectType: 'HttpActionHandler',
                        url: handlerDef
                    };
                }
                if (_.isArray(handlerDef)) {
                    //Get first registered handler
                    handlerDef = _.find(handlerDef, function(def){
                        if (_.isObject(def) && def.objectType) {
                            return this._actionHandlers[def.objectType];
                        }
                    }, this);
                }
                if (_.isObject(handlerDef) && handlerDef.objectType) {
                    var type = handlerDef.objectType;
                    if (_.isObject(this._actionHandlers[type])) {
                        var actionHandler = this._actionHandlers[type];
                        var onConfirm = function(){
                            actionHandler.handle(action, handlerDef, context);
                        };
                        // Check if confirmation is required, if so trigger consumer's confirm callback
                        if (handlerDef.confirm) {
                            this.confirmAction(action, handlerDef, onConfirm, context);
                        } else {
                            onConfirm();
                        }
                        return true;
                    }
                }
            }
            return false;
        }
    };


    /**
     * Default implementation for all ActionHandlers.
     * See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02#section-2} for details.
     * @class
     * @memberOf ActivityStreams
     * @param {String} type (optional) Type for this ActionHandler
     */
    var ActionHandler = ActivityStreams.ActionHandler = function(objectType){
        if(objectType){
            this.objectType = objectType;
        }
        this.initialize();
    };
    ActionHandler.prototype = {
        /**
         * Set of default properties to use with action definitions for this ActionHandler
         * @memberOf ActivityStreams.ActionHandler
         */
        defaults: {
            confirm: false
        },
        /**
         * Initialize this ActionHandler after it has been created.
         * Default implementation setups up defaults.
         * @memberOf ActivityStreams.ActionHandler
         */
        initialize: function(){
            this.defaults = _.extend({}, ActionHandler.prototype.defaults, this.defaults);
        },
        /**
         * Called when this ActionHandler is invoked.  All ActionHandlers must implement this function.
         * @memberOf ActivityStreams.ActionHandler
         * @param {String} action Name of action being triggered
         * @param {Object} handlerDef Activity Handler definition that is being used
         * @param {*} context (Optional) Consumer context that was passed when this action was triggered
         * @throws {ActivityStreams.ActionsException} if run function is not implemented
         */
        run: function(action, handlerDef, context){
            throw new ActionsException(this.objectType + " run method not implemented!!");
        },
        /**
         * Called when this action is first triggered.  Performs setup and then runs the action.
         * @memberOf ActivityStreams.ActionHandler
         * @param {String} action Name of action being triggered
         * @param {Object} handlerDef Activity Handler definition that is being used
         * @param {*} context (Optional) Consumer context that was passed when this action was triggered
         * @throws {ActivityStreams.ActionsException} if fatal error occurs
         */
        handle: function(action, handlerDef, context) {
            var copy = _.extend({}, handlerDef, this.defaults);
            this.run(action, copy, context);
        }
    };

    /**
     * Client performs an HTTP request to a URL.  This is the default ActionHandler when only a URL string has been
     * specified.  See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02#section-3} for details.
     * @class
     * @memberOf ActivityStreams
     * @extends ActivityStreams.ActionHandler
     */
    var HttpActionHandler = ActivityStreams.HttpActionHandler = function(){ ActionHandler.apply(this, arguments) };
    HttpActionHandler.prototype = _.extend({}, ActionHandler.prototype, {
        objectType: 'HttpActionHandler',
        /**
         * Set of additional default values to use with HttpActionHandlers
         *
         * @memberOf ActivityStreams.HttpActionHandler
         */
        defaults: {
            method: 'GET',      // Default HTTP method to use
            target: 'DEFAULT'   // Intended target for HTTP action is the consumer defined default
        },
        /**
         * Converts URL handler into an object, does some pre-checking
         * @override
         * @private
         */
        handle: function(action, handlerDef, context) {
            if (_.isString(handlerDef)) { //Sanity check, in case this is invoked directly
                handlerDef = {
                    objectType: 'HttpActionHandler',
                    url: handlerDef
                };
            }
            if (_.isUndefined(handlerDef.url)) {
                throw new ActivityStreams.ActionsException('URL property is required for HttpActionHandler');
            }
            ActionHandler.prototype.handle.call(this, action, handlerDef, context);
        }
    });

    /**
     * Client presents an embed for this activity using inlined HTML content.
     * See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02#section-4} for details.
     * @class
     * @memberOf ActivityStreams
     * @extends ActivityStreams.ActionHandler
     */
    var EmbedActionHandler = ActivityStreams.EmbedActionHandler = function(){ ActionHandler.apply(this, arguments) };
    EmbedActionHandler.prototype = _.extend({}, ActionHandler.prototype, {
        objectType: 'EmbedActionHandler'
    });

    /**
     * Client performs an action based on client side configuration or user preferences.  The intent could be handled
     * by launching an external (mobile) application or via some other local action.
     * See {@link http://tools.ietf.org/html/draft-snell-activitystreams-actions-02#section-5} for details.
     * @class
     * @memberOf ActivityStreams
     * @extends ActivityStreams.ActionHandler
     */
    var IntentActionHandler = ActivityStreams.IntentActionHandler = function(){ ActionHandler.apply(this, arguments) };
    IntentActionHandler.prototype = _.extend({}, ActionHandler.prototype, {
        objectType: 'IntentActionHandler'
    });


}).call(this);
