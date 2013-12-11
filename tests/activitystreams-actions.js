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
describe('activitystreams actions', function(){
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
});