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
if (!window.ActivityStreams) {
    window.ActivityStreams = {};
}
(function(){
    var _ = this._ || window._;
    /**
     * Class for handling Activity Stream Action processing
     * @class Actions
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

    /**
     * Register an Action Handler callback
     * @method registerActionHandler
     * @memberOf ActivityStreams.Actions
     * @param {String} handler Name of action handler
     * @param {Function} callback The callback function that gets triggered
     * @returns {Boolean} TRUE if action handler has been successfully registered, FALSE otherwise
     */
    Actions.prototype.registerActionHandler = function(handler, callback) {
        if (_.isString(handler) && _.isFunction(callback)) {
            this._actionHandlers[handler] = callback;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get list of Actions that can be handled for this ActivityObject
     * @method getActionsWithHandlers
     * @memberOf ActivityStreams.Actions
     * @param {ActivityObject} activity Activity to fetch activities from
     * @returns {Array} List of Action names
     */
    Actions.prototype.getActionsWithHandlers = function(activity) {
        var actions = [];
        if (activity && activity.actions) {
            _.each(activity.actions, function(actionDef, actionName){
                if(_.isObject(actionDef)){
                    if (_.find(actionDef.handler, function(handler){
                        return this._actionHandlers[handler];
                    }, this)) {
                        actions.push(actionName);
                    }
                }
            }, this);
        }
        return actions;
    };
    /**
     * Triggers the appropriate action handler for the given action on the given activity
     * @method triggerAction
     * @memberOf ActivityStreams.Actions
     * @param {String} action Name of action being triggered
     * @param {ActivityObject} activity ActivityStreams object being used
     * @returns {ActionResult | undefined} An ActionResult or undefined if no appropriate action handler was found
     */
    Actions.prototype.triggerAction = function(action, activity) {
        if (_.isString(action) && activity && activity.actions) {
            var actionDef = activity.actions[action];
            if (_.isObject(actionDef)) {
                 return _.find(actionDef.handler, function(handler) {
                    if (_.isFunction(this._actionHandlers[handler])) {
                        /**
                         * @memberOf ActivityStreams.Actions
                         * @typedef ActionResult
                         * @type {Object}
                         * @property handler ID for action handler that was called
                         * @property result Return value for handler callback
                         */
                        return {
                            handler: handler,
                            result: this._actionHandlers[handler].call(this, action, activity)
                        };
                    }
                }, this);
            }
        }
    };


}).call(this);
