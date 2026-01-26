import { _decorator, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_EquipmentPanel')
export class SJZXD_EquipmentPanel extends Component {
    public data: string[] = ["武器", "头盔", "防弹衣"];//和数据一一对应
    start() {
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.装备切换, this.Show, this);
    }
    protected onEnable(): void {
        this.Show();
    }
    Show() {
        SJZXD_GameData.Instance.PlayerData.forEach((value, index) => {
            if (value == "无") {
                this.node.getChildByName(this.data[index]).getChildByName("未装备").active = true;
                this.node.getChildByName(this.data[index]).getChildByName("名字").active = false;
                this.node.getChildByName(this.data[index]).getChildByName("图").getComponent(Sprite).spriteFrame = null;
                this.node.getChildByName(this.data[index]).getChildByPath("属性值/Label").getComponent(Label).string = `0`;
                this.node.getChildByName(this.data[index]).getComponent(Sprite).spriteFrame = null;
                return;
            }
            this.node.getChildByName(this.data[index]).getChildByName("未装备").active = false;
            this.node.getChildByName(this.data[index]).getChildByName("名字").active = true;
            this.node.getChildByName(this.data[index]).getChildByName("名字").getComponent(Label).string = value;
            this.node.getChildByName(this.data[index]).getChildByPath("属性值/Label").getComponent(Label).string = `` + SJZXD_Constant.getPropDataByName(value).property;
            SJZXD_UIManager.Instance.GetPropSprite(value).then((sp: SpriteFrame) => {
                this.node.getChildByName(this.data[index]).getChildByName("图").getComponent(Sprite).spriteFrame = sp;
            })
            //加载品质背景
            let Quality = SJZXD_Constant.QuaLityList[SJZXD_Constant.getPropDataByName(value).quality];
            if (index == 0) Quality += "1";
            SJZXD_Incident.LoadSprite("Sprites/仓库/" + Quality).then((sp: SpriteFrame) => {
                this.node.getChildByName(this.data[index]).getComponent(Sprite).spriteFrame = sp;
            })
        });


    }

    OnButtonClick(event: EventTouch) {
        switch (event.target.name) {
            case "武器":
                if (SJZXD_GameData.Instance.PlayerData[0] != "无") {
                    SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel2, [SJZXD_GameData.Instance.PlayerData[0]]);
                }
                break;
            case "头盔":
                if (SJZXD_GameData.Instance.PlayerData[1] != "无") {
                    SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel2, [SJZXD_GameData.Instance.PlayerData[1]]);
                }
                break;
            case "防弹衣":
                if (SJZXD_GameData.Instance.PlayerData[2] != "无") {
                    SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel2, [SJZXD_GameData.Instance.PlayerData[2]]);
                }
                break;

        }
    }


}


