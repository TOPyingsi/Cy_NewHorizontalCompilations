import { _decorator, Button, Component, director, Node, Sprite, SpriteFrame } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_SelectPanelDownBox')
export class XSHY_SelectPanelDownBox extends Component {
    @property()
    public ID: number = 0;
    public IsPitchOn: boolean = false;//是否被选中

    public Name: string = "";//角色名字
    protected start(): void {
        director.getScene().on(XSHY_EasyControllerEvent.选中角色, this.OnPlayerSelect, this);
        director.getScene().on(XSHY_EasyControllerEvent.角色选择框选中, (ID: number) => {
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
        this.node.getChildByName("图").getComponent(Sprite).spriteFrame = null;
        if (XSHY_GameManager.GameMode == "1V1" || XSHY_GameManager.GameMode == "演练" || XSHY_GameManager.GameMode == "强者挑战") {
            if (this.ID == 1 || this.ID == 2 || this.ID == 4 || this.ID == 5) {
                this.node.getChildByName("禁").active = true;
                this.node.getComponent(Button).enabled = false;
            }
        }
        if (XSHY_GameManager.GameMode == "3V3") {
            this.node.getChildByName("禁").active = false;
            this.node.getComponent(Button).enabled = true;
        }
        if (XSHY_GameManager.GameMode == "无尽试炼") {
            if (this.ID != 0) {
                this.node.getChildByName("禁").active = true;
                this.node.getComponent(Button).enabled = false;
            }
        }
    }
    OnClick() {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        director.getScene().emit(XSHY_EasyControllerEvent.选择界面切换页面, "忍者");
        director.getScene().emit(XSHY_EasyControllerEvent.角色选择框选中, this.ID);
    }

    //有角色被选中
    OnPlayerSelect(name: string) {
        if (this.IsPitchOn) {
            XSHY_GameManager.TeamData[this.ID] = name;
            this.Name = name;
            this.Show();
        }
    }

    //根据选择的角色刷新当前的图像
    Show() {
        XSHY_incident.LoadSprite("Sprite/头像/" + this.Name).then((sprite: SpriteFrame) => {
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sprite;
        });
    }
}


