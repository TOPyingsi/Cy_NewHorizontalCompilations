import { _decorator, Component, debug, find, Node, Size, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from '../XYRZZ_EventManager';
import { XYRZZ_Panel } from '../XYRZZ_UIManager';
import { XYRZZ_GameData } from '../XYRZZ_GameData';

const { ccclass, property } = _decorator;

@ccclass('XYRZZ_BeginnerGuidance')
export class XYRZZ_BeginnerGuidance extends Component {
    @property(Node)
    Hand: Node = null;//小手
    public _schedule: number = 0;//进度
    public Pos: Vec3[] = [];


    start() {
        this.Pos[0] = find("Canvas/Game/MainPlayer").getWorldPosition().clone().add(v3(300, 200));
        this.Pos[1] = find("Canvas/UI/Dowm/升级").getWorldPosition().clone();
        this.Pos[2] = v3(0, 0);
        this.Pos[3] = find("Canvas/UI/Left/钓法").getWorldPosition().clone();
        this.Pos[4] = find("Canvas/UI/Left/鱼类图鉴").getWorldPosition().clone();
        this.Pos[5] = find("Canvas/UI/Dowm/钓鱼").getWorldPosition().clone();
        this.Include(0);
        XYRZZ_EventManager.on(XYRZZ_MyEvent.点击主页玩家, () => { this.Include(1); }, this);
        XYRZZ_EventManager.on("Show_" + XYRZZ_Panel.XYRZZ_UpLevelPanel, () => { this.Include(2); }, this);//打开升级界面
        XYRZZ_EventManager.on("Hide_" + XYRZZ_Panel.XYRZZ_UpLevelPanel, () => { this.Include(3); }, this);//关闭升级界面
        XYRZZ_EventManager.on("Show_" + XYRZZ_Panel.XYRZZ_FishingPanel, () => { this.Include(4); }, this);//打开钓法界面
        XYRZZ_EventManager.on("Hide_" + XYRZZ_Panel.XYRZZ_FishingPanel, () => { this.Include(5); }, this);//关闭钓法界面
        XYRZZ_EventManager.on("Show_" + XYRZZ_Panel.XYRZZ_Handbook, () => { this.Include(6); }, this);//打开图鉴界面
        XYRZZ_EventManager.on("Hide_" + XYRZZ_Panel.XYRZZ_Handbook, () => { this.Include(7); }, this);//关闭图鉴界面
        XYRZZ_EventManager.on("Show_" + XYRZZ_Panel.XYRZZ_SelectScenePanel, () => { this.Include(8); }, this);//打开选关界面
        XYRZZ_EventManager.on("Show_" + XYRZZ_Panel.XYRZZ_CombatPanel, () => { this.Include(9); }, this);//打开战斗界面
        XYRZZ_EventManager.on(XYRZZ_MyEvent.鱼上钩, () => { this.Include(10); }, this);//鱼上钩
        XYRZZ_EventManager.on(XYRZZ_MyEvent.点击搓招, () => { this.Include(11); }, this);//点击搓招
        XYRZZ_EventManager.on(XYRZZ_MyEvent.点击放, () => { this.Include(12); }, this);//点击放
        XYRZZ_EventManager.on("Hide_" + XYRZZ_Panel.XYRZZ_CombatPanel, () => { this.Include(12); }, this);//关闭战斗界面
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
            .to(0.5, { worldPosition: v3(pos.x, pos.y) })
            .start();
        tween(pre.getComponent(UITransform))
            .to(0.5, { contentSize: new Size(scalenum, scalenum) })
            .start();
    }
    HandTween: Tween<Node> = null;
    // //小手位置
    // SetHand(StartPos: Vec3, EndPos?: Vec3) {
    //     this.Hand.position = StartPos;
    //     this.Hand.scale = v3(1, 1, 1);
    //     if (EndPos) {
    //         this.HandTween = tween(this.Hand)
    //             .to(1, { position: EndPos })
    //             .to(1, { position: StartPos })
    //             .union()
    //             .repeatForever()
    //             .start();
    //     } else {
    //         this.HandTween = tween(this.Hand)
    //             .to(0.7, { scale: v3(1.2, 1.2, 1) })
    //             .to(0.7, { scale: v3(1, 1, 1) })
    //             .union()
    //             .repeatForever()
    //             .start();
    //     }
    // }
    //小手显隐藏
    // HandLook(IsLook: boolean) {
    //     if (this.HandTween) {
    //         this.HandTween.stop();
    //         this.HandTween = null;
    //     }
    //     this.Hand.active = IsLook;
    // }

    //处理监听事件
    Include(id: number) {
        // if (this._schedule != id) {
        //     return;
        // }
        console.log("新手引导进度" + id);
        switch (id) {
            case 0:
                this.node.getChildByName("Mask").active = true;
                this.MaskMove(v2(this.Pos[0].x, this.Pos[0].y), 600);
                this.SetPeoPle(0);
                this._schedule = 1;
                break;
            case 1:
                this.MaskMove(v2(this.Pos[1].x, this.Pos[1].y), 200);
                this.SetPeoPle(1);
                this._schedule = 2;
                break;
            case 2:
                this.node.getChildByPath("Mask").active = false;
                this.SetPeoPle(2);
                this._schedule = 3;
                break;
            case 3:
                this.node.getChildByPath("Mask").active = true;
                this.MaskMove(v2(this.Pos[3].x, this.Pos[3].y), 200);
                this.SetPeoPle(3);
                this._schedule = 4;
                break;
            case 4:
                this.node.getChildByPath("Mask").active = false;
                this.SetPeoPle(4);
                this._schedule = 5;
                break;
            case 5:
                this.node.getChildByPath("Mask").active = true;
                this.MaskMove(v2(this.Pos[4].x, this.Pos[4].y), 200);
                this.SetPeoPle(5);
                this._schedule = 6;
                break;
            case 6:
                this.node.getChildByPath("Mask").active = false;
                this.SetPeoPle(6);
                this._schedule = 7;
                break;
            case 7:
                this.node.getChildByPath("Mask").active = true;
                this.MaskMove(v2(this.Pos[5].x, this.Pos[5].y), 200);
                this.SetPeoPle(7);
                this._schedule = 8;
                break;
            case 8:
                this.MaskMove(v2(this.Pos[5].x, this.Pos[5].y), 400);
                this.SetPeoPle(8);
                this._schedule = 9;
                break;
            case 9:
                this.node.getChildByPath("Mask").active = false;
                this.SetPeoPle(9);
                this._schedule = 10;
                break;
            case 10:
                this.SetPeoPle(10);
                this._schedule = 11;
                break;
            case 11:
                this.SetPeoPle(11);
                this._schedule = 12;
                break;
            case 12:
                XYRZZ_GameData.Instance.GameData[6] = 1;
                this.node.destroy();
                break;
        }

    }
    //关闭引导
    Exit() {

        this.node.active = false;
    }
}


