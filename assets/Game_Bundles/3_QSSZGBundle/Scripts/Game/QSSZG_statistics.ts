import { _decorator, Component, EventTouch, instantiate, Node, Prefab, tween, UITransform, v3 } from 'cc';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_FishBox } from './QSSZG_FishBox';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_statistics')
export class QSSZG_statistics extends Component {
    @property(Node)
    Content: Node = null;
    Show() {
        this.InitData();
        this.Windows_InorOut(true);

    }

    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "关闭":
                this.Windows_InorOut(false);
                break;
            case "价格排序":
                this.NodeSort(0);
                break;
            case "收益排序":
                this.NodeSort(1);
                break;
            case "经验排序":
                this.NodeSort(2);
                break;
        }
    }
    //窗口滑出
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.setPosition(0, -1200, 0);
            tween(this.node)
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node)
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.统计界面);
                })
                .start();
        }
    }

    //生成当前场景所有数据
    InitData() {
        this.Content.removeAllChildren();
        QSSZG_Incident.Loadprefab(QSSZG_Constant.PrefabPath.鱼数据框).then((prefab: Prefab) => {
            QSSZG_GameData.Instance.aquariumDate[QSSZG_GameManager.Instance.aquariumID].forEach((data, index) => {
                let pre = instantiate(prefab);
                pre.getComponent(QSSZG_FishBox).Init(data);
                pre.setParent(this.Content);
            })
            let Line = Math.ceil(QSSZG_GameData.Instance.aquariumDate[QSSZG_GameManager.Instance.aquariumID].length / 2);
            this.Content.getComponent(UITransform).height = 330 * Line + 20;
        }
        )

    }

    NodeSort(type: number) {
        let list = QSSZG_GameData.Instance.aquariumDate[QSSZG_GameManager.Instance.aquariumID];
        if (type == 0) {
            list.sort((a, b) => { return QSSZG_Constant.GetPriceFromData(b) - QSSZG_Constant.GetPriceFromData(a); });
        }
        if (type == 1) {
            list.sort((a, b) => { return QSSZG_Constant.GetearningsFromData(b) - QSSZG_Constant.GetearningsFromData(a); });
        }
        if (type == 2) {
            list.sort((a, b) => { return b.Exp - a.Exp; });
        }
        this.InitData();
    }
}


