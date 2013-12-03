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
            expect(Actions.registerActionHandler).toBeTruthy();
            expect(Actions.registerActionHandler('HttpRequestHandler', function(){return true})).toBeTruthy();
        });
        it('requires a handler ID and a callback function', function(){
            expect(Actions.registerActionHandler(
                {},
                function(){return true}
            )).toBe(false, 'handler id must be string');
            expect(Actions.registerActionHandler(
                'id',
                1
            )).toBe(false, 'callback must be function');
            expect(Actions.registerActionHandler()).toBe(false);
            expect(Actions.registerActionHandler('HttpRequestHandler', function(){return true})).toBe(true);
        });
    });
});