var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
js - reference - line;
js;
拖动时生成各组件之间对齐线;
同时按住ctrl + 方向键可以进行1px;
移动;
按下shift + 方向键;
可以进行10px;
移动;
支持四条边及中心线对齐;
提供画布生成勾子支持自定义画布;
提供移动回调;
兼容性;
没有进行兼容性测试;
因为自己的项目只关注最新chrome, 源代码中使用了canvas;
ES6;
语法;
如有需要兼容请自行处理;
使用;
如果不使用模块化工具可以如下引用(__makeTemplateObject(["<script src=\"extern/lodash.js\"></script>"], ["<script src=\"extern/lodash.js\"></script>"]))(__makeTemplateObject(["<script src=\"src/reference-line.js\"></script>"], ["<script src=\"src/reference-line.js\"></script>"]))(__makeTemplateObject(["<script>new ReferenceLine().init();</script>"], ["<script>new ReferenceLine().init();</script>"]));
如果用模块化工具请引入reference - line.umd.js;
新增typescript;
版本;
该版本结合rxjs;
参数配置;
按照自己的需要进行参数配置;
使用默认配置可不传;
new ReferenceLine({
    container: doc,
    range: doc,
    item: '[data-query="item"]',
    cache: {},
    zIndex: 0,
    drag: true,
    vLine: true,
    hLine: true,
    lineColor: '#07f7f9',
    offset: 20,
    lineWidth: 1,
    center: true,
    hypotenuse: true,
    directionKey: true,
    createCanvas: function (ele) {
        //画布生成勾子，可以自定画布元素
        doc.querySelector('body').appendChild(ele);
    },
    move: function (evt, ele, l, t) {
        //元素拖动时勾子，提供事年对象，当前移动的元素，及，移动的距离，left top
    },
}).init();
