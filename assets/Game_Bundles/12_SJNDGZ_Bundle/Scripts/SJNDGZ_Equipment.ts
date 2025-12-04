import { _decorator, Component, find, instantiate, Label, Node, Prefab } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_ItemEquipment } from './SJNDGZ_ItemEquipment';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { SJNDGZ_PICKAXE } from './SJNDGZ_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_Equipment')
export class SJNDGZ_Equipment extends Component {
    public static Instance: SJNDGZ_Equipment = null;

    Content: Node = null;
    Grade: Label = null;

    protected onLoad(): void {
        SJNDGZ_Equipment.Instance = this;
        this.Content = find("View/Content", this.node);
        this.Grade = find("等级", this.node).getComponent(Label);
    }

    protected start(): void {
        this.show();
        this.updateGrade();
    }

    updateGrade() {
        this.Grade.string = "Lv." + SJNDGZ_GameData.Instance.userData.等级;
    }

    show() {
        this.Content.removeAllChildren();
        for (let key in SJNDGZ_GameData.Instance.Pickaxe) {
            BundleManager.LoadPrefab("12_SJNDGZ_Bundle", "Item_背包").then((prefab: Prefab) => {
                const item = instantiate(prefab);
                item.parent = this.Content;
                item.getComponent(SJNDGZ_ItemEquipment).show(key, SJNDGZ_GameData.Instance.Pickaxe[key].Num)
            })
        }

        for (let key in SJNDGZ_GameData.Instance.userData) {
            if (key == "金币" || key == "奖杯" || key == "使用增益" || key == "等级" || key == "经验" || key == "当日积分" || key == "拥有镐子最高等级" || SJNDGZ_GameData.Instance.userData[key] <= 0) continue;
            BundleManager.LoadPrefab("12_SJNDGZ_Bundle", "Item_背包").then((prefab: Prefab) => {
                const item = instantiate(prefab);
                item.parent = this.Content;
                item.getComponent(SJNDGZ_ItemEquipment).showProp(key, SJNDGZ_GameData.Instance.userData[key])
            })
        }
    }
}


