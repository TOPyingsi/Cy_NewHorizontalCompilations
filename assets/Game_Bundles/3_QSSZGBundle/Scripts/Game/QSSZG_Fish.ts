import { _decorator, Component, Label, log, Node, random, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { FishData, QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_Constant, QSSZG_FishType } from '../Data/QSSZG_Constant';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_Tool } from '../Utils/QSSZG_Tool';
import { QSSZG_Food } from './QSSZG_Food';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_Fish')
export class QSSZG_Fish extends Component {
    public FishData: FishData = null;
    public FishState: number = 0;//0幼小1长大
    private IsMoveing: boolean = false;//是否移动中
    private target: Node = null;
    private fishdata: { id: number, Name: string, Type: QSSZG_FishType, MinPrice: number, MaxPrice: number, production_value: number, MaxExp: number } = null;

    public ExpText: Node = null;
    protected update(dt: number): void {
        if (!this.IsMoveing) {
            if (this.FishState == 0) {//如果是小鱼寻找食物
                this.Findfood();
            } else {
                this.target = null;
            }
            if (this.target != null) {//有鱼饵
                let pos = this.target.getPosition();
                pos.add(this.target.getPosition().clone().subtract(this.node.position));
                pos.x = QSSZG_Tool.Clamp(pos.x, (-QSSZG_GameManager.Instance.ViewData.width / 2), (QSSZG_GameManager.Instance.ViewData.width / 2));
                pos.y = QSSZG_Tool.Clamp(pos.y, (-QSSZG_GameManager.Instance.ViewData.height / 2), (QSSZG_GameManager.Instance.ViewData.height / 2));
                this.Move(pos);
            } else {//没鱼饵
                let pos = this.node.position.clone().add(v3(Math.random() * 500 - 250, Math.random() * 500 - 250, 0));
                pos.x = QSSZG_Tool.Clamp(pos.x, (-QSSZG_GameManager.Instance.ViewData.width / 2), (QSSZG_GameManager.Instance.ViewData.width / 2));
                pos.y = QSSZG_Tool.Clamp(pos.y, (-QSSZG_GameManager.Instance.ViewData.height / 2), (QSSZG_GameManager.Instance.ViewData.height / 2));
                this.Move(pos);
            }
        }

    }
    start() {
        this.ExpText = this.node.getChildByName("经验文本");
        this.node.on(Node.EventType.TOUCH_START, () => { this.TOUCH_START(); })
        this.schedule(() => {
            this.AddExp(1, false);
        }, 1)
    }

    TOUCH_START() {
        QSSZG_GameManager.Instance.SelectFish(this.FishData, this.node);
    }
    Init(FishData: FishData) {
        this.FishData = FishData;
        this.fishdata = QSSZG_Constant.GetDataFromID(this.FishData.id);
        if (QSSZG_GameData.Instance.aquariumDate[FishData.aquariumID].indexOf(FishData) == -1) {
            QSSZG_GameData.Instance.aquariumDate[FishData.aquariumID].push(FishData);
        }
        let Name: string = QSSZG_Constant.GetLevelFromData(this.FishData) ? "_fish" : "_baby";
        if (FishData.Exp >= this.fishdata.MaxExp) {
            FishData.Exp = this.fishdata.MaxExp;
            this.FishState = 1;
        }
        QSSZG_Incident.LoadSprite("FishSprite/" + FishData.id + Name).then((data: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = data;
            this.node.getChildByName("Mask").getComponent(Sprite).spriteFrame = data;
        })
        tween(this.node.getChildByPath("Mask/白带"))
            .to(0, { position: v3(140, 100, 0) })
            .to(2, { position: v3(-150, -164, 0) })
            .delay(2)
            .union().repeatForever().start();
        this.node.setParent(QSSZG_GameManager.Instance.Canvas.getChildByPath("aquarium/aquarium" + FishData.aquariumID));
        this.node.setPosition(0, 0, 0);
    }

    //判断附近是否有鱼饵
    Findfood() {
        this.target = null;
        QSSZG_GameManager.Instance.FoodPanel.children.forEach((cd) => {
            if (this.node.getWorldPosition().clone().subtract(cd.getWorldPosition()).length() < 300) {
                this.target = cd;
                return;
            }
        })
    }

    //朝某点移动
    Move(pos: Vec3) {
        this.IsMoveing = true;
        if (pos.x > this.node.position.x) {
            this.node.setScale(-1, 1, 1);
        } else {
            this.node.setScale(1, 1, 1);
        }
        let time = Math.random() * 2 + 2;
        this.scheduleOnce(() => {
            if (this.target) {
                this.target.getComponent(QSSZG_Food).Be_Eaten();
                this.AddExp(QSSZG_GameData.Instance.LevelData.鱼饵等级 * 5 + 5);
            }
        }, time / 2)
        tween(this.node)
            .delay(0.3)
            .to(time, { position: pos }, { easing: "sineOut" })
            .call(() => {
                this.IsMoveing = false;
            })
            .start();
        let _scale = this.node.scale.clone();
        tween(this.node)
            .to(0.2, { scale: _scale.clone().multiply(v3(0.75, 1.25, 1)) })
            .to(0.2, { scale: _scale.clone().multiply(v3(1.25, 0.75, 1)) })
            .to(0.2, { scale: _scale })
            .start();
    }

    //增加经验
    AddExp(Exp: number, islook: boolean = true) {
        if (this.FishData.Exp > this.fishdata.MaxExp) {
            this.FishData.Exp = this.fishdata.MaxExp;
        }
        if (this.FishState == 1) return;
        this.FishData.Exp += Exp;
        if (islook) {
            this.Jump_ExpText("EXP+" + Exp);
        }
        if (this.FishData.Exp >= this.fishdata.MaxExp) {
            this.FishData.Exp = this.fishdata.MaxExp;
            this.FishState = 1;
            if (QSSZG_GameData.Instance.UnLookFishId.indexOf(this.fishdata.id) == -1) {
                QSSZG_GameData.Instance.UnLookFishId.push(this.fishdata.id);
            }
            QSSZG_GameManager.Instance.earnings += this.fishdata.production_value;
            QSSZG_Incident.LoadSprite("FishSprite/" + this.FishData.id + "_fish").then((data: SpriteFrame) => {
                this.node.getComponent(Sprite).spriteFrame = data;
                this.node.getChildByName("Mask").getComponent(Sprite).spriteFrame = data;
            })
        }
    }
    //跳出加经验文本
    Jump_ExpText(str: string) {
        this.ExpText.getComponent(Label).string = str;
        this.ExpText.active = true;
        this.ExpText.setPosition(v3(0, 0, 0));
        this.ExpText.setScale(v3(this.node.getScale().x, 1, 1));
        tween(this.ExpText)
            .to(0.7, { position: v3(0, 50, 0) })
            .call(() => { this.ExpText.active = false; })
            .start();
    }
}


