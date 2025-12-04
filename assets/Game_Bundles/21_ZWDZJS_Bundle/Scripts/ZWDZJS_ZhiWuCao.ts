import { _decorator, Component, Vec2, v2, Sprite, Node, SpriteFrame, v3, Vec3, EventTouch } from 'cc';
import { ZWDZJS_Incident } from './ZWDZJS_Incident';
import ZWDZJS_GameDate from './ZWDZJS_GameDate';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_ZhiWuCao')
export default class ZWDZJS_ZhiWuCao extends Component {
    @property
    Id: number = 0;
    static WHITH: number = 162;
    public MuBiaoPos: Vec2 = v2(0, 0);//目标位置
    public MuBiaoZuoBiao: Vec2 = v2(-1, -1);//坐标
    public Cd: number = 0;//种植冷却
    public cd: number = 0;//当前cd
    private CdMask: Sprite | null = null;//cd遮罩的图片
    protected onLoad(): void {
        if (this.Id == -1) return;//铲子除外
        this.Cd = ZWDZJS_GameDate.ZhiWu_Cd[this.Id];
        this.CdMask = this.node.getChildByName("冷却遮罩").getComponent(Sprite);
    }
    start() {
        this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnMouseDown(even); });
        this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnMouseExit(even); });
        this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnMouseExit(even); });
        this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnMouseMove(even); });
        ZWDZJS_GameManager.Instance.SetSpriteSum(this.node.getChildByName("阳光")?.getComponent(Sprite));
    }
    protected update(dt: number): void {
        if (this.Id == -1) return;//铲子除外
        if (this.cd > 0) {
            this.cd -= dt;
            this.CdMask.fillStart = 1 - (this.cd / this.Cd);
        } else if (this.cd < 0) {
            this.cd = 0;
            this.CdMask.fillStart = 1;
        }
    }
    //    //物体单击按下事件
    OnMouseDown(even) {
        if (this.cd > 0) return;
        if (this.Id == -1) {//铲子
            ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + "铁锹小图").then((sp: SpriteFrame) => {
                this.node.getChildByName("HuanYingTu").getComponent(Sprite).spriteFrame = sp;
            });
            this.node.getChildByName("HuanYingTu").active = true;
            return;
        }
        if (!this.JiSuanYanGuang()) return;
        console.log("植物槽被按下");
        ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + ZWDZJS_GameDate.GetNameById(this.Id)).then((sp: SpriteFrame) => {
            this.node.getChildByName("HuanYingTu").getComponent(Sprite).spriteFrame = sp;
            this.node.getChildByName("HuanYingTu2").getComponent(Sprite).spriteFrame = sp;
        });
        this.node.getChildByName("HuanYingTu").active = true;
    }
    //    //拖拽事件
    OnMouseMove(even) {
        if (this.cd > 0) return;
        if (this.Id == -1) {//铲子
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            this.node.getChildByName("HuanYingTu").setWorldPosition(v3(x, y));
            this.JuLiJiSuan(even);
            return;
        }
        if (!this.JiSuanYanGuang()) return;
        this.node.getChildByName("HuanYingTu").setWorldPosition(v3(even.getUILocation().x, even.getUILocation().y));
        this.JuLiJiSuan(even);


    }
    //    //触摸离开事件
    OnMouseExit(even) {
        if (this.cd > 0) return;
        if (this.Id == -1) {//铲子
            this.ChangZi();
            return;
        }
        if (!this.JiSuanYanGuang()) return;
        console.log("植物槽被放开");
        this.node.getChildByName("HuanYingTu").active = false;
        this.node.getChildByName("HuanYingTu").position = v3(0, 0);
        this.node.getChildByName("HuanYingTu2").active = false;
        this.node.getChildByName("HuanYingTu2").setWorldPosition(v3(0, 0));
        if (this.MuBiaoPos.x != 0) {
            if (ZWDZJS_GameManager.Instance.ChaoChangZhuanTai[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y] != -1) {
                console.log("该槽位已经有植物存在");
                this.MuBiaoZuoBiao = v2(-1, -1);
                this.MuBiaoPos = v2(0, 0);
                return;
            }
            ZWDZJS_GameManager.Instance.PlayAudio(3);
            this.cd = this.Cd;
            //生成植物
            ZWDZJS_GameManager.Instance.Loding_ZhiWu(this.Id, this.MuBiaoZuoBiao);
            //扣掉阳光
            ZWDZJS_GameManager.Instance.Changge_YanGuang(-ZWDZJS_GameDate.ZhiWu_price[this.Id]);
        }
        this.MuBiaoZuoBiao = v2(-1, -1);
        this.MuBiaoPos = v2(0, 0);
    }
    //    //计算阳光是否充足
    JiSuanYanGuang(): boolean {
        if (ZWDZJS_GameManager.Instance.Dates[0] >= ZWDZJS_GameDate.ZhiWu_price[this.Id]) {
            return true;
        }
        return false;
    }
    //    //计算和每个槽位之间的距离
    JuLiJiSuan(even: EventTouch) {
        let ZuoShangJiaoBiao = ZWDZJS_GameManager.Instance.ZuoShangJiaoBiao.getWorldPosition().clone();
        let Pos: Vec2 = even.getUILocation();
        let WHITH = ZWDZJS_ZhiWuCao.WHITH;
        for (let i = 0; i < 5; i++) {
            if (Pos.x < ZuoShangJiaoBiao.x || Pos.y > ZuoShangJiaoBiao.y) {
                break;
            }
            if (Math.abs(ZuoShangJiaoBiao.y - ((i + 0.5) * WHITH) - Pos.y) > WHITH / 2) {
                continue;
            }
            for (let j = 0; j < 9; j++) {
                let CaoPos: Vec2 = v2(ZuoShangJiaoBiao.x + (j + 0.5) * WHITH, ZuoShangJiaoBiao.y - ((i + 0.5) * WHITH));
                let x = Pos.x - CaoPos.x;
                let y = Pos.y - CaoPos.y;
                let Juli = Math.sqrt(x * x + y * y);;
                if (Juli < WHITH / 1.5) {
                    this.MuBiaoPos = CaoPos;
                    this.MuBiaoZuoBiao = v2(i, j);
                    this.node.getChildByName("HuanYingTu2").active = true;
                    this.node.getChildByName("HuanYingTu2").setWorldPosition(v3(CaoPos.x, CaoPos.y, 0));
                    return;
                }
            }
        }
        this.MuBiaoZuoBiao = v2(-1, -1);
        this.MuBiaoPos = v2(0, 0);
        this.node.getChildByName("HuanYingTu2").active = false;
        this.node.getChildByName("HuanYingTu2").setWorldPosition(v3(0, 0));

    }
    //    //铲子事件
    ChangZi() {
        this.node.getChildByName("HuanYingTu").active = false;
        this.node.getChildByName("HuanYingTu").position = v3(0, 0);
        this.node.getChildByName("HuanYingTu2").active = false;
        this.node.getChildByName("HuanYingTu2").setWorldPosition(v3(0, 0));
        if (this.MuBiaoPos.x != 0) {
            if (ZWDZJS_GameManager.Instance.ChaoChangZhuanTai[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y] != -1) {
                ZWDZJS_GameManager.Instance.Delet_ZhiWu(ZWDZJS_GameManager.Instance.ZhiWuArray[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y]);
                this.MuBiaoZuoBiao = v2(-1, -1);
                this.MuBiaoPos = v2(0, 0);
                ZWDZJS_GameManager.Instance.PlayAudio(2);
                return;
            }
            console.log("空地没的铲");
        }
        this.MuBiaoZuoBiao = v2(-1, -1);
        this.MuBiaoPos = v2(0, 0);
    }
}


