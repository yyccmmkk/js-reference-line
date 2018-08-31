# js-reference-line
js 拖动时生成各组件之间对齐线，
###兼容性
没有进行兼容性测试，因为自己的项目只关注最新chrome, 源代码中使用了canvas ES6 语法，如有需要兼容请自行处理。
###使用
如果不使用模块化工具可以如下引用
<script src="extern/lodash.js"></script>
<script src="src/reference-line.js"></script>
<script>
    new ReferenceLine().init();
</script>

如果用模块化工具请引入reference-line.umd.js

###参数配置
            按照自己的需要进行参数配置，使用默认配置可不传，
                 <script>
                    new ReferenceLine({
                        box: document,//兼听鼠标移动的元素
                        item: '[data-query="item"]',//需要定位的成员选择器        
                        zIndex: 0,//参考线层级
                        drag: true,//是否开启拖放,
                        vLine: true,//是否开启垂直参考线
                        hLine: true,//是否开启水平参考线
                        lineColor: '#07f7f9',//参考线颜色
                        offset: 20,//参考线头尾的延伸距离
                        lineWidth: 1,//参考线宽度
                        center: true,//是否开启中心对齐
                        hypotenuse: true//是否开启对角线对齐 暂时没开发，待评估必要性
                    }).init();
                </script>
