import { _decorator, Component, debug, find, Node, ScrollView, Size, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';


const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_BeginnerGuidance')
export class SJZGMMT_BeginnerGuidance extends Component {

    public _schedule: number = 0;//进度
    public Pos: Vec3[] = [
        v3(-1043.4, 254), v3(0, 0), v3(0, 0), v3(-1030, -400), v3(620, 370), v3(-1020, 430), v3(-670, -400), v3(-980, -100)
        , v3(-640, 30), v3(-260, -380), v3(-1020, 430), v3(830, -380)
    ];
    public TextPos: Vec3[] = [
        v3(-700, 254), v3(0, 0), v3(0, 0), v3(-880, -250), v3(560, 220), v3(-890, 330), v3(-670, -250), v3(-880, 40)
        , v3(-640, -100), v3(-260, -220), v3(-890, 330), v3(830, -220)
    ];

    start() {
        SJZGMMT_UIManager.Instance.SJZGMMT_On("关闭页面_" + SJZGMMT_Constant.Panel.CoursePanel, () => { this.Include(0); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("打开页面_" + SJZGMMT_Constant.Panel.SmallMapPanel, () => { this.Include(1); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("关闭页面_" + SJZGMMT_Constant.Panel.SmallMapPanel, () => { this.Include(2); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("关闭页面_" + SJZGMMT_Constant.Panel.SettleAccountsPanel, () => { this.Include(3); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("打开页面_" + SJZGMMT_Constant.Panel.WarehousePanel, () => { this.Include(4); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.一键出售杂物, () => { this.Include(5); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("关闭页面_" + SJZGMMT_Constant.Panel.WarehousePanel, () => { this.Include(6); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("打开页面_" + SJZGMMT_Constant.Panel.BazaarPanel, () => { this.Include(7); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.黑市切换栏位, () => { this.Include(8); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.黑市购买点击, () => { this.Include(9); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.获得框点击装备, () => { this.Include(10); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On("关闭页面_" + SJZGMMT_Constant.Panel.BazaarPanel, () => { this.Include(11); }, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.主页点击开始游戏, () => { this.Include(12); }, this);
    }

    protected update(dt: number): void {
        if (this.node.activeInHierarchy && this.node.getSiblingIndex() != this.node.parent.children.length) {
            this.node.setSiblingIndex(this.node.parent.children.length);
        }
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
        this.node.getChildByPath("指引").children.forEach((cd, index) => {
            cd.active = false;
            if (index == this._schedule) {
                cd.getChildByName("Label").setPosition(this.TextPos[index]);
                cd.active = true;
            }
        });
        tween(pre)
            .to(0.5, { position: v3(pos.x, pos.y) })
            .start();
        tween(pre.getComponent(UITransform))
            .to(0.5, { contentSize: new Size(scalenum, scalenum) })
            .start();
    }



    //处理监听事件
    Include(id: number) {
        if (this._schedule != id) {
            return;
        }
        console.log("新手引导进度" + id);
        switch (id) {
            case 0:
                this.node.getChildByName("Mask").active = true;
                this.node.getChildByName("跳过新手指引").active = true;
                this.MaskMove(v2(this.Pos[0].x, this.Pos[0].y), 200);
                this._schedule = 1;
                break;
            case 1:
                this.MaskMove(v2(this.Pos[1].x, this.Pos[1].y), 5000);
                this._schedule = 2;
                break;
            case 2:
                this.node.getChildByName("Mask").active = false;
                this.node.getChildByName("跳过新手指引").active = false;
                this.MaskMove(v2(this.Pos[2].x, this.Pos[2].y), 5000);
                this._schedule = 3;
                break;
            case 3:
                this.node.getChildByName("Mask").active = true;
                this.node.getChildByName("跳过新手指引").active = true;
                this.MaskMove(v2(this.Pos[3].x, this.Pos[3].y), 200);
                this._schedule = 4;
                break;
            case 4:
                this.MaskMove(v2(this.Pos[4].x, this.Pos[4].y), 200);
                this._schedule = 5;
                break;
            case 5:
                this.MaskMove(v2(this.Pos[5].x, this.Pos[5].y), 300);
                this._schedule = 6;
                break;
            case 6:
                this.MaskMove(v2(this.Pos[6].x, this.Pos[6].y), 200);
                this._schedule = 7;
                break;
            case 7:
                this.MaskMove(v2(this.Pos[7].x, this.Pos[7].y), 200);
                this._schedule = 8;
                break;
            case 8:
                this.MaskMove(v2(this.Pos[8].x, this.Pos[8].y), 200);
                this._schedule = 9;
                break;
            case 9:
                this.MaskMove(v2(this.Pos[9].x, this.Pos[9].y), 200);
                this._schedule = 10;
                break;
            case 10:
                this.MaskMove(v2(this.Pos[10].x, this.Pos[10].y), 200);
                this._schedule = 11;
                break;
            case 11:
                this.MaskMove(v2(this.Pos[11].x, this.Pos[11].y), 200);
                this._schedule = 12;
                break;
            case 12:
                this.Exit();
                this._schedule = 13;
                break;
        }

    }
    //关闭引导
    Exit() {
        this.node.getChildByName("Mask").active = false;
        this.node.getChildByName("跳过新手指引").active = false;
        SJZGMMT_GameData.Instance.GameData[5] = 1;
        this.node.active = false;
    }
}


