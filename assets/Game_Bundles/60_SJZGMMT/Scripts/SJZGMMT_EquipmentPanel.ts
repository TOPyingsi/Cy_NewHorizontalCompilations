import { _decorator, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_EquipmentPanel')
export class SJZGMMT_EquipmentPanel extends Component {
    public data: string[] = ["武器", "头盔", "防弹衣"];//和数据一一对应
    start() {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.装备切换, this.Show, this);
    }
    protected onEnable(): void {
        this.Show();
    }
    Show() {
        SJZGMMT_GameData.Instance.PlayerData.forEach((value, index) => {
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
            this.node.getChildByName(this.data[index]).getChildByPath("属性值/Label").getComponent(Label).string = `` + SJZGMMT_Constant.getPropDataByName(value).property;
            SJZGMMT_UIManager.Instance.GetPropSprite(value).then((sp: SpriteFrame) => {
                this.node.getChildByName(this.data[index]).getChildByName("图").getComponent(Sprite).spriteFrame = sp;
            })
            //加载品质背景
            let Quality = SJZGMMT_Constant.QuaLityList[SJZGMMT_Constant.getPropDataByName(value).quality];
            if (index == 0) Quality += "1";
            SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + Quality).then((sp: SpriteFrame) => {
                this.node.getChildByName(this.data[index]).getComponent(Sprite).spriteFrame = sp;
            })
        });


    }

    OnButtonClick(event: EventTouch) {
        switch (event.target.name) {
            case "武器":
                if (SJZGMMT_GameData.Instance.PlayerData[0] != "无") {
                    SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel2, [SJZGMMT_GameData.Instance.PlayerData[0]]);
                }
                break;
            case "头盔":
                if (SJZGMMT_GameData.Instance.PlayerData[1] != "无") {
                    SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel2, [SJZGMMT_GameData.Instance.PlayerData[1]]);
                }
                break;
            case "防弹衣":
                if (SJZGMMT_GameData.Instance.PlayerData[2] != "无") {
                    SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel2, [SJZGMMT_GameData.Instance.PlayerData[2]]);
                }
                break;

        }
    }


}


