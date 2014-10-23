/** @jsx React.DOM */
/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


define(function (require, exports, module) {
    "use strict";

    var React = require("react"),
        Fluxxor = require("fluxxor"),
        FluxChildMixin = Fluxxor.FluxChildMixin(React),
        StoreWatchMixin = Fluxxor.StoreWatchMixin,
        _ = require("lodash");
        
    var Gutter = require("jsx!js/jsx/shared/Gutter"),
        Label = require("jsx!js/jsx/shared/Label"),
        NumberInput = require("jsx!js/jsx/shared/NumberInput"),
        ToggleButton = require("jsx!js/jsx/shared/ToggleButton"),
        strings = require("i18n!nls/strings");

    var Position = React.createClass({
        mixins: [FluxChildMixin, StoreWatchMixin("bounds", "layer", "document", "application")],
        
        getInitialState: function () {
            return {};
        },
        
        getStateFromFlux: function () {
            var flux = this.getFlux(),
                layers = flux.store("layer").getActiveSelectedLayers(),
                documentID = flux.store("application").getCurrentDocumentID(),
                documentBounds = flux.store("bounds").getDocumentBounds(documentID),
                boundsShown = _.pluck(layers, "bounds"),
                isDocument = false;

            if (boundsShown.length === 0 && documentBounds) {
                isDocument = true;
                boundsShown = [documentBounds];
            }
                
            var tops = _.pluck(boundsShown, "top"),
                lefts = _.pluck(boundsShown, "left"),
                top,
                left;

            if (tops.length > 0) {
                if (_.every(tops, function (w) { return w === tops[0]; })) {
                    top = tops[0].toString();
                } else {
                    top = "mixed";
                }
            } else {
                top = "";
            }
            
            if (lefts.length > 0) {
                if (_.every(lefts, function (h) { return h === lefts[0]; })) {
                    left = lefts[0].toString();
                }
                else {
                    left = "mixed";
                }
            } else {
                left = "";
            }
                            
            return {
                top: top,
                left: left,
                isDocument: isDocument
            };

        },

        /**
         * Called when left position value is changed
         * @private
         */
        _handleLeftChange: function (event) { 
            var inLeft = event.target.value,
                newX = inLeft === "" ? this.state.left : inLeft;
                
            if (this.state.left === newX) {
                return;
            }

            var flux = this.getFlux(),
                layers = flux.store("layer").getActiveSelectedLayers(),
                layerIDs = _.pluck(layers, "id"),
                documentID = flux.store("application").getCurrentDocumentID();

            flux.actions.transform.setPosition(documentID, layerIDs, {x: newX});
        },

        /**
         * Called when top position value is changed
         * @private
         */
        _handleTopChange: function (event) { 
            var inTop = event.target.value,
                newY = inTop === "" ? this.state.top : inTop;
                
            if (this.state.top === newY) {
                return;
            }

            var flux = this.getFlux(),
                layers = flux.store("layer").getActiveSelectedLayers(),
                layerIDs = _.pluck(layers, "id"),
                documentID = flux.store("application").getCurrentDocumentID();

            flux.actions.transform.setPosition(documentID, layerIDs, {y: newY});
        },

        render: function () {
            return !this.state.isDocument && (
                <li className="formline">
                    <Label
                        title={strings.TRANSFORM.X}
                        size="c-2-25"
                    />
                    <Gutter />
                    <NumberInput
                        value={this.state.left}
                        valueType="simple"
                        onValueAccept={this._handleLeftChange}
                        onBlur={this._handleLeftChange}
                        ref="left"
                    />
                    <Gutter />
                    <ToggleButton
                        size="c-2-25"
                        buttonType="toggle-delta"
                    />
                    <Gutter />
                    <Label
                        title={strings.TRANSFORM.Y}
                        size="c-2-25"
                    />
                    <Gutter />
                    <NumberInput
                        value={this.state.top}
                        valueType="simple"
                        onValueAccept={this._handleTopChange}
                        onBlur={this._handleTopChange}
                        ref="top"                        
                    />
                </li>
            );
        }
    });

    module.exports = Position;
});
