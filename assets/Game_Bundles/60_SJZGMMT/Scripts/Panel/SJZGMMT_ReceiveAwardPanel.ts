import { _decorator, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZGMMT_PropBox } from '../SJZGMMT_PropBox';
import { SJZGMMT_Constant, SJZGMMT_PropDataItem, SJZGMMT_PropType } from '../SJZGMMT_Constant';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_ReceiveAwardPanel')
export class SJZGMMT_ReceiveAwardPanel extends PanelBase {
    @property(Prefab)
    PropBox: Prefab = null;
    @property(Node)
    PropContent: Node = null;

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.Init(args[0]);
    }
    private propdata: SJZGMMT_PropDataItem = null;
    Init(data: { Name: string, Num: number }[]) {
        this.PropContent.removeAllChildren();
        for (let i = 0; i < data.length; i++) {
            let box = instantiate(this.PropBox);
            box.active = true;
            box.setParent(this.PropContent);
            box.getComponent(SJZGMMT_PropBox).Show(data[i].Name, data[i].Num, true);
        }
        this.scheduleOnce(() => { this.PropContent.x = 0; })
        this.node.getChildByPath("框/按钮区/立即装备").active = false;
        if (data.length == 1) {
            this.propdata = SJZGMMT_Constant.getPropDataByName(data[0].Name);
            if (this.propdata.type == SJZGMMT_PropType.头盔 || this.propdata.type == SJZGMMT_PropType.武器 ||
                this.propdata.type == SJZGMMT_PropType.防具) {
                this.node.getChildByPath("框/按钮区/立即装备").active = true;
            }
        }
    }

    Onbuttomclick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "立即装备":
                SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.获得框点击装备);
                if (SJZGMMT_GameData.Instance.getWarehouseNum(this.propdata.Name) > 0) {
                    SJZGMMT_GameData.Instance.SubWarehouseData(this.propdata.Name, 1);
                    SJZGMMT_GameData.Instance.ChanggeEquip(this.propdata.Name);
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.ReceiveAwardPanel);
                    SJZGMMT_UIManager.Instance.ShowText("装备成功！");
                } else {
                    SJZGMMT_UIManager.Instance.ShowText("仓库中没有此装备，装备失败！");
                }
                break;
            case "确定":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.ReceiveAwardPanel);
                break;

        }
    }

}


