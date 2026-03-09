import { _decorator, Camera, Component, director, find, Graphics, input, Node, tween, UITransform, Vec2, Vec3 } from 'cc';

import { YYB_objectController } from './YYB_objectController';
import { YYB_InputSystem } from './YYB_InputSystem';
const { ccclass, property } = _decorator;

@ccclass('YYB_playSystem')
export class YYB_playSystem extends Component {

    @property(Number)
    width: number = 0;
    @property(Number)
    height: number = 0;
    @property(Graphics)
    graph: Graphics = null;




    isTouching: boolean = false;



    objectControllerList: YYB_objectController[] = [];
    objectSelectList: number[] = [];
    answer: number[][] = [[13, 8, 7, 12, 17, 16, 11, 6, 1, 2, 3, 4, 5, 10, 9, 14, 15, 20, 19],
    [22, 16, 17, 11, 10, 9, 15, 14, 20, 21, 27, 26, 25, 19, 13, 7, 1, 2, 3, 4, 5, 6, 12, 18, 24, 23, 29, 30],
    [6, 12, 11, 5, 4, 10, 9, 3, 2, 8, 7, 13, 19, 25, 26, 20, 14, 15, 21, 22, 16, 17, 23, 24, 30, 29, 28],
    [54, 44, 45, 46, 56, 57, 58, 59, 60, 50, 49, 48, 47, 37, 38, 39, 40, 30, 20, 10, 9, 19, 29, 28, 18, 8, 7, 6, 5, 4, 3, 2, 1, 11, 21, 31, 41, 51, 52, 53, 43, 42, 32, 33, 23, 22, 12, 13, 14, 24, 25, 35, 36, 26, 27, 17, 16]];
    suitableidx: number[] = [];
    tot: number = 0;
    sceneIdx: number = 0;
    dx: number[] = [1, -1, 0, 0];
    dy: number[] = [0, 0, 1, -1];



    posToidx(pos: Vec2) {
        return pos.x + pos.y * this.width;
    }

    protected start(): void {

        this.objectControllerList = this.getComponentsInChildren(YYB_objectController);

        this.sceneIdx = 3;
        for (let i = 0; i < this.objectControllerList.length; i++) {
            this.tot += (Number)(this.objectControllerList[i].canCross);
            this.objectControllerList[i].node.setScale(0, 0, 0);
        }
        for (let i = 0; i < this.answer[this.sceneIdx].length; i++) {
            this.answer[this.sceneIdx][i]--;
        }

        let time = 0.05;
        for (let i = 0; i < this.objectControllerList.length; i++) {
            this.scheduleOnce(() => {
                tween(this.objectControllerList[i].node).to(time, { scale: Vec3.ONE }, { easing: "bounceOut" }).call(() => { }).start();
            }, time * i);
        }
    }

    protected update(dt: number): void {
        if (this.isTouching) {
            let curpos = YYB_InputSystem.instance.Pointdirctor;
            let idx = this.inWhichBox(curpos);
            if (this.suitableidx.indexOf(idx) != -1) {
                this.objectSelectList.push(idx);
                this.suitableidx = [];
                let x = idx % this.width, y = Math.floor(idx / this.width);
                for (let i = 0; i < 4; i++) {
                    let u = x + this.dx[i];
                    let v = y + this.dy[i];
                    if (u < 0 || v < 0 || u >= this.width || v >= this.height) continue;
                    let newidx = u + v * this.width;
                    // console.log("FFF" + newidx + "SSS" + this.objectControllerList[newidx].canCross + "BBB" + this.objectSelectList.indexOf(i));
                    if (this.objectControllerList[newidx].canCross && this.objectSelectList.indexOf(newidx) == -1) {
                        // console.log(newidx);
                        this.suitableidx.push(newidx);
                    }
                }
            }
            this.Draw();
        }
    }

