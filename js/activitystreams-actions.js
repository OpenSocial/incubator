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
     * Class for handling Activity Stream Action processing
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
                    if(_.isObject(handlerDef) && handlerDef.objectType){
                        if(this._actionHandlers[handlerDef.objectType]){
                            actions.push(actionName);
                        }
                    }
                }, this);
            }
            return actions;
        },
        /**
         * Triggers the appropriate action handler for the given action on the given activity
         * @memberOf ActivityStreams.Actions
         * @param {String} action Name of action being triggered
         * @param {ActivityObject} aObject ActivityStreams object being used
         * @returns {ActionResult | undefined} An ActionResult or undefined if no appropriate action handler was found
         */
        triggerAction: function(action, aObject) {
            if (_.isString(action) && aObject && aObject.actions) {
                var handlerDef = aObject.actions[action];
                if (_.isObject(handlerDef) && handlerDef.objectType) {
                    var type = handlerDef.objectType;
                    if (_.isObject(this._actionHandlers[type])) {
                        /**
                         * @memberOf ActivityStreams.Actions
                         * @typedef ActionResult
                         * @type {Object}
                         * @property type Type of ActionHandler that was called
                         * @property result Return value for handler callback
                         */
                        return {
                            type: type,
                            result: this._actionHandlers[type].run(action, aObject)
                        };
                    }
                }
            }
        }
    };


    /**
     * Default implementation for all ActionHandlers
     * @class
     * @memberOf ActivityStreams
     * @param {String} type (optional) Type for this ActionHandler
     */
    var ActionHandler = ActivityStreams.ActionHandler = function(objectType){
        if(objectType){
            this.objectType = objectType;
        }
    };
    ActionHandler.prototype = {
        /**
         * Called when this ActionHandler is invoked.
         * @memberOf ActivityStreams.ActionHandler
         * @param {String} action Name of action being triggered
         * @param {ActivityObject} aObject ActivityStreams object being used
         * @throws {ActivityStreams.ActionsException} if run function is not implemented
         */
        run: function(action, aObject){
            throw new ActionsException(this.objectType + " run method not implemented!!");
        }
    };

    /**
     * Client performs an HTTP request to a URL.  This is the default ActionHandler when only a URL string has been
     * specified.
     * @class
     * @memberOf ActivityStreams
     * @extends ActivityStreams.ActionHandler
     */
    var HttpActionHandler = ActivityStreams.HttpActionHandler = function(){ ActionHandler.apply(this, arguments) };
    HttpActionHandler.prototype = _.extend({}, ActionHandler.prototype, {
        objectType: 'HttpActionHandler'
    });

    /**
     * Client presents an embed for this activity using inlined HTML content.
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
     * @class
     * @memberOf ActivityStreams
     * @extends ActivityStreams.ActionHandler
     */
    var IntentActionHandler = ActivityStreams.IntentActionHandler = function(){ ActionHandler.apply(this, arguments) };
    IntentActionHandler.prototype = _.extend({}, ActionHandler.prototype, {
        objectType: 'IntentActionHandler'
    });


}).call(this);
