import { _decorator, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZXD_PropBox } from '../SJZXD_PropBox';
import { SJZXD_Constant, SJZXD_PropDataItem, SJZXD_PropType } from '../SJZXD_Constant';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_ReceiveAwardPanel')
export class SJZXD_ReceiveAwardPanel extends PanelBase {
    @property(Prefab)
    PropBox: Prefab = null;
    @property(Node)
    PropContent: Node = null;

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.Init(args[0]);
    }
    private propdata: SJZXD_PropDataItem = null;
    Init(data: { Name: string, Num: number }[]) {
        this.PropContent.removeAllChildren();
        for (let i = 0; i < data.length; i++) {
            let box = instantiate(this.PropBox);
            box.active = true;
            box.setParent(this.PropContent);
            box.getComponent(SJZXD_PropBox).Show(data[i].Name, data[i].Num, true);
        }
        this.scheduleOnce(() => { this.PropContent.x = 0; })
        this.node.getChildByPath("框/按钮区/立即装备").active = false;
        if (data.length == 1) {
            this.propdata = SJZXD_Constant.getPropDataByName(data[0].Name);
            if (this.propdata.type == SJZXD_PropType.头盔 || this.propdata.type == SJZXD_PropType.武器 ||
                this.propdata.type == SJZXD_PropType.防具) {
                this.node.getChildByPath("框/按钮区/立即装备").active = true;
            }
        }
    }

    Onbuttomclick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "立即装备":
                SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.获得框点击装备);
                if (SJZXD_GameData.Instance.getWarehouseNum(this.propdata.Name) > 0) {
                    SJZXD_GameData.Instance.SubWarehouseData(this.propdata.Name, 1);
                    SJZXD_GameData.Instance.ChanggeEquip(this.propdata.Name);
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.ReceiveAwardPanel);
                    SJZXD_UIManager.Instance.ShowText("装备成功！");
                } else {
                    SJZXD_UIManager.Instance.ShowText("仓库中没有此装备，装备失败！");
                }
                break;
            case "确定":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.ReceiveAwardPanel);
                break;

        }
    }

}


