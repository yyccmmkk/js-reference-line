/**
 * Created by zhoulongfei on 2018/8/30.
 * E-mail:36995800@163.com
 */
;(function(doc,win,undefined){
    class ReferenceLine {
        constructor(opt) {
            this.defaults = {
                box: doc,//兼听鼠标移动的元素
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
                hypotenuse: true//是否开启对角线对齐

            };
            this.options = Object.assign({}, this.defaults, opt);
        }

        init() {
            this.bindEvent();
            this.initStyle();
        }

        bindEvent() {
            let options = this.options;
            let box = options.box.nodeType ? doc : doc.querySelector(options.box);
            let move = _.debounce((evt) => {
                this.move(evt);
            }, 10);
            box.addEventListener('mousedown', (evt) => {
                evt.target.skip = true;
                this.getPosition();
                this.target = evt.target;
                this.sl = parseInt(evt.target.style.left);
                this.st = parseInt(evt.target.style.top);
                if (evt.target.isRFItem) {
                    this.x = evt.clientX;
                    this.y = evt.clientY;
                    box.addEventListener('mousemove', move, false)
                }
            }, false);
            box.addEventListener('mouseup', (evt) => {
                box.removeEventListener('mousemove', move, false);
                this.target.skip = null;
                this.clearRect();
            }, false)
        }

        getPosition() {
            this.position = [];
            this.mapX = {};
            this.mapY = {};
            this.mapH = {};//hypotenuse map
            let items = doc.querySelectorAll(this.options.item);
            for (let v of items) {
                v.isRFItem = true;
                if (v.skip) continue;
                let position = this.position;
                let bcr = v.getBoundingClientRect();
                let xCenter;
                let yCenter;
                let wh = _.divide(bcr.width, bcr.height);

                position.push(bcr);
                this.mapX[bcr.left] ? this.mapX[bcr.left].push(position.length - 1) : (this.mapX[bcr.left] = [position.length - 1]);
                this.mapX[bcr.right] ? this.mapX[bcr.right].push(position.length - 1) : (this.mapX[bcr.right] = [position.length - 1]);

                if (this.options.center) {
                    xCenter = _.divide(_.add(bcr.right, bcr.left), 2);
                    yCenter = _.divide(_.add(bcr.top, bcr.bottom), 2);
                    this.mapX[xCenter] ? this.mapX[xCenter].push(position.length - 1) : (this.mapX[xCenter] = [position.length - 1]);
                    this.mapY[yCenter] ? this.mapY[yCenter].push(position.length - 1) : (this.mapY[yCenter] = [position.length - 1]);
                }

                if (this.options.hypotenuse) {
                    this.mapH[wh] ? this.mapH[wh].push(position.length - 1) : (this.mapH[wh] = [position.length - 1]);
                }

                this.mapY[bcr.top] ? this.mapY[bcr.top].push(position.length - 1) : (this.mapY[bcr.top] = [position.length - 1]);
                this.mapY[bcr.bottom] ? this.mapY[bcr.bottom].push(position.length - 1) : (this.mapY[bcr.bottom] = [position.length - 1]);

            }
            //console.log(this.mapX, this.mapY, this.position);
        }

        getLine(x, y, isCenter) {
            let options = this.options;
            let v = this.mapX[x[0]] || [];
            let h = this.mapY[y[0]] || [];

            let tempV = [...y];
            let tempH = [...x];
            let vLine = {x: x[0]};
            let hLine = {y: y[0]};
            let limit = isCenter ? 3 : 2;

            for (let i of v) {
                tempV.push(this.position[i].top);
                tempV.push(this.position[i].bottom);
            }
            for (let i of h) {
                tempH.push(this.position[i].left);
                tempH.push(this.position[i].right);
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
            /* if(v.length>0||h.length>0){
                 console.log(v,h);
             }*/

            return {vLine: tempV.length > limit ? vLine : null, hLine: tempH.length > limit ? hLine : null}
        }

        move(evt) {
            //console.log(evt.clientX, evt.clientY);
            if (this.options.drag) {
                this.target.style.left = this.sl + (evt.clientX - this.x) + "px";
                this.target.style.top = this.st + (evt.clientY - this.y) + "px";
            }
            let p = this.target.getBoundingClientRect();
            this.clearRect();
            this.drawLine([p.left, p.right], [p.top, p.bottom]);
            this.drawLine([p.right, p.left], [p.bottom, p.top]);
            this.drawLine([_.divide(_.add(p.right, p.left), 2), p.left, p.right], [_.divide(_.add(p.bottom, p.top), 2), p.top, p.bottom], true);

        }

        initStyle() {
            let ele = this.ele = doc.createElement('canvas');
            let options = this.options;
            ele.width = doc.documentElement.clientWidth;
            ele.height = doc.documentElement.clientHeight;
            ele.style.position = "fixed";
            ele.style.left = 0;
            ele.style.top = 0;
            //ele.style.backgroundColor = "#000";
            //ele.style.opacity=0.5;
            ele.style.zIndex = 0;
            doc.querySelector('body').appendChild(ele);
            this.ctx = ele.getContext("2d");
            this.ctx.lineWidth = options.lineWidth;
            this.ctx.strokeStyle = options.lineColor;
            this.ctx.setLineDash([1, 1]);
        }

        drawVLine(x, ys, ye) {
            x = Math.floor(x);
            ys = Math.floor(ys);
            ye = Math.floor(ye);
            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, ys + 0.5);
            this.ctx.lineTo(x + 0.5, ye + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        drawHLine(y, xs, xe) {
            y = Math.floor(y);
            xs = Math.floor(xs);
            xe = Math.floor(xe);
            this.ctx.beginPath();
            this.ctx.moveTo(xs + 0.5, y + 0.5);
            this.ctx.lineTo(xe + 0.5, y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();

        }

        drawLine(x, y, isCenter) {
            let temp = this.getLine(x, y, isCenter);
            let options = this.options;
            options.hLine && temp.hLine && this.drawHLine(temp.hLine.y, temp.hLine.start, temp.hLine.end);
            options.vLine && temp.vLine && this.drawVLine(temp.vLine.x, temp.vLine.start, temp.vLine.end);

        }

        clearRect() {
            this.ctx.clearRect(0, 0, this.ele.width, this.ele.height);
        }

    }
    win.ReferenceLine=ReferenceLine;
})(document,window);



