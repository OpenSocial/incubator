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

    describe("Actions class", function(){
        var Actions;
        beforeEach(function(){
            Actions = new ActivityStreams.Actions();
        });
        describe('registerActionHandler', function(){
            it('registers action handlers', function(){
                expect(_.isFunction(Actions.registerActionHandler)).toBeTruthy();
                var handler = new ActivityStreams.ActionHandler('test');
                expect(Actions.registerActionHandler(handler)).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.HttpActionHandler())).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.IntentActionHandler())).toBeUndefined();
                expect(Actions.registerActionHandler(new ActivityStreams.EmbedActionHandler())).toBeUndefined();
            });
            it('requires an ActionHandler object', function(){
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
        describe('getActionsWithHandlers', function(){
            var actionObj;
            beforeEach(function(){
                actionObj = {
                    actions: {
                        shortHttpAction: "http://fakeurl.com",
                        fullHttpAction: {
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
                expect(Actions.getActionsWithHandlers(actionObj)).toEqual(['shortHttpAction', 'fullHttpAction', 'embedAction', 'multiHandlerAction',])
            });
        });
        describe('triggerAction', function(){
            var actionObj, httpHandler, embedHandler;
            beforeEach(function(){
                actionObj = {
                    actions: {
                        httpAction: "http://fakeurl.com",
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
                httpHandler = new ActivityStreams.HttpActionHandler();
                httpHandler.run = function(action, aObject){
                    expect(action).toEqual('httpAction');
                    expect(aObject).toEqual(actionObj);
                };
                spyOn(httpHandler, "run").andCallThrough();
                embedHandler = new ActivityStreams.EmbedActionHandler();
                embedHandler.run = function(action, aObject){
                    expect(action).toEqual('multiHandlerAction');
                    expect(aObject).toEqual(actionObj);
                };
                spyOn(embedHandler, "run").andCallThrough();
            });
            it('should return undefined if no handler registered for this action', function(){
                expect(Actions.triggerAction('httpAction', actionObj)).toBeUndefined();
                expect(Actions.triggerAction('neverAction', actionObj)).toBeUndefined();
            });
            it('should trigger the Action Handler registered for this action', function(){
                Actions.registerActionHandler(httpHandler);
                var result = Actions.triggerAction('httpAction', actionObj);
                expect(result).toEqual({
                    type: 'HttpActionHandler',
                    result: undefined
                });
                expect(httpHandler.run).toHaveBeenCalled();
            });
            it('should trigger the first registered Action Handler for this action', function(){
                Actions.registerActionHandler(embedHandler);
                var result = Actions.triggerAction('multiHandlerAction', actionObj);
                expect(result).toEqual({
                    type: 'EmbedActionHandler',
                    result: undefined
                });
                expect(embedHandler.run).toHaveBeenCalled();
                httpHandler = new ActivityStreams.HttpActionHandler();
                spyOn(httpHandler, "run");
                Actions.registerActionHandler(httpHandler);
                Actions.triggerAction('multiHandlerAction', actionObj);
                expect(httpHandler.run).toHaveBeenCalled();
            });
        });
    });

});