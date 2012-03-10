/*
 ojks - a tiny asynchronous-friendly JS unit test utility

 Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 Avaialbe on GitHub: https://github.com/gkindel/okjs

 Author: Greg Kindel
 Created as "Unit.js" Spring 2011
 */


(function () {
    var okjs = function ( options ) {

        /** options:
         * exeptions : default false;  Prevents the catching of exceptions, useful for debugging.
         * verbose:  default false; Print information for all asserts, not just errors.
         * wait_ms:  default 5000; how long to wait for outstanding events before declaring failure
         * scope :
         */

        // allow use without "new" operator
        if( !(this instanceof okjs) )
            return  new okjs( options );

        this.options = {
            verbose : false,
            exceptions: false,
            wait_ms : 5000
        };
        for(var o in this.options ){
            if( options[o] != null)
                this.options[o] = options[o];
        }
        this._tests = [];
        this._events = 0;
        this.logFn = this._pageLog;

    };

    okjs.prototype = {

        equal : function( got, expected, message ) {
            var error;
            if( ! this.compare(got, expected) )
                error = "equal: got " + got +", expected " + expected;
            this.report(error, message);
        },

        nequal  : function( got, expected, message ) {
            var error;
            if( this.compare(got, expected) )
                error = "nequal: unexpected " + got;
            this.report(error, message);
        },

        assert  : function( got, message ) {
            var error;
            if( ! this.compare(Boolean(got), true) )
                error = "assert: unexpected " + got;
            this.report(error, message);
        },

        skip  : function( got, expected, message ) {
            this.report(null, message, "skip" );
        },

        test : function (message, callback, options) {
            var test = {
                name : message,
                callback : callback,
                subTest : false
            };

            if( options ) {
                test.testErrors = options.testErrors;
                test.delay = options.postDelay;
            }

            if( this._current ) {
                test.subTest = true;
                this._appendedTests.push(test);
            }
            else {
                this._tests.push(test);
            }
        },

        exception : function (msg, fn) {
            var error = "exception expected";
            try {
                fn();
            }
            catch (e){
                error = '';
            }
            this.report(error, msg);
        },

        callback : function (message, callback, scope, options) {
            var wait_ms = ( options &&  options.wait_ms != null )
                ? options.wait_ms
                : this.options.wait_ms;

            var unit = this;
            var ignore = false;
            unit._events++;

            var interval = setTimeout( function (){
                unit.report("Timeout " + wait_ms + "ms", message);
                ignore = true;
                unit._events--;
                unit._resume();
            }, wait_ms);

            return function () {
                if( ignore ) {
//                console.log("Past due callback ignored: " + message);
                    return;
                }
                clearInterval(interval);

                if( unit.options.exceptions ) {
                    callback && callback.apply(scope, arguments);
                    unit.report('', message);
                }
                else {
                    try {
                        callback && callback.apply(scope, arguments);
                        unit.report('', message);
                    }
                    catch(e){
                        unit.report("Exception: " + e.toString(), message);
                    }
                }
                unit._events--;
                ignore = true;
                unit._resume();
            };
        },

        event : function  (type, object, message, callback, wait_ms) {
            if( wait_ms == null)
                wait_ms = this.options.wait_ms;

            if( ! message )
                message = "event : " + type;

            if( !(object.addEventListener instanceof Function) ){
                this.report("not an event listener", message);
                return object;
            }

            var unit = this;
            this._events++;

            var fn = function (e){
                clearInterval(interval);
                object.removeEventListener(type, fn);
                fn = null;

                if( e.type != type ) {
                    unit.report("Wrong event type: " + e.type, message);
                    return;
                }


                if( unit.options.exceptions ) {
                    callback && callback.apply(unit, arguments);
                    unit.report('', message);
                }
                else {
                    try {
                        callback && callback.call(object, e);
                        unit.report('', message);
                    }
                    catch(e){
                        unit.report("Exception: " + e.toString(), message);
                    }
                }
                unit._events--;
                unit._resume()
            };

            var interval = setTimeout( function (){
                unit.report("Timeout " + wait_ms + "ms", message);
                object.removeEventListener(type, fn);
                fn = null;
                unit._events--;
                unit._resume();
            }, wait_ms);

            object.addEventListener(type, fn);

            return object;
        },

        compare : function ( got, expected) {
            if( expected instanceof Function ){
                expected = expected.call(null, got);
            }

            if( expected instanceof Array ){
                if( expected.length != got.length)
                    return false;

                for(var i =0; i<expected.length;i++){
                    if( got[i] !== expected[i] )
                        return false;
                }
                return true;
            }
            else if( expected instanceof Object ) {
                if( expected.equals instanceof Function ){
                    return expected.equals(got);
                }
                else {
                    return(expected === got);
                }
            }
            else {
                return(expected === got);
            }
        },

        report : function (error, message, type) {

            // for internal testing, flip assumptions
            if( this._testErrors ){
                if( error ) {
                    type = "success"
                    error = null;
                }
                else {
                    type = "error";
                    error = "Expected error."
                }
            }

            if(error) {
                this._errors++;
                type = 'error'
            }
            if( ! type ) {
                type = "success"
            }

            var logType = 'OK';
            if( error ){
                logType = "ERROR";
            }
            else if( type == "info" ){
                logType = "INFO";
            }
            else if( type == "skip" ){
                logType = "SKIP";
            }

            msg =   "#" + (++this._count)
                + " :: "
                + this._timestamp()
                + " :: "
                +  logType + " "
                +  ( '"'+ message + '"' || '')
                + (error ?  "\n\t" + error : '');


            if(this.options.verbose || error ){
                this.logFn(msg, type);
            }
        },

        log : function (msg) {
            this.report(null, msg, "info" );
        },

        start : function () {
            this._time = (new Date()).getTime();
            this._count = 0;
            this._skipped = 0;
            this._errors = 0;
            this._events = 0;
            this._current = 0;
            this._appendedTests = [];
            this._delayed = false;

            this._run();
        },

        _run : function () {
            var test;
            while( this._current < this._tests.length ) {
                test = this._tests[this._current++];

                if( test.disabled ){
                    this.options.verbose && this.logFn("---- SKIP TEST: " + test.name + " ---- ", 'info');
                    this._skipped++;
                    continue;
                }

                // expect every test to fail: useful in testing this framework
                this._testErrors =  test.testErrors;

                if( ! test.subTest )
                    this.logFn(test.name, 'test');

                else if ( this.options.verbose )
                    this.logFn(test.name, 'subtest');


                // trapping exceptions allows them to be caught as errors but can be turned off for dev
                if(this.options.exceptions ) {
                    this._events++;
                    test.callback.call(test);
                    this._events--;
                }
                else {
                    try {
                        this._events++;
                        test.callback.call(test);
                    }
                    catch(e) {
                        this.report("Exception: " + e.toString(), test.name);
                    }
                    this._events--;
                }

                // if top-level test adds more tests when run, they are queued right after
                if( this._appendedTests ){
                    this._tests = [].concat(
                        this._tests.slice(0, this._current),
                        this._appendedTests,
                        this._tests.slice(this._current) );
                    this._appendedTests = [];
                }

                // allow a test() to specify a pause after it runs
                if( test.delay ){
                    this._delayed = true;
                    var self = this;
                    setTimeout( function () {
                        self._delayed = null;
                        self._resume()
                    }, test.delay );
                    return;
                }

                // outstanding events will block the progression to the next test
                if( this._events > 0 ){
                    return;
                }
            }
            this._summary();
        },

        _resume : function () {
            if( this._delayed ){
                return;
            }
            if( this._events != 0 ) {
                return;
            }
            this._run();
        },

        _timestamp : function () {
            var elapsed = ( (new Date().getTime()) - this._time ) / 1000;
            return elapsed + "s";
        },

        _summary : function () {
            this.logFn(this._count + " test completed. "
                +  (this._skipped ? this._skipped + " groups skipped. " : '')
                + this._errors + " errors. "
                + this._timestamp(), this._errors ? 'summary error' : 'summary success' ) ;
        },

        _pageLog : function (msg, type) {
            var output = document.getElementById('output');
            if( ! output ) {
                output = document.createElement('div');
                output.setAttribute('id', 'output');
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(output);
            }
            var msgContainer = document.createElement('div');
            msgContainer.setAttribute('class', type + " item");
            var msgEl = document.createTextNode(msg);

            msgContainer.appendChild(msgEl);
            output.appendChild(msgContainer);

            var large = Math.pow(2, 30);
            try {
                window.scrollY = window.pageYOffset =  large;
            }
            catch(e) {};
            window.scroll && window.scroll(0, large); // crx
        }
    };

    window.okjs = okjs;
})();