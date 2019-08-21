/**
 * version:1.0.1
 * Created by yyccmmkk on 2018/10/18.
 * E-mail:36995800@163.com
 * 画布拖动对齐参考线
 */
import {fromEvent, Unsubscribable} from 'rxjs';
import {auditTime} from 'rxjs/operators';
import {defaultsDeep, divide, add} from 'lodash';


let doc: Document = document;

interface setting {
    [propName: string]: any;

}

// 默认参数项
const DEFAULTS: setting = {
    container: doc,//监听鼠标移动的元素
    range: doc,
    item: '[data-query="item"]',//需要定位的成员选择器
    moveItem: '[data-select="multi"]',//多选移动
    auto: 0, // 自动吸附功能 距离多少px范围内自行吸附 todo 待开发
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
    delay: 6000,// 生成对齐线后多少ms 消失 默认为6000
    isMultiMove: false, // 是否开启同时多个移个
    createCanvas: function (canvas: HTMLElement) { // 创建canvas 回调，用于自定义canvas
        let _body = doc.querySelector('body');
        _body && _body.appendChild(canvas);
    },
    move: (event: any, ele: HTMLElement, x: number, y: number) => {
        // 当前元素，x 对应style left ，y 对应style top
    },
    end: (ele: HTMLElement, x: number, y: number) => {
        //当前元素，x 对应style left ，y 对应style top
    }
};

interface referenceLine {
    [index: string]: any;
}

interface drawCoordinate {
    vLine: { [x: string]: number };
    hLine: { [y: string]: number };
}

