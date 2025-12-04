import { _decorator, Component, EventTouch, Node, v2, v3, Vec2 } from 'cc';
import { ZWDZJS_Incident } from './ZWDZJS_Incident';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
import ZWDZJS_ZhiWuCao from './ZWDZJS_ZhiWuCao';
import ZWDZJS_ZhiWu from './植物/ZWDZJS_ZhiWu';
const { ccclass, property } = _decorator;

@ccclass('ZWDZJS_SkillColumnMenu')
export class ZWDZJS_SkillColumnMenu extends Component {

    public SkiiBeans: number = 3;//剩余豆子数量
    public MuBiaoPos: Vec2 = v2(0, 0);//目标位置
    public MuBiaoZuoBiao: Vec2 = v2(-1, -1);//坐标

    start() {
        this.ShowState();
        this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnMouseDown(even); });
        this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnMouseExit(even); });
        this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnMouseExit(even); });
        this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnMouseMove(even); });
    }

    //获得豆子
    Add_SkiiBeans(number: number) {
        this.SkiiBeans += number;
        this.ShowState();
    }

    //根据剩余豆子刷新状态
    ShowState() {
        this.node.getChildByName("栏目").children.forEach((nd: Node, index: number) => {
            if (this.SkiiBeans > index) {
                nd.active = true;
            } else {
                nd.active = false;
            }
        })

    }


    //    //物体单击按下事件
    OnMouseDown(even) {
        if (this.SkiiBeans <= 0) return;
        let x = even.getUILocation().x;
        let y = even.getUILocation().y;
        this.node.getChildByName("幻影图").setWorldPosition(v3(x, y));
        this.node.getChildByName("幻影图").active = true;
        return;
    }

    //    //拖拽事件
    OnMouseMove(even) {
        if (this.SkiiBeans <= 0) return;
        this.node.getChildByName("幻影图").setWorldPosition(v3(even.getUILocation().x, even.getUILocation().y));
        this.JuLiJiSuan(even);

    }
    //    //触摸离开事件
    OnMouseExit(even) {
        this.SkillColumn();
    }

    //    //计算和每个槽位之间的距离
    JuLiJiSuan(even: EventTouch) {
        let ZuoShangJiaoBiao = ZWDZJS_GameManager.Instance.ZuoShangJiaoBiao.getWorldPosition().clone();
        let Pos: Vec2 = even.getUILocation();
        let WHITH = ZWDZJS_ZhiWuCao.WHITH;
        for (let i = 0; i < 5; i++) {
            if (Math.abs(ZuoShangJiaoBiao.y - ((i + 0.5) * WHITH) - Pos.y) > WHITH / 2) {
                continue;
            }
            for (let j = 0; j < 9; j++) {
                let CaoPos: Vec2 = v2(ZuoShangJiaoBiao.x + (j + 0.5) * WHITH, ZuoShangJiaoBiao.y - ((i + 0.5) * WHITH));
                let x = Pos.x - CaoPos.x;
                let y = Pos.y - CaoPos.y;
                let Juli = Math.sqrt(x * x + y * y);
                if (Juli < WHITH / 1.5) {
                    this.MuBiaoPos = CaoPos;
                    this.MuBiaoZuoBiao = v2(i, j);
                    this.node.getChildByName("幻影图").active = true;
                    this.node.getChildByName("幻影图").setWorldPosition(v3(CaoPos.x, CaoPos.y, 0));
                    return;
                }
            }
        }
        this.MuBiaoZuoBiao = v2(-1, -1);
        this.MuBiaoPos = v2(0, 0);


    }

    //技能豆子事件
    SkillColumn() {
        this.node.getChildByName("幻影图").active = false;
        this.node.getChildByName("幻影图").position = v3(0, 0);
        if (this.MuBiaoPos.x != 0) {
            if (ZWDZJS_GameManager.Instance.ChaoChangZhuanTai[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y] != -1) {
                if (ZWDZJS_GameManager.Instance.ZhiWuArray[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y].getComponent(ZWDZJS_ZhiWu)?.IsCanSkill) {
                    ZWDZJS_GameManager.Instance.ZhiWuArray[this.MuBiaoZuoBiao.x][this.MuBiaoZuoBiao.y].getComponent(ZWDZJS_ZhiWu)?.Skill();
                    this.MuBiaoZuoBiao = v2(-1, -1);
                    this.MuBiaoPos = v2(0, 0);
                    this.Add_SkiiBeans(-1);
                    this.node.getChildByName("提示").active = false;
                }
                return;
            }
            console.log("空地无法使用豆子");
        }
        this.MuBiaoZuoBiao = v2(-1, -1);
        this.MuBiaoPos = v2(0, 0);
    }
}


