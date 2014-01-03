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
 **/
describe('Activity Streams Actions', function(){

    describe('ActionHandler class', function(){

        describe('initialize()', function(){
            it('should populate defaults', function(){
                var actionHandler;
                actionHandler = new ActivityStreams.ActionHandler('testHandler');
                var defaults = actionHandler.defaults;
                expect(defaults).toEqual({
                    confirm: false
                });
                var fooHandler = function(){ ActivityStreams.ActionHandler.apply(this, arguments) };
                fooHandler.prototype = _.extend({}, ActivityStreams.ActionHandler.prototype, {
                    objectType: 'FooHandler',
                    defaults: {
                        one: 1,
                        two: 2
                    }
                });
                actionHandler = new fooHandler();
                expect(actionHandler.defaults).toEqual({
                    one: 1,
                    two: 2,
                    confirm: false
                });
                fooHandler.prototype = _.extend({}, ActivityStreams.ActionHandler.prototype, {
                    objectType: 'FooHandler',
                    defaults: {
                        confirm: 1,
                        two: 2
                    }
                });
                actionHandler = new fooHandler();
                expect(actionHandler.defaults).toEqual({
                    confirm: 1,
                    two: 2
                });
            });
        });
    });

    describe('HttpActionHandler class', function(){
        var httpActionHandler;
        beforeEach(function(){
            httpActionHandler = new ActivityStreams.HttpActionHandler();
            httpActionHandler.run = function(){};  //empty for now
            spyOn(httpActionHandler, 'run');
        });
        describe('handle()', function(){
            it('should populate handler definition with defaults before calling run', function(){
                httpActionHandler.handle('test', {url: 'http://example.com'});
                expect(httpActionHandler.run).toHaveBeenCalledWith('test', {
                    url: 'http://example.com',
                    method: 'GET',
                    target: 'DEFAULT',
                    confirm: false
                }, undefined);
            });
            it('should convert a string definition into an object definition with string as URL property', function(){
                httpActionHandler.handle('test', 'http://example.com');
                expect(httpActionHandler.run).toHaveBeenCalledWith('test', {
                    url: 'http://example.com',
                    method: 'GET',
                    target: 'DEFAULT',
                    objectType : 'HttpActionHandler',
                    confirm: false
                }, undefined);
            });
            it('should throw an exception if URL property is not defined', function(){
                try {
                    httpActionHandler.handle('test', {method: 'GET'});
                    fail("Should have thrown ActionsException");
                } catch(e) {
                    expect(e.name).toBe("ActionsException");
                }
            });
        });
    });

    describe('Actions class', function(){
        var Actions;
        beforeEach(function(){
            Actions = new ActivityStreams.Actions();
        });
        describe('registerActionHandler()', function(){
            it('registers action handlers', function(){
                expect(_.isFunction(Actions.registerActionHandler)).toBeTruthy();
                var handler = new ActivityStreams.ActionHandler('test');
                expect(Actions.registerActionHandler(handler)).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.HttpActionHandler())).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.IntentActionHandler())).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.EmbedActionHandler())).toBeUndefined();
            });
            it('should throw an exception if it is not passed an ActionHandler object', function(){
                try {
                    Actions.registerActionHandler();
                    fail("Should have thrown ActionsException");
                } catch(e) {
                    expect(e.name).toBe("ActionsException");
                }
                try {
                    Actions.registerActionHandler('id', 1);
                    fail("Should have thrown ActionsException");
                } catch(e) {
                    expect(e.name).toBe("ActionsException");
                }
                try {
                    Actions.registerActionHandler({});
                    fail("Should have thrown ActionsException");
                } catch(e) {
                    expect(e.name).toBe("ActionsException");
                }
            });
        });
        describe('getActionsWithHandlers()', function(){
            var actionObj;
            beforeEach(function(){
                actionObj = {
                    actions: {
                        shortHttpAction: 'http://fakeurl.com',
                        fullHttpAction: {
                            url: 'http://fakeurl.com',
                            objectType: 'HttpActionHandler'
                        },
                        embedAction: {
                            objectType: 'EmbedActionHandler'
                        },
                        multiHandlerAction: [
                            {
                                objectType: 'HttpActionHandler'
                            },
                            {
                                objectType: 'EmbedActionHandler'
                            }
                        ],
                        neverAction: null
                    }
                };
            });
            it('should return empty array if no handlers are registered', function(){
                expect(Actions.getActionsWithHandlers(actionObj)).toEqual([]);
            });
            it('should return actions for all registered handlers', function(){
                Actions.registerActionHandler(new ActivityStreams.HttpActionHandler());
                expect(Actions.getActionsWithHandlers(actionObj)).toEqual(['shortHttpAction', 'fullHttpAction', 'multiHandlerAction']);
                Actions.registerActionHandler(new ActivityStreams.EmbedActionHandler());
                expect(Actions.getActionsWithHandlers(actionObj)).toEqual(['shortHttpAction', 'fullHttpAction', 'embedAction', 'multiHandlerAction'])
            });
        });

        describe('confirmAction()', function(){
            it('default implementation should call onConfirm', function(){
                var foo = {
                    onConfirm: function(){}
                };
                spyOn(foo, 'onConfirm');
                Actions.confirmAction('fakeName', {}, foo.onConfirm);
                expect(foo.onConfirm).toHaveBeenCalled();
            });
        });

        describe('triggerAction()', function(){
            var actionObj, httpHandler, embedHandler;
            beforeEach(function(){
                actionObj = {
                    actions: {
                        httpAction: 'http://fakeurl.com',
                        multiHandlerAction: [
                            {
                                objectType: 'HttpActionHandler',
                                url: 'http://fakeurl.com'
                            },
                            {
                                objectType: 'EmbedActionHandler'
                            }
                        ],
                        neverAction: null,
                        confirmAction: {
                            objectType: 'HttpActionHandler',
                            url: 'http://fakeurl.com',
                            confirm: true
                        }
                    }
                };
                httpHandler = new ActivityStreams.HttpActionHandler();
                httpHandler.run = function(action, handlerDef){
                    expect(action).toEqual('httpAction');
                    expect(handlerDef).toEqual({
                        url: 'http://fakeurl.com',
                        method: 'GET',
                        target: 'DEFAULT',
                        objectType : 'HttpActionHandler',
                        confirm: false
                    });
                };
                spyOn(httpHandler, "run").andCallThrough();
                embedHandler = new ActivityStreams.EmbedActionHandler();
                embedHandler.run = function(action, handlerDef){
                    expect(action).toEqual('multiHandlerAction');
                    expect(handlerDef).toEqual({
                        objectType : 'EmbedActionHandler',
                        confirm: false
                    });
                };
                spyOn(embedHandler, "run").andCallThrough();
            });
            it('should return false if no handler registered for this action', function(){
                expect(Actions.triggerAction('httpAction', actionObj)).toBe(false);
                expect(Actions.triggerAction('neverAction', actionObj)).toBe(false);
            });
            it('should trigger the Action Handler registered for this action', function(){
                Actions.registerActionHandler(httpHandler);
                var result = Actions.triggerAction('httpAction', actionObj);
                expect(result).toBe(true);
                expect(httpHandler.run).toHaveBeenCalled();
            });
            it('should trigger the first registered Action Handler for this action', function(){
                Actions.registerActionHandler(embedHandler);
                var result = Actions.triggerAction('multiHandlerAction', actionObj);
                expect(result).toBe(true);
                expect(embedHandler.run).toHaveBeenCalled();
                httpHandler = new ActivityStreams.HttpActionHandler();
                spyOn(httpHandler, "run");
                Actions.registerActionHandler(httpHandler);
                Actions.triggerAction('multiHandlerAction', actionObj);
                expect(httpHandler.run).toHaveBeenCalled();
            });
            it('should pass context if provided', function(){
                Actions.registerActionHandler(embedHandler);
                Actions.triggerAction('multiHandlerAction', actionObj, 'mine');
                expect(embedHandler.run).toHaveBeenCalledWith(
                    'multiHandlerAction',
                    {
                        objectType : 'EmbedActionHandler',
                        confirm: false
                    },
                    'mine');
            });
            it('should call confirmAction if handler definition requires it', function(){
                Actions.registerActionHandler(httpHandler);
                spyOn(Actions, 'confirmAction');
                Actions.triggerAction('confirmAction', actionObj);
                expect(Actions.confirmAction).toHaveBeenCalled();
            });
        });
    });

});