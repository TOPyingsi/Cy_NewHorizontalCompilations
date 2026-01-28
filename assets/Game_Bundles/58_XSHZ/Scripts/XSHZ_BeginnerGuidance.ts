import { _decorator, Component, Node, Size, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XSHZ_EasyController, XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_GameData } from './XSHZ_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_BeginnerGuidance')
export class XSHZ_BeginnerGuidance extends Component {

    public _schedule: number = 0;//进度
    public Pos: Vec3[] = [];


    start() {
        this.node.getChildByName("新手引导点位").children.forEach((cd, index) => {
            this.Pos[index] = cd.position;
        })
        this.Include(0);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.角色选择框选中, () => { this.Include(1); }, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.选中角色, () => { this.Include(2); }, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.通灵选择框选中, () => { this.Include(3); }, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.选中通灵, () => { this.Include(4); }, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.角色选择框选中, () => { this.Include(5); }, this);
    }

    //新手引导遮罩转移
    MaskMove(pos: Vec2, scalenum: number) {
        let pre = this.node.getChildByPath("Mask");
        tween(pre)
            .to(0.5, { position: v3(pos.x, pos.y) })
            .start();
        tween(pre.getComponent(UITransform))
            .to(0.5, { contentSize: new Size(scalenum, scalenum) })
            .call(() => {
                this.Openguide(this._schedule - 1);
            })
            .start();
    }
    HandTween: Tween<Node> = null;


    //处理监听事件
    Include(id: number) {
        if (this._schedule != id) {
            return;
        }
        console.log("新手引导进度" + id);
        this.Exitguide();
        switch (id) {
            case 0:
                // GameManager.Instance.MakeBG.parent.getComponent(ScrollView).horizontal = false;
                this.node.getChildByName("Mask").active = true;
                this.MaskMove(v2(this.Pos[0].x, this.Pos[0].y), 200);
                this._schedule = 1;
                break;
            case 1:
                this.MaskMove(v2(this.Pos[1].x, this.Pos[1].y), 200);
                this._schedule = 2;
                break;
            case 2:
                this.MaskMove(v2(this.Pos[2].x, this.Pos[2].y), 200);
                this._schedule = 3;
                break;
            case 3:
                this.MaskMove(v2(this.Pos[3].x, this.Pos[3].y), 200);
                this._schedule = 4;
                break;
            case 4:
                this.MaskMove(v2(this.Pos[4].x, this.Pos[4].y), 200);
                this._schedule = 5;
                break;
            case 5:
                this.Exit();
                break;
        }

    }


    //关闭所有指引
    Exitguide() {
        this.node.getChildByName("指引").children.forEach(cd => {
            cd.active = false;
        })
    }
    //展示指引
    Openguide(index: number) {
        this.node.getChildByName("指引").children[index].active = true;
    }
    //关闭引导
    Exit() {
        XSHZ_GameData.Instance.GameData[2] = 1;//完成新手引导
        this.node.active = false;
    }
}


