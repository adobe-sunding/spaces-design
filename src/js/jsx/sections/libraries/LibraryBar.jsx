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
        FluxMixin = Fluxxor.FluxMixin(React);

    var Gutter = require("jsx!js/jsx/shared/Gutter"),
        SplitButton = require("jsx!js/jsx/shared/SplitButton"),
        SplitButtonItem = SplitButton.SplitButtonItem,
        strings = require("i18n!nls/strings");

    var LibraryBar = React.createClass({
        mixins: [FluxMixin],

        /**
         * Uploads the selected layer(s) as a graphic asset to CC Libraries
         * @private
         */
        addImageAsset: function () {
            this.getFlux().actions.libraries.createElementFromSelectedLayer();
        },

        /**
         * Uploads the selected layer's text style to the libraries
         * @private
         */
        addCharacterStyle: function () {
            this.getFlux().actions.libraries.createCharacterStyleFromSelectedLayer();
        },
        
        /**
         * Uploads the selected layer's effects as a layer style to the libraries
         * @private
         */
        addLayerStyle: function () {
            this.getFlux().actions.libraries.createLayerStyleFromSelectedLayer();
        },

        /**
         * Uploads a color asset to the library
         * @todo Make this accept a color variable instead and correctly provide
         *       from various sources
         * @private
         */
        addColorAsset: function () {
            // FIXME: We're going to need context sensitive boxes for (stroke, fill and overlay color)
            // For demonstration purposes, this action uses a hard coded color
            // FIXME: We may also need to extend to other color spaces/representations here, check other uses of colors
            this.getFlux().actions.libraries.createColorAsset({ r: 0, g: 255, b: 128 });
        },

        render: function () {
            return (
                <div className="formline">
                    <ul className="button-radio">
                        <SplitButtonItem
                            title={strings.TOOLTIPS.FLIP_HORIZONTAL}
                            iconId="libraries-addGraphic"
                            onClick={this.addImageAsset}
                            replaceWith="Next five are likely to be a new control"
                             />
                        <SplitButtonItem
                            title={strings.TOOLTIPS.FLIP_VERTICAL}
                            onClick={this.addCharacterStyle}
                            iconId="libraries-addCharStyle"
                            />
                        <SplitButtonItem
                            title={strings.TOOLTIPS.SWAP_POSITION}
                            iconId="libraries-addLayerStyle"
                            onClick={this.addLayerStyle}
                            />
                        <SplitButtonItem
                            title={strings.TOOLTIPS.SWAP_POSITION}
                            iconId="swap"
                            FIXME="Will have multiple with different sources, refer to Color.jsx for rendering"
                            onClick={this.addColorAsset}
                            />
                        <Gutter />
                        <Gutter />
                        <Gutter />
                        <SplitButtonItem
                            title={strings.TOOLTIPS.SWAP_POSITION}
                            iconId="swap"
                            FIXME="Adobe Stock Image link"
                            />
                        <SplitButtonItem
                            title={strings.TOOLTIPS.SWAP_POSITION}
                            iconId="libraries-CC"
                            FIXME="syncIcon, also make sure these last two are right aligned"
                            />
                    </ul>
                    <Gutter />
                </div>
            );
        }
    });

    module.exports = LibraryBar;
});