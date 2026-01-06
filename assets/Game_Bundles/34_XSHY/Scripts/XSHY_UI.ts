import { _decorator, Animation, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XSHY_EasyController, XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_Constant } from './XSHY_Constant';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_GameData } from './XSHY_GameData';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_UI')
export class XSHY_UI extends Component {

    private FindNode: XSHY_Unit = null;//UI追寻单位

    private Skill1Maske: Sprite = null;
    private Skill2Maske: Sprite = null;
    private Skill3Maske: Sprite = null;
    private Skill4Maske: Sprite = null;
    start() {
        this.node.getChildByName("加载界面").active = true;
        director.getScene().on(XSHY_EasyControllerEvent.隐藏加载界面, () => { this.node.getChildByName("加载界面").active = false; })
        if (XSHY_GameManager.Instance.LoadIndex >= XSHY_GameManager.Instance.LoadMaxIndex) {
            this.node.getChildByName("加载界面").active = false;
        }
        this.scheduleOnce(() => {
            if (this.node.getChildByName("加载界面").activeInHierarchy) {
                this.node.getChildByName("加载界面").active = false;
            }
        }, 3)
        director.getScene().on(XSHY_EasyControllerEvent.主程序就绪, this.InitSkillSprite, this)
        director.getScene().on(XSHY_EasyControllerEvent.弹出结算窗口, this.OpenGameOverPanel, this)
        director.getScene().on(XSHY_EasyControllerEvent.受击, this.AttackUI, this)
        director.getScene().on(XSHY_EasyControllerEvent.PlayerOnLoad, (nd: Node) => { this.FindNode = nd.getComponent(XSHY_Unit); })
        director.getScene().on(XSHY_EasyControllerEvent.弹出下一场, this.OpenNextUI, this)

        this.Skill1Maske = this.node.getChildByName("技能1").getComponent(Sprite);
        this.Skill2Maske = this.node.getChildByName("技能2").getComponent(Sprite);
        this.Skill3Maske = this.node.getChildByName("技能3").getComponent(Sprite);
        this.Skill4Maske = this.node.getChildByName("通灵").getComponent(Sprite);



    }












    //初始化技能图片
    InitSkillSprite() {
        let name = XSHY_GameManager.TeamData[XSHY_GameManager.PlayerID];
        XSHY_incident.LoadSprite("Sprite/技能图片/" + name + "/0").then((sp: SpriteFrame) => {
            this.node.getChildByName("技能1").getComponent(Sprite).spriteFrame = sp;
        })
        XSHY_incident.LoadSprite("Sprite/技能图片/" + name + "/1").then((sp: SpriteFrame) => {
            this.node.getChildByName("技能2").getComponent(Sprite).spriteFrame = sp;
        })
        XSHY_incident.LoadSprite("Sprite/技能图片/" + name + "/2").then((sp: SpriteFrame) => {
            this.node.getChildByName("技能3").getComponent(Sprite).spriteFrame = sp;
        })
        XSHY_incident.LoadSprite("Sprite/通灵头像/" + XSHY_GameManager.SkillData[XSHY_GameManager.PlayerID]).then((sp: SpriteFrame) => {
            this.node.getChildByName("通灵").getComponent(Sprite).spriteFrame = sp;
        })

    }

    OnButtomClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "攻击":
                director.getScene().emit(XSHY_EasyControllerEvent.ATTACK);
                break;
            case "技能1":
                director.getScene().emit(XSHY_EasyControllerEvent.SKILL, 1);
                break;
            case "技能2":
                director.getScene().emit(XSHY_EasyControllerEvent.SKILL, 2);
                break;
            case "技能3":
                director.getScene().emit(XSHY_EasyControllerEvent.SKILL, 3);
                break;
            case "通灵":
                director.getScene().emit(XSHY_EasyControllerEvent.TongLing);
                break;
            case "退出":
                if (!Banner.TimeMask) {
                    ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                        UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                            ProjectEventManager.emit(ProjectEvent.返回主页, "像素火影");
                        })
                    });
                    return;
                }
                director.loadScene("XSHY_Start");
                break;


        }
    }

    AttackUICD: number = 0;//连击多久后消失
    //受击UI刷新
    AttackUI(num: number) {
        this.node.getChildByName("连击数底").active = true;
        tween(this.node.getChildByName("连击数底"))
            .to(0.1, { scale: v3(1.2, 1.2, 1.2) }, { easing: "backIn" })
            .to(0.2, { scale: v3(1, 1, 1) })
            .start();
        this.node.getChildByPath("连击数底/文本").getComponent(Label).string = `${num}连击`;
        this.AttackUICD = 1;
    }

    protected update(dt: number): void {
        if (this.AttackUICD > 0) {
            this.AttackUICD -= dt;
            if (this.AttackUICD < 0) {
                this.node.getChildByName("连击数底").active = false;
            }
        }
        this.SkillMaskShow();
    }

    //弹出结算界面
    OpenGameOverPanel(IsWinner: boolean) {
        this.node.getChildByName("结算界面").active = true;
        if (IsWinner) {
            this.node.getChildByPath("结算界面/胜利").active = true;
        } else {
            this.node.getChildByPath("结算界面/失败").active = true;
        }

        //结算奖励
        let money: number = 0;
        let exp: number = 0;
        if (XSHY_GameManager.GameMode == "1V1") {
            if (IsWinner) {
                money = 50;
                exp = 30;
            } else {
                money = 20;
                exp = 10;
            }
        }
        if (XSHY_GameManager.GameMode == "3V3") {
            if (IsWinner) {
                money = 120;
                exp = 100;
            } else {
                money = 40;
                exp = 25;
            }
        }
        if (XSHY_GameManager.GameMode == "无尽试炼") {
            money = XSHY_GameManager.WinNum * 25;
            exp = XSHY_GameManager.WinNum * 15;
        }
        if (XSHY_GameManager.GameMode == "强者挑战") {
            if (IsWinner) {
                if (XSHY_GameManager.difficulty == "困难") {
                    money = XSHY_GameManager.WinNum * 150;
                    exp = XSHY_GameManager.WinNum * 150;
                }
                if (XSHY_GameManager.difficulty == "极难") {
                    money = XSHY_GameManager.WinNum * 300;
                    exp = XSHY_GameManager.WinNum * 300;
                }
            } else {
                money = 20;
                exp = 10;
            }
        }
        XSHY_GameData.Instance.Money += money;
        XSHY_GameData.Instance.GameData[0] += exp;
        XSHY_GameData.DateSave();
        this.node.getChildByPath("结算界面/奖励/钻石数量").getComponent(Label).string = `${money}`;
        this.node.getChildByPath("结算界面/奖励/经验数量").getComponent(Label).string = `${exp}`;
    }


    private SkillState: boolean[] = [];
    //技能按钮遮罩
    SkillMaskShow() {
        if (!this.FindNode || !this.FindNode.isValid) return;
        this.SkillState[0] = this.FindNode.Mp >= 20;
        this.SkillState[1] = this.FindNode.Mp >= 40;
        this.SkillState[2] = this.FindNode.Mp >= 60;
        this.SkillState[3] = this.FindNode.SkillCount >= 1;
        if (this.Skill1Maske.grayscale == this.SkillState[0]) this.Skill1Maske.grayscale = !this.SkillState[0];
        if (this.Skill2Maske.grayscale == this.SkillState[1]) this.Skill2Maske.grayscale = !this.SkillState[1];
        if (this.Skill3Maske.grayscale == this.SkillState[2]) this.Skill3Maske.grayscale = !this.SkillState[2];
        if (this.Skill4Maske.grayscale == this.SkillState[3]) this.Skill4Maske.grayscale = !this.SkillState[3];
    }
    //弹出下一场UI  
    OpenNextUI() {
        this.node.getChildByName("下一场").active = true;
        this.node.getChildByName("下一场").getComponent(Animation).play();
    }
}


