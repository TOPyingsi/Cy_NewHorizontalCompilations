import { _decorator, Component, debug, find, Node, ScrollView, Size, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_BeginnerGuidance')
export class KKDKF_BeginnerGuidance extends Component {
    @property(Node)
    Hand: Node = null;//小手
    public _schedule: number = 0;//进度
    public Pos: Vec3[] = [];


    start() {
        KKDKF_GameManager.Instance.MakeBG.getChildByName("新手引导点位").children.forEach((cd, index) => {
            this.Pos[index] = cd.position;
        })

        KKDKF_EventManager.on(KKDKF_MyEvent.生产杯子, () => { this.Include(1); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.拖动咖啡勺到机器下, () => { this.Include(2); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.拖动碾压器到咖啡勺子, () => { this.Include(3); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.点击咖啡机按钮, () => { this.Include(4); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.杯子放到桌面, () => { this.Include(5); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.生产大杯子, () => { this.Include(6); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.大杯加咖啡, () => { this.Include(7); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.大杯加冰水, () => { this.Include(8); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.大杯加冰块, () => { this.Include(9); }, this);
        KKDKF_EventManager.on(KKDKF_MyEvent.上菜, () => { this.Include(10); }, this);
    }








    //显示人物指引
    SetPeoPle(id: number) {
        let pre = this.node.getChildByName("指引");
        pre.children.forEach((cd, index) => {
            if (index == id) {
                cd.active = true;
            } else {
                cd.active = false;
            }
        })
    }

    //新手引导遮罩转移
    MaskMove(pos: Vec2, scalenum: number) {
        let pre = this.node.getChildByPath("Mask");
        tween(pre)
            .to(0.5, { position: v3(pos.x, pos.y) })
            .start();
        tween(pre.getComponent(UITransform))
            .to(0.5, { contentSize: new Size(scalenum, scalenum) })
            .start();
    }
    HandTween: Tween<Node> = null;
    //小手位置
    SetHand(StartPos: Vec3, EndPos?: Vec3) {
        if (this.HandTween) {
            this.HandTween.stop();
            this.HandTween = null;
        }
        this.Hand.position = StartPos;
        this.Hand.scale = v3(1, 1, 1);
        if (EndPos) {
            this.HandTween = tween(this.Hand)
                .to(1, { position: EndPos })
                .to(1, { position: StartPos })
                .union()
                .repeatForever()
                .start();
        } else {
            this.HandTween = tween(this.Hand)
                .to(0.7, { scale: v3(1.2, 1.2, 1) })
                .to(0.7, { scale: v3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
        }
    }
    //小手显隐藏
    HandLook(IsLook: boolean) {
        if (this.HandTween) {
            this.HandTween.stop();
            this.HandTween = null;
        }
        this.Hand.active = IsLook;
    }

    //处理监听事件
    Include(id: number) {
        if (this._schedule != id) {
            return;
        }
        console.log("新手引导进度" + id);
        switch (id) {
            case 0:
                // GameManager.Instance.MakeBG.parent.getComponent(ScrollView).horizontal = false;
                this.node.getChildByName("Mask").active = true;
                this.MaskMove(v2(this.Pos[0].x, this.Pos[0].y), 300);
                this.SetPeoPle(0);
                this.HandLook(true);
                this.SetHand(this.Pos[0].subtract(v3(0, 100, 0)));
                this._schedule = 1;
                break;
            case 1:
                this.MaskMove(v2(this.Pos[1].x, this.Pos[1].y), 800);
                this.SetPeoPle(1);
                this.HandLook(true);
                this.SetHand(this.Pos[1].clone().add(v3(320, 40, 0)), this.Pos[1].clone().add(v3(-240, -50, 0)));
                this._schedule = 2;
                break;
            case 2:
                this.MaskMove(v2(this.Pos[2].x, this.Pos[2].y), 500);
                this.SetPeoPle(2);
                this.HandLook(true);
                this.SetHand(this.Pos[2].clone().add(v3(100, -80, 0)), this.Pos[2].clone().add(v3(-60, -80, 0)));
                this._schedule = 3;
                break;
            case 3:
                this.MaskMove(v2(this.Pos[3].x, this.Pos[3].y), 300);
                this.SetPeoPle(3);
                this.HandLook(true);
                this.SetHand(this.Pos[3].clone().add(v3(0, -80, 0)));
                this._schedule = 4;
                break;
            case 4:
                this.MaskMove(v2(this.Pos[4].x, this.Pos[4].y), 1800);
                this.SetPeoPle(4);
                this.HandLook(true);
                this.SetHand(this.Pos[4].clone().add(v3(-720, -130, 0)), this.Pos[4].clone().add(v3(700, -220, 0)));
                this._schedule = 5;
                break;
            case 5:
                this.MaskMove(v2(this.Pos[5].x, this.Pos[5].y), 400);
                this.SetPeoPle(5);
                this.HandLook(true);
                this.SetHand(this.Pos[5].clone().add(v3(-0, -80, 0)));
                this._schedule = 6;
                break;
            case 6:
                this.MaskMove(v2(this.Pos[6].x, this.Pos[6].y), 900);
                this.SetPeoPle(6);
                this.HandLook(true);
                this.SetHand(this.Pos[6].clone().add(v3(-150, 0, 0)), this.Pos[6].clone().add(v3(150, 0, 0)));
                this._schedule = 7;
                break;
            case 7:
                this.MaskMove(v2(this.Pos[7].x, this.Pos[7].y), 1000);
                this.SetPeoPle(7);
                this.HandLook(true);
                this.SetHand(this.Pos[7].clone().add(v3(0, 200, 0)), this.Pos[7].clone().add(v3(0, -200, 0)));
                this._schedule = 8;
                break;
            case 8:
                this.MaskMove(v2(this.Pos[8].x, this.Pos[8].y), 1200);
                this.SetPeoPle(8);
                this.HandLook(true);
                this.SetHand(this.Pos[8].clone().add(v3(-300, 0, 0)), this.Pos[8].clone().add(v3(300, 0, 0)));
                this._schedule = 9;
                break;
            case 9:
                this.MaskMove(v2(this.Pos[9].x, this.Pos[9].y), 5000);
                this.SetPeoPle(9);
                this.HandLook(true);
                this.SetHand(this.Pos[9].clone(), this.Pos[9].clone().add(v3(-700, 700, 0)));
                this._schedule = 10;
                break;
            case 10:
                this.Exit();
                this.SetPeoPle(-1);
                this.HandLook(false);
                this._schedule = 11;
                break;
        }
        KKDKF_GameManager.Instance.Beginnerschedule = this._schedule;
    }
    //关闭引导
    Exit() {
        KKDKF_GameManager.Instance.GameStart = true;
        this.node.active = false;
    }
}


