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

/* global QUnit */

define(function (require) {
    "use strict";

    var Promise = require("bluebird");

    var specs = require("test/specs"),
        pgSpecs = require("adapter-test/specs");

    if (window.__PG_DEBUG__ === true) {
        Promise.longStackTraces();
        Promise.onPossiblyUnhandledRejection(function (err) {
            throw err;
        });
    }

    var _parseQueryString = function () {
        var queryString = window.location.search.substr(1), // trims off initial "?"
            parts = queryString.split("&"),
            result = {};

        parts.forEach(function (part) {
            var a = part.split("=");
            if (a.length === 2) {
                result[a[0]] = a[1];
            }
        });

        return result;
    };

    var _loadTestsAndStart = function () {
        var parsedQueryString = _parseQueryString(),
            section = parsedQueryString.section;

        // From Spaces, run all tests including integration tests; from a
        // browser, run only the unit tests.
        if (section === undefined) {
            if (window.hasOwnProperty("_spaces")) {
                section = "all";
            } else {
                section = "unit";
            }
        }

        var wwwSpecsToTest = specs.getSpecsByClass(section),
            pgSpecsToTest = pgSpecs.getSpecsByClass(section).map(function (spec) {
                return "adapter-test/" + spec;
            }),
            specsToTest = wwwSpecsToTest.concat(pgSpecsToTest);

        require(specsToTest, function () {
            // Start QUnit after all test specs are loaded

            QUnit.config.reorder = false;
            QUnit.start();
        });
    };

    _loadTestsAndStart();
});