export default class ReferenceLine implements referenceLine {
    regExp: RegExp = /([a-zA-Z]+)?([\.#\[])?([\w-_]+)?(?:=([\w-_"\]]+))?/;
    options: setting;

    [index: string]: any;

    st: any;
    sl: any;
    canvas: any;
    ctx: any;
    x: any;
    y: any;
    target: any;
    mapX: any;
    mapY: any;
    mapH: any;
    position: any[] = [];
    ele: any;

    constructor(opt: setting) {
        this.options = defaultsDeep({}, opt, DEFAULTS)
    }

    /**
     * 初始化
     */
    init() {
        this.initStyle();
        this.bindEvent();
    }

    /**
     * 事件监听
     */
    bindEvent(): void {
        let _this = this;
        let options = this.options;
        let cache = options.cache;
        let box = options.container.nodeType ? doc : doc.querySelector(options.container);
        let subscriptionMove: Unsubscribable;
        // 是否开启方向键
        if (options.directionKey) {

            fromEvent(doc, 'keydown').pipe(
                auditTime(50)
            ).subscribe((evt: any) => {
                if (!_this.target) {
                    return
                }
                if (_this[evt.code] && (evt.ctrlKey || evt.shiftKey)) {
                    cache.isShow = true;
                    _this.canvas.style.display = 'block';
                    _this.sl = parseInt(_this.target.style.left);
                    _this.st = parseInt(_this.target.style.top);
                    _this[evt.code](evt.shiftKey ? 10 : 1);
                    if (cache._h) {
                        clearTimeout(cache._h);
                    }
                    cache._h = setTimeout(() => {
                        console.log('timeout:::')
                        _this.canvas.style.display = 'none';
                        cache.isShow = null;
                    }, options.delay)
                }
            })

        }
        fromEvent(doc, "wheel").subscribe(() => {
            if (cache.isShow) {
                _this.canvas.style.display = 'none';
                clearTimeout(cache._h);
            }
        });
        fromEvent(box, 'mousedown').subscribe((evt: any) => {
            evt.target.nodeName !== "INPUT" && evt.target.nodeName !== "TEXTAREA" && evt.target.nodeName !== "SELECT" && evt.preventDefault();
            let ele: any;

            if (!(ele = _this.isItem(evt))) {
                return
            }
            ele.skip = true;
            _this.canvas.style.display = 'block';
            _this.getPosition();
            _this.target = ele;
            _this.sl = parseInt(ele.style.left);
            _this.st = parseInt(ele.style.top);

            if (_this.options.isMultiMove) {
                _this.multiMoveDo();
            }


            if (ele.isRFItem) {
                _this.x = evt.clientX;
                _this.y = evt.clientY;
                subscriptionMove = fromEvent(box, 'mousemove').pipe(
                    //auditTime(1)
                ).subscribe((evt) => {
                    _this.move(evt, false);
                    cache.isDo = true;
                })
            }
        });


        fromEvent(box, 'mouseup').subscribe(() => {
            if (this.target) {
                this.target.skip = null;
            }
            subscriptionMove && subscriptionMove.unsubscribe();
            cache._h = setTimeout(() => this.clearRect(), options.delay);
            options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);

        });

        fromEvent(box, 'click').subscribe(() => {console.log(333);
            this.target && (this.target.skip = null);
            //subscriptionMove.unsubscribe();
            if (cache.isDo){
                cache.isDo = false;
                return
            }

            this.canvas.style.display = 'none';
            this.clearRect();

        });

    }

    /**
     * 获取件bcr
     */
    getPosition(): void {
        this.position = [];
        this.mapX = {};
        this.mapY = {};
        this.mapH = {};//hypotenuse map
        let items = doc.querySelectorAll(this.options.item);
        for (let v of items as any) {
            v.isRFItem = true;

            if (v.skip) {
                continue;
            }
            let position = this.position;
            let bcr;
            let {left, top, right, bottom, width, height} = bcr = v.getBoundingClientRect();
            let xCenter;
            let yCenter;
            left = Math.round(left);
            right = Math.round(right);
            top = Math.round(top);
            bottom = Math.round(bottom);
            let wh = divide(width, height);

            position.push(bcr);
            let tempXLeft = this.mapX[left];
            tempXLeft ? tempXLeft.push(position.length - 1) : (this.mapX[left] = [position.length - 1]);
            let tempXRight = this.mapX[right];
            tempXRight ? tempXRight.push(position.length - 1) : (this.mapX[right] = [position.length - 1]);

            if (this.options.center) {
                xCenter = Math.floor(divide(add(bcr.right, bcr.left), 2));
                yCenter = Math.floor(divide(add(bcr.top, bcr.bottom), 2));
                let tempXCenterX = this.mapX[xCenter];
                tempXCenterX ? tempXCenterX.push(position.length - 1) : (this.mapX[xCenter] = [position.length - 1]);
                let tempYCenterY = this.mapY[yCenter];
                tempYCenterY ? tempYCenterY.push(position.length - 1) : (this.mapY[yCenter] = [position.length - 1]);
            }

            if (this.options.hypotenuse) {
                this.mapH[wh] ? this.mapH[wh].push(position.length - 1) : (this.mapH[wh] = [position.length - 1]);
            }

            this.mapY[bcr.top] ? this.mapY[bcr.top].push(position.length - 1) : (this.mapY[Math.floor(+bcr.top)] = [position.length - 1]);
            this.mapY[bcr.bottom] ? this.mapY[bcr.bottom].push(position.length - 1) : (this.mapY[Math.floor(+bcr.bottom)] = [position.length - 1]);

        }
        //console.log(this.mapX, this.mapY, this.position);
    }

    /**
     * 获取画线信息
     * @param x 坐标
     * @param y 坐标
     * @param isCenter 是否是中心对齐
     */
    getLine(x: number[], y: number[], isCenter: boolean): drawCoordinate {
        let options: setting = this.options;
        let position: any[] = this.position;
        let v: number[] = this.mapX[Math.floor(x[0])] || [];
        let h: number[] = this.mapY[Math.floor(y[0])] || [];

        let tempV: number[] = [...y];
        let tempH: number[] = [...x];
        let vLine: { [x: string]: number } = {x: x[0]};
        let hLine: { [y: string]: number } = {y: y[0]};
        let limit: number = isCenter ? 3 : 2;

        for (let i of v) {
            const {top, bottom} = position[i];
            tempV.push(top);
            tempV.push(bottom);
        }
        for (let i of h) {
            const {left, right} = position[i];
            tempH.push(left);
            tempH.push(right);
        }
        if (tempV.length) {
            vLine.start = Math.min(...tempV) - options.offset;
            vLine.end = Math.max(...tempV) + options.offset;
        }
        if (tempH.length) {
            hLine.start = Math.min(...tempH) - options.offset;
            hLine.end = Math.max(...tempH) + options.offset;
        }
        //console.log("vLine:", vLine, "hLine:", hLine);
        /*if (v.length > 0 || h.length > 0) {
            console.log('important', v, h);
        }*/

        return <drawCoordinate>{vLine: tempV.length > limit ? vLine : null, hLine: tempH.length > limit ? hLine : null}
    }

    /**
     * 移动回调
     * @param evt event
     * @param isSimulate 是否是trigger
     */
    move(evt: any, isSimulate: boolean): void {
        //console.log(evt.clientX, evt.clientY);
        let l: number = 0, t: number = 0;
        let p = this.target.getBoundingClientRect();
        let options = this.options;
        let cache = options.cache;
        if (options.drag) {
            let range: ClientRect = this.getRange();
            let minLeft: number = 0;
            let maxLeft: number = range.width - (options.isMultiMove ? cache.widthMulti : p.width);
            let minTop: number = 0;
            let maxTop: number = range.height - (options.isMultiMove ? cache.heightMulti : p.height);
            let x: number = evt.clientX;
            let y: number = evt.clientY;
            let distanceX, distanceY;

            l = this.sl + (distanceX = x - this.x);
            t = this.st + (distanceY = y - this.y);
            l < minLeft && (l = minLeft);
            l > maxLeft && (l = maxLeft);
            t < minTop && (t = minTop);
            t > maxTop && (t = maxTop);
            //console.log("minLeft:", minLeft, 'maxLeft:', maxLeft, 'minTop:', minTop, 'maxTop:', maxTop);
            this.target.style.left = (l || 0) + "px";
            this.target.style.top = (t || 0) + "px";

        }
        cache.x = l;
        cache.y = t;
        this.options.move.apply(this, [evt, this.target, l, t]);
        this.clearRect();
        let {left, top, right, bottom} = this.target.getBoundingClientRect();
        this.drawLine([left, right], [top, bottom], false);
        this.drawLine([right, left], [bottom, top], false);
        this.drawLine([divide(add(right, left), 2), left, right], [divide(add(bottom, top), 2), top, bottom], true);

    }

    /**
     * UI初始化
     */
    initStyle(): void {
        let ele: any = this.ele = doc.createElement('canvas');
        let options = this.options;
        this.canvas = ele;
        ele.width = doc.documentElement && doc.documentElement.clientWidth;
        ele.height = doc.documentElement && doc.documentElement.clientHeight;
        ele.style.position = "fixed";
        ele.style.left = 0;
        ele.style.top = 0;
        ele.style.display = 'none';
        //ele.style.backgroundColor = "#000";
        //ele.style.opacity=0.5;
        ele.style.zIndex = options.zIndex;
        this.options.createCanvas.apply(this, [ele]);
        this.ctx = ele.getContext("2d");
        this.ctx.lineWidth = options.lineWidth;
        this.ctx.strokeStyle = options.lineColor;
        this.ctx.setLineDash([1, 1]);
    }

    /**
     * 垂直对齐线画线
     * @param x 坐标
     * @param ys 坐标开始
     * @param ye 坐标结束
     */
    drawVLine(x: number, ys: number, ye: number): void {
        x = Math.floor(x);
        ys = Math.floor(ys);
        ye = Math.floor(ye);
        this.ctx.beginPath();
        this.ctx.moveTo(x + 0.5, ys + 0.5);
        this.ctx.lineTo(x + 0.5, ye + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * 水平对齐线画线
     * @param y
     * @param xs
     * @param xe
     */
    drawHLine(y: number, xs: number, xe: number): void {
        y = Math.floor(y);
        xs = Math.floor(xs);
        xe = Math.floor(xe);
        this.ctx.beginPath();
        this.ctx.moveTo(xs + 0.5, y + 0.5);
        this.ctx.lineTo(xe + 0.5, y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();

    }

    /**
     * 对齐线画线
     * @param x
     * @param y
     * @param isCenter
     */
    drawLine(x: number[], y: number[], isCenter: boolean): void {
        let temp: drawCoordinate = this.getLine(x, y, isCenter);
        let options = this.options;
        options.hLine && temp.hLine && this.drawHLine(temp.hLine.y, temp.hLine.start, temp.hLine.end);
        options.vLine && temp.vLine && this.drawVLine(temp.vLine.x, temp.vLine.start, temp.vLine.end);

    }

    /**
     * 清空画布
     */
    clearRect(): void {
        console.log('clear::::::::')
        this.ctx.clearRect(0, 0, this.ele.width, this.ele.height);
    }

    /**
     * 获取画布范围
     */
    getRange(): ClientRect {
        let options = this.options;
        let ele = options.range.nodeType ? doc.documentElement : doc.querySelector(options.range);
        ele = ele || doc.documentElement;
        return ele.getBoundingClientRect()
    }

    /**
     * 键盘方向键左移
     * @param offset 阀值
     * @constructor
     */
    ArrowLeft(offset: number): void {
        let cache = this.options.cache;
        this.x = 0;
        this.y = 0;
        this.move({
            clientX: -offset,
            clientY: 0
        }, false);
        this.options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);

    }

    /**
     * 右移
     * @param offset 阀值
     * @constructor
     */
    ArrowRight(offset: number): void {
        let cache = this.options.cache;
        this.x = 0;
        this.y = 0;
        this.move({
            clientX: offset,
            clientY: 0
        }, false);
        this.options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);
    }

    /**
     * 下移
     * @param offset
     * @constructor
     */
    ArrowDown(offset: number): void {
        let cache = this.options.cache;
        this.x = 0;
        this.y = 0;
        this.move({
            clientX: 0,
            clientY: offset
        }, false);
        this.options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);
    }

    /**
     * 上移
     * @param offset
     * @constructor
     */
    ArrowUp(offset: number): void {
        let cache = this.options.cache;
        this.x = 0;
        this.y = 0;
        this.move({
            clientX: 0,
            clientY: -offset
        }, false);
        this.options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);
    }

