# js-reference-line
js 拖动时生成各组件之间对齐线，同时按住ctrl+ 方向键可以进行1px 移动，按下shift +方向键，可以进行10px 移动。支持四条边及中心线对齐。提供画布生成勾子支持自定义画布，
提供移动回调。
支持自动吸附对齐，目前只支持拖动完成后自动吸附（mouseup事件），默认为 正负15px范围
自动吸附对齐的规则为：
    1 当前元素与所有可对齐元素进行吸附无论在不在视窗内，
    2 当前元素吸附与移动方向坐标点最近的元素，也就是说吸附和移动的方向+吸附范围有关，如果元素A在远离元素B 即便在吸附范围也不会自动吸附，
    tips: 如果需要精确控制建议使用方向键进行控制，按下方向键不会触发吸附
    
### 兼容性
没有进行兼容性测试，因为自己的项目只关注最新chrome, 源代码中使用了canvas ES6 语法，如有需要兼容请自行处理。
### 使用
如果不使用模块化工具可以如下引用

`<script src="extern/lodash.js"></script>`


`<script src="src/reference-line.js"></script>`

`<script>new ReferenceLine().init();</script>`


如果用模块化工具请引入reference-line.umd.js

新增typescript 版本，该版本结合rxjs

### 参数配置
 按照自己的需要进行参数配置，使用默认配置可不传
 
              new ReferenceLine({
                      container: doc,//监听鼠标移动的元素
                      range: doc, // 移动元素所在容器 主要用于限制移动范围
                      auditTime:5, // ms moue 移动时抖动 数值截越小越平滑性能开销越高
                      auto: 15, // 自动吸附功能 距离多少px范围内自行吸附
                      item: '[data-query="item"]',//需要定位的成员选择器
                      delay:6000, //参考线 生成后多少秒消失
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
                      //画布生成勾子，可以自定画布元素 提供对canvas 的操作能力
                          doc.querySelector('body').appendChild(ele);
                      },
                      move: function (evt,ele,left,top) {
                      //元素拖动时勾子，提供事件对象，当前移动的元素，及，移动的距离，left top
                      },
                      //移动完成回调 ele: 当前元素 left top 对应当前的元素 style 
                      end:function(ele,left,top){
                      //当前元素，x 对应style left ，y 对应style top 主要用于数据驱动框架数据更新
                      }
                }).init()
### typescript版 demo

    git@github.com:yyccmmkk/webpackSplitChunks.git

### react +redux demo
    
    https://github.com/yyccmmkk/zt-editor/tree/react-zt-editor
    在Main.tsx 中可以看到调用方式

### 更新
    2019.8.22
    ts 版本新增吸附功能，在拖动完成后（mouseup）会自动吸附对齐周围元素，
       新增移动抖动参数 auditTime 默认为5sm 数值越少性能开销越大，移动采样越多

    2019.8.21
    ts 版本优化，建议使用ts 版本，js 版本不再维护
    新增delay 配置项用于设置对齐线多少ms 消失
    鼠标拖动对齐后不再立即消失 而是根据 delay时间
    

    2019.7.19
    临时修复TS高版本报错信息
    2019.5.15        
    添加移动结束勾子，end 在移动结束后会调用此方法，在使用框架时可以在使用结束时对数据进行修改
