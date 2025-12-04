import { _decorator, Component, EventTouch, Node, Sprite, SpriteFrame, tween, v2, v3 } from 'cc';
import { accessoriesData, QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_Tool } from '../Utils/QSSZG_Tool';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_accessories')
export class QSSZG_accessories extends Component {
    public accessoriesData: accessoriesData = null;
    start() {
        this.node.getChildByName("sprite").on(Node.EventType.TOUCH_START, () => { this.TOUCH_START(); })
        this.node.getChildByPath("按钮区/移动").on(Node.EventType.TOUCH_MOVE, (EventTouch) => { this.TOUCH_MOVE(EventTouch); })
    }
    TOUCH_START() {
        QSSZG_GameManager.Instance.SelectAccessories(this.accessoriesData, this.node);
    }
    TOUCH_MOVE(e: EventTouch) {
        let pos = e.getUILocation();
        pos.add(v2(165, -240));
        pos.x = QSSZG_Tool.Clamp(pos.x, 140, 2200);
        pos.y = QSSZG_Tool.Clamp(pos.y, 100, 300);
        this.node.setWorldPosition(v3(pos.x, pos.y, 0));
        this.accessoriesData.X = pos.x;
        this.accessoriesData.Y = pos.y;
    }
    Init(accessoriesData: accessoriesData) {
        this.accessoriesData = accessoriesData;

        if (QSSZG_GameData.Instance.accessoriesData[accessoriesData.aquariumID].indexOf(accessoriesData) == -1) {
            QSSZG_GameData.Instance.accessoriesData[accessoriesData.aquariumID].push(accessoriesData);
        }
        let Name: string = QSSZG_Constant.ShoppingName[2][this.accessoriesData.id];
        QSSZG_Incident.LoadSprite("Sprite/装饰/" + Name).then((data: SpriteFrame) => {
            this.node.getChildByName("sprite").getComponent(Sprite).spriteFrame = data;
            this.node.getChildByPath("sprite/Mask").getComponent(Sprite).spriteFrame = data;
        })
        tween(this.node.getChildByPath("sprite/Mask/白带"))
            .to(0, { position: v3(300, 200, 0) })
            .to(2, { position: v3(-280, -230, 0) })
            .delay(2)
            .union().repeatForever().start();
        this.node.setParent(QSSZG_GameManager.Instance.Canvas.getChildByPath("accessories/accessories" + accessoriesData.aquariumID));
        this.node.setWorldPosition(accessoriesData.X, accessoriesData.Y, 0);
        this.node.getChildByName("sprite").setScale(v3(this.accessoriesData.Isleft ? 1 : -1, 1, 1));
    }

    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "翻转":
                this.accessoriesData.Isleft = !this.accessoriesData.Isleft;
                this.node.getChildByName("sprite").setScale(v3(this.accessoriesData.Isleft ? 1 : -1, 1, 1));
                break;
            case "移除":
                QSSZG_GameManager.Instance.Deletaccessories();
                break;
            case "切换鱼缸":
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.切换鱼缸选择界面, [[0, 1, 2, 3, 4, 5], "装饰"]);
                break;
        }
    }

}