    Draw() {
        this.graph.clear();
        // console.log(this.objectSelectList.length);  
        if (this.objectSelectList.length == 0) return;
        // console.log(this.objectControllerList[this.objectSelectList[0]].node.position);
        this.graph.moveTo(this.objectControllerList[this.objectSelectList[0]].node.position.x, this.objectControllerList[this.objectSelectList[0]].node.position.y);
        for (let i = 1; i < this.objectSelectList.length; i++) {
            this.graph.lineTo(this.objectControllerList[this.objectSelectList[i]].node.position.x, this.objectControllerList[this.objectSelectList[i]].node.position.y)
        }

        let curpos = YYB_InputSystem.instance.Pointdirctor;
        let tt = new Vec3(0, 0, 0);
        this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(curpos.x, curpos.y, 0), tt);
        this.graph.lineTo(tt.x, tt.y);
        this.graph.stroke();
    }

    showAnswer() {
        this.graph.moveTo(this.objectControllerList[this.answer[this.sceneIdx][0]].node.position.x, this.objectControllerList[this.answer[this.sceneIdx][0]].node.position.y);
        for (let i = 1; i < this.answer[this.sceneIdx].length; i++) {
            this.graph.lineTo(this.objectControllerList[this.answer[this.sceneIdx][i]].node.position.x, this.objectControllerList[this.answer[this.sceneIdx][i]].node.position.y)
        }
        this.graph.stroke();

    }

    protected onEnable(): void {
        director.getScene().on("StartJudge", this.Judge, this);
        director.getScene().on("StartTouch", this.StartTouch, this);
    }

    Judge() {
        // console.log("SADSAD" + this.objectSelectList.length + "  " + this.tot);
        if (this.objectSelectList.length == this.tot) {
            // 获胜
            find("Canvas/Bg/成功").active = true;
            console.log("获胜");
        }
        this.isTouching = false;
        this.objectSelectList = [];
        this.suitableidx = [];
        this.graph.clear();
    }

    inWhichBox(pos: Vec2) { // 且不被选择,且能够选择
        for (let i = 0; i < this.objectControllerList.length; i++) {
            if (this.objectControllerList[i].canCross == false) {
                continue;
            }
            if (this.objectSelectList.indexOf(i) == -1) {
                if (this.objectControllerList[i].getComponent(UITransform).getBoundingBoxToWorld().contains(pos)) {
                    return i;
                }
            }
        }
        return -1;
    }

    StartTouch() {
        this.objectSelectList = [];
        this.suitableidx = [];
        this.isTouching = true;
        let curpos = YYB_InputSystem.instance.Pointdirctor;
        let idx = this.inWhichBox(curpos);
        // console.log(idx);
        // console.log(this.objectControllerList.length);
        // console.log(this.objectControllerList);
        if (idx == -1) {
            this.isTouching = false;
        } else {
            this.objectSelectList.push(idx);
            let x = idx % this.width, y = Math.floor(idx / this.width);
            for (let i = 0; i < 4; i++) {
                let u = x + this.dx[i];
                let v = y + this.dy[i];
                if (u < 0 || v < 0 || u >= this.width || v >= this.height) continue;
                let newidx = u + v * this.width;
                // console.log("FFF" + newidx + "SSS" + this.objectControllerList[newidx] + "BBB" + this.objectSelectList.indexOf(i));
                // console.log(newidx);
                // console.log(this.objectControllerList[newidx]);
                if (this.objectControllerList[newidx].canCross && this.objectSelectList.indexOf(newidx) == -1) {
                    // console.log(newidx);
                    this.suitableidx.push(newidx);
                }
            }
        }
    }

    protected onDisable(): void {
        director.getScene().off("StartJudge", this.Judge, this);
        director.getScene().off("StartTouch", this.StartTouch, this);
    }


    V2ValueEquel(v1: Vec2, v2: Vec2) {
        if (v1.x == v2.x && v1.y == v2.y) {
            return true;
        }
        return false;
    }
}