    /**
     * 多选移动
     */
    multiMoveDo() {
        let options = this.options;
        let cache = options.cache;
        let widthMulti;
        let HeightMulti;
        let tempLeftArray = [];
        let tempRightArray = [];
        let tempTopArray = [];
        let tempBottomArray = [];
        let tempMap = new Map();
        cache.multiItems = document.querySelectorAll(options.moveItem);
        if (cache.multiItems.length < 1) {
            return
        }
        ;
        for (let v of cache.multiItems) {
            let bcr = v.getBoundingClientRect();
            tempLeftArray.push(bcr.left);
            tempRightArray.push(bcr.right);
            tempTopArray.push(bcr.top);
            tempBottomArray.push(bcr.bottom);
            tempMap.set(bcr.left, v);
            tempMap.set(bcr.top, v);
        }
        let minX = Math.min(...tempLeftArray);
        let minY = Math.min(...tempTopArray);
        cache.widthMulti = Math.max(...tempRightArray) - minX;
        cache.heightMulti = Math.max(...tempBottomArray) - minY;
        this.sl = parseInt(tempMap.get(minX).style.left);
        this.st = parseInt(tempMap.get(minY).style.top);
        this.options.end.apply(this, [this.target, cache.x || this.sl, cache.y || this.st]);
    }

    /**
     * 过虑 todo 可以使用pipe filter map
     * @param evt
     */
    isItem(evt: any): boolean | Node | Element {

        let match = this.options.item.match(this.regExp);
        let m4 = match[4] && match[4].replace(/["'\]]/g, "");
        if (!match) {
            return false
        }
        if (match[2] === '.') {
            for (let v = evt.target; v; v = v.x) {
                if (v.nodeType !== 1) {
                    continue
                }
                if (v.className === match[3]) {
                    return v;
                }
            }

        }
        if (match[2] === '[') {
            for (let v = evt.target; v; v = v.parentNode) {
                if (v.nodeType !== 1) {
                    continue
                }
                if (m4 ? v.getAttribute(match[3]) === m4 : v.getAttribute(match[3])) {
                    return v;
                }
            }
        }
        return false;
    }


}
export {ReferenceLine}
