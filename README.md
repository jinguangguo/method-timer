method-timer
============

### 方法执行计时器
故名思义，主要对js方法（包括异步方法）进行计时以便调试，发现性能缺陷。

### 应用场景
* 循环或者算法
* 异步调用
* 频繁DOM操作
* 其他有损性能的部分（如测试IE6的渲染等）

### 使用
##### 创建组件计时器
```javascript
var componentTimer = new window.decorator.Timer(component);
```
这里的component可以是某个类的实例，如——
```javascript
var component = new ClassName(params);
```

当然也可以是普通的对象，如——
```javascript
var component = {
	method: function() {//...},
	//...
};
```
##### 调用方法
这里的component是被装饰的对象，可以直接调用它的方法，如——
```javascript
component.doMethod();
```
对于component的装饰者componentTimer，同样具有component一模一样的方法，因此同样可以这样调用——
```javascript
// 这里我们可以得到doMentod这个方法的执行时间
componentTimer.doMethod();	// [decorator.Timer] doMentod: xxx ms
```

因此，我们在开发阶段，可以这样使用——
```javascript
var component = new ClassName(params);
```

// 如果是开发阶段，要对某个组件component进行方法执行时间测试
if (DEBUG === true) {
	var componentTimer = new window.decorator.Timer(component);
	componentTimer.doMethod();	// [decorator.Timer] doMentod: xxx ms
} else {	// 产品阶段
	componentTimer.doMethod();
}

##### 调试异步方法
以上仅仅针对同步方法，如果是对异步方法（即具有后端请求，触发回调，或者setTimeout、setInterval等）。
测试的原理，主要是通过在方法中传递的参数是否具有回调函数来判定。如——
```javascript
component.doAsync('params', function() {
	// this is callback
})

component.doAsync({
	// other params ...
	// success callback
	onSuccessCallback: function() {

	},
	// fail callback
	onFailCallback: function() {

	}
})
```
针对上述举的例子，对它们进行异步测试，如下——
```javascript
componentTimer.doAsync('params', function() {
	// async request end ...

	// 这里的asyncEnd这个方法是组件固定的方法，不可变动
	// 调用asyncEnd方法传递的参数是必须组件方法名称，即doAsync
	componentTimer.asyncEnd('doAsync');

	// doSomething ...
})
```
这里嵌入了与原有组件无关的一句代码，即componentTimer.asyncEnd('methodName');这句就是时间计时的结点。可以把这句方法回调函数的任意一行中，如——

```javascript
componentTimer.doAsync('params', function() {
	// async request end ...

	// doSomething ...

	// 这里是时间计时的结点，也就记住了从请求开始时间，到回调函数中的doSomething的结束时间
	componentTimer.asyncEnd('doAsync');
})
```

### 总结
以上是针对[面向切面编程](http://baike.baidu.com/view/1865230.htm?fr=aladdin)的一种实现。主要是利用[装饰模式](http://baike.baidu.com/view/2787758.htm)实现之。
当然，这里仅仅列举计时器这样一个功能，我们同样可以在不改变原有组件的任何结构的基础上，可以对其进行装饰以完成我们需要的辅助功能。
