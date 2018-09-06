# js-reference-line
js 拖动时生成各组件之间对齐线，同时按住ctrl+ 方向键可以进行1px 移动，同进按下ctrl+shift +方向键，可以进行10px 移动。支持四条边及中心线对齐。提供画布生成勾子支持自定义画布，
提供移动回调。
### 兼容性
没有进行兼容性测试，因为自己的项目只关注最新chrome, 源代码中使用了canvas ES6 语法，如有需要兼容请自行处理。
### 使用
如果不使用模块化工具可以如下引用

`<script src="extern/lodash.js"></script>`


`<script src="src/reference-line.js"></script>`

`<script>new ReferenceLine().init();</script>`



如果用模块化工具请引入reference-line.umd.js

### 参数配置
 按照自己的需要进行参数配置，使用默认配置可不传
 
              new ReferenceLine({
                      container: doc,//监听鼠标移动的元素
                      range: doc,
                      item: '[data-query="item"]',//需要定位的成员选择器
                      cache: {},
                      zIndex: 0,//参考线层级
                      drag: true,//是否开启拖放,
                      vLine: true,//是否开启垂直参考线
                      hLine: true,//是否开启水平参考线
                      lineColor: '#07f7f9',//参考线颜色
                      offset: 20,//参考线头尾的延伸距离
                      lineWidth: 1,//参考线宽度
                      center: true,//是否开启中心对齐
                      hypotenuse: true,//是否开启对角线对齐 //暂没开发
                      directionKey: true,//是否开启方向键控制
                      createCanvas: function (ele) {
                      //画布生成勾子，可以自定画布元素
                          doc.querySelector('body').appendChild(ele);
                      },
                      move: function (evt,ele,l,t) {
                      //元素拖动时勾子，提供事年对象，当前移动的元素，及，移动的距离，left top
                      },
                }).init()


                     

