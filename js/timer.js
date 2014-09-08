/*
 * 记录方法执行时间
 *
 * 说明：这里需要多实例共存，因此采用类的方式进行编写
 */
(function(win) {
    // 装饰者命名空间
    win.decorator = {};

    // 计时器
    (function() {
        /**
         * 这里传入的参数的选择
         *  1> 实例对象，如new People();
         *  2> 普通对象，如{methodName: function() {}}
         * @param component
         * @constructor
         */
        var Timer = function(component) {
            var that = this;

            this.timers = {};
            this.component = component;

            for(var key in this.component) {

                // ensure the property is a function.
                if (typeof this.component[key] !== 'function') {
                    continue;
                }

                // add the method.
                (function(methodName) {
                    that[methodName] = function() {
                        var returnValue,
                        	args = [].slice.call(arguments, 0),
                        	temp,
                        	key;

                        that[methodName].isAsync = false;
                        for (var i = 0, len = args.length; i < len; i++) {
                        	temp = args[i];
                        	if (typeof temp === 'object') {
                        		for (key in temp) {
                        			if (typeof temp[key] === 'function') {
                        				if (/asyncEnd\(/g.test(temp[key]) === true) {
			                        		that[methodName].isAsync = true;
			                        		break;
		                        		}
                        			}
                        		}
                        	} else if (typeof temp === 'function') {
                        		if (/asyncEnd\(/g.test(temp) === true) {
	                        		that[methodName].isAsync = true;
                        		}
                        	}
                        }

                        // 计时开始
                        that.startTimer(methodName);

                        returnValue = that.component[methodName].apply(that.component, arguments);

                        // 同步
                        if (!that[methodName].isAsync) {
                        	that.displayTime(methodName, that.getExecuteTime(methodName));
                        } else {

                        }

                        return returnValue;
                    };
                })(key);
            }
        };

        Timer.prototype = {

            /**
             * 开始计时
             * @param methodName
             */
            startTimer: function(methodName) {
                this.timers[methodName] = (new Date()).getTime();
            },

            /**
             * 获得方法的执行时间
             * @param methodName
             * @returns {number}
             */
            getExecuteTime: function(methodName) {
                return (new Date()).getTime() - this.timers[methodName];
            },

            /**
             * 打印时间log
             * @param methodName
             * @param time
             */
            displayTime: function(methodName, time) {
                if ($.browser.msie && parseInt($.browser.version, 10) <= 8) {
                    win.console.log('[decorator.Timer] ' + methodName + ': ' + time + ' ms');
                } else {
                    win.console.log('%c[decorator.Timer] ' + methodName + ': ' + time + ' ms', 'color: #029FE6');
                }
            },

            /**
             * 异步方法计时
 			 * @param methodName
             */
            asyncEnd: function(methodName) {
            	if (this[methodName] === undefined) {
            		throw new Error('[decorator.Timer][asyncEnd] The methodName of async is wrong.');
            	}

            	if (this[methodName].isAsync === true) {
            		this.displayTime(methodName, this.getExecuteTime(methodName));
            	} else {
            		throw new Error('[decorator.Timer][asyncEnd] If you use asyncEnd of Timer, the arguments of method should has a callback.');
            	}
            }
        };

        win.decorator.Timer = Timer;
    })();

    // TODO 扩展其他应用的装饰者 - 将辅助的一些功能加在这儿
})(window);