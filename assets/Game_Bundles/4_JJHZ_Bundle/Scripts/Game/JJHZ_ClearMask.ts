import { _decorator, color, Component, Graphics, Intersection2D, Mask, Node, Rect, rect, Sprite, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_ClearMask')
export default class JJHZ_ClearMask extends Mask {

    ticketNode: UITransform;

    LineWidth: number = 50;
    polygonPointsList: { rect: Rect; isHit: boolean }[] = [];
    ClearPoints: number = 0;
    ClearRate: number = 0;

    JinDuTiao: Sprite = null;
    start() {
    }

    Reset() {
        this.polygonPointsList = [];
        this.ClearPoints = 0;
        this.ClearRate = 0;
        this._graphics.clear();
        this.ticketNode = this.node.children[0].getComponent(UITransform);
        this.tempDrawPoints = [];
        // 生成小格子，用来辅助统计涂层的刮开比例
        for (let x = 0; x < this.ticketNode.width; x += this.LineWidth) {
            for (let y = 0; y < this.ticketNode.height; y += this.LineWidth) {
                this.polygonPointsList.push({
                    rect: rect(x - this.ticketNode.width / 2, y - this.ticketNode.height / 2, this.LineWidth, this.LineWidth),
                    isHit: false
                });
            }
        }
    }

    touchStartEvent(pos: Vec3, offsetX: number = 0, offsetY: number = 0) {
        let point = this.ticketNode.convertToNodeSpaceAR(pos);
        this.clearMask(new Vec2(point.x + offsetX, point.y + offsetY));
    }

    touchMoveEvent(pos: Vec3, offsetX: number = 0, offsetY: number = 0) {
        let point = this.ticketNode.convertToNodeSpaceAR(pos);
        this.clearMask(new Vec2(point.x + offsetX, point.y + offsetY));

        this.ClearPoints = 0;
        this.polygonPointsList.forEach((item) => {
            if (item.isHit) {
                this.ClearPoints++;
            }
        });
        this.ClearRate = this.ClearPoints / this.polygonPointsList.length;
        console.log("刮开比例" + (this.ClearRate * 100).toFixed(1) + "%")
        if (this.JinDuTiao)
            this.JinDuTiao.fillRange = this.ClearRate;
    }

    TouchStart(event, offsetX: number = 0, offsetY: number = 0) {
        let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
        this.clearMask(new Vec2(point.x + offsetX, point.y + offsetY));
    }

    TouchMove(event, offsetX: number = 0, offsetY: number = 0) {
        let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
        this.clearMask(new Vec2(point.x + offsetX, point.y + offsetY));

        this.ClearPoints = 0;
        this.polygonPointsList.forEach((item) => {
            if (item.isHit) {
                this.ClearPoints++;
            }
        });
        this.ClearRate = this.ClearPoints / this.polygonPointsList.length;
        console.log("刮开比例" + (this.ClearRate * 100).toFixed(1) + "%")
    }

    tempDrawPoints: Vec2[] = [];
    clearMask(pos: Vec2) {
        let stencil = this._graphics;
        const len = this.tempDrawPoints.length;
        this.tempDrawPoints.push(pos);
        if (len <= 1) {
            // 只有一个点，用圆来清除涂层
            stencil.circle(pos.x, pos.y, this.LineWidth / 2);
            stencil.fill();

            // 记录点所在的格子
            this.polygonPointsList.forEach((item) => {
                if (item.isHit) return;
                const xFlag = pos.x > item.rect.x && pos.x < item.rect.x + item.rect.width;
                const yFlag = pos.y > item.rect.y && pos.y < item.rect.y + item.rect.height;
                if (xFlag && yFlag) item.isHit = true;
            });

        } else {
            // 存在多个点，用线段来清除涂层
            let prevPos = this.tempDrawPoints[len - 2];
            let curPos = this.tempDrawPoints[len - 1];

            stencil.moveTo(prevPos.x, prevPos.y);
            stencil.lineTo(curPos.x, curPos.y);
            stencil.lineWidth = this.LineWidth;
            stencil.lineCap = Graphics.LineCap.ROUND;
            stencil.lineJoin = Graphics.LineJoin.ROUND;
            stencil.strokeColor = color(255, 255, 255, 255);
            stencil.stroke();

            // 记录线段经过的格子
            this.polygonPointsList.forEach((item) => {
                item.isHit = item.isHit || Intersection2D.lineRect(prevPos, curPos, item.rect);
            });
        }
    }
}
