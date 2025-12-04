import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_PoolManager } from './Utils/XYRZZ_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_SkillBox')
export class XYRZZ_SkillBox extends Component {
    //传入技能名
    Show(str: string) {
        let Data: string = XYRZZ_Constant.GetTableData(XYRZZ_Constant.FishingPoleData, "Name", str).Data;
        this.node.getChildByName("技能名字").getComponent(Label).string = str;
        XYRZZ_Incident.Loadprefab("Prefabs/按键").then((prefab: Prefab) => {
            for (let i = 0; i < Data.length; i++) {
                let pre = XYRZZ_PoolManager.Instance.GetNode(prefab, this.node.getChildByName("Content"));
                XYRZZ_Incident.LoadSprite("UI/人物界面/" + Data[i]).then((sp: SpriteFrame) => {
                    pre.getComponent(Sprite).spriteFrame = sp;
                })
            }
        })
    }
}


