import { _decorator, Button, Component, director, Node, Sprite, SpriteFrame } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_incident } from './XSHZ_incident';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_SelectPanelSkillDownBox')
export class XSHZ_SelectPanelSkillDownBox extends Component {
    @property()
    public ID: number = 0;
    public IsPitchOn: boolean = false;//是否被选中

    public Name: string = "";//角色名字
    protected start(): void {
        director.getScene().on(XSHZ_EasyControllerEvent.选中通灵, this.OnSkillSelect, this);
        director.getScene().on(XSHZ_EasyControllerEvent.通灵选择框选中, (ID: number) => {
            if (ID == this.ID) {
                this.IsPitchOn = true;
                this.node.getChildByName("选中").active = true;
            } else {
                this.IsPitchOn = false;
                this.node.getChildByName("选中").active = false;
            }
        });

    }
    protected onEnable(): void {
        this.Name = "0";
        this.Show();
        if (XSHZ_GameManager.GameMode == "1V1" || XSHZ_GameManager.GameMode == "演练" || XSHZ_GameManager.GameMode == "强者挑战") {
            if (this.ID == 1 || this.ID == 2 || this.ID == 4 || this.ID == 5) {
                this.node.getChildByName("禁").active = true;
                this.node.getComponent(Button).enabled = false;
            }
        }
        if (XSHZ_GameManager.GameMode == "3V3") {
            this.node.getChildByName("禁").active = false;
            this.node.getComponent(Button).enabled = true;
        }
        if (XSHZ_GameManager.GameMode == "无尽试炼") {
            if (this.ID != 0) {
                this.node.getChildByName("禁").active = true;
                this.node.getComponent(Button).enabled = false;
            }
        }
    }
    OnClick() {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        director.getScene().emit(XSHZ_EasyControllerEvent.选择界面切换页面, "通灵");
        director.getScene().emit(XSHZ_EasyControllerEvent.通灵选择框选中, this.ID);

    }

    //有通灵被选中
    OnSkillSelect(name: string) {
        if (this.IsPitchOn) {
            XSHZ_GameManager.SkillData[this.ID] = Number(name);
            this.Name = name;
            this.Show();
        }
    }

    //根据选择的角色刷新当前的图像
    Show() {
        XSHZ_incident.LoadSprite("Sprite/通灵头像/" + this.Name).then((sprite: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sprite;
        });
    }
}


