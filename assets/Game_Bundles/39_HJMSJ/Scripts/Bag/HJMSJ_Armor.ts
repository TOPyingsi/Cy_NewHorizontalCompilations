import { _decorator, Component, director, Node, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Armor')
export class HJMSJ_Armor extends Component {

    private armorSprite: Sprite = null;
    start() {
        this.armorSprite = this.node.getChildByName("armorSprite").getComponent(Sprite);

        let armorData = HJMSJ_GameData.Instance.getArmorDataByPart(this.node.name);
        if (armorData && armorData.Name !== "") {
            this.refreshArmor(armorData.Part, armorData.Name);
        }

        director.getScene().on("哈基米世界_刷新防具", (partName: string, armorName: string) => {
            this.refreshArmor(partName, armorName);
        })
    }

    resetData() {
        this.armorSprite.spriteFrame = null;
    }

    refreshArmor(partName: string, armorName: string) {
        HJMSJ_GameData.Instance.refreshArmorData(partName, armorName);

        if (partName === this.node.name) {
            HJMSJ_Incident.LoadSprite("Sprites/物品/" + armorName).then((sp: SpriteFrame) => {
                this.armorSprite.spriteFrame = sp;
            });
        }
    };
}


