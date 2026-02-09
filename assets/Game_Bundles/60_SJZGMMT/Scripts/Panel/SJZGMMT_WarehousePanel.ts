import { _decorator, Color, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, tween, UITransform, Widget } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant, SJZGMMT_PropType, SJZGMMT_Quality } from '../SJZGMMT_Constant';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_PropBox } from '../SJZGMMT_PropBox';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_WarehousePanel')
export class SJZGMMT_WarehousePanel extends PanelBase {
    @property(Prefab)
    PropBox: Prefab = null;
    @property(Node)
    PropContent: Node = null;

    private warehouseBoxMap: Map<string, Node> = new Map();
    private propProgressNode: Node = null;//属性区
    private Index: number = 0;//0全部1武器2防具3物品
    protected onLoad(): void {
        this.propProgressNode = this.node.getChildByPath("框/属性区");
    }

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }
    protected onEnable(): void {
        this.ShowWarehouse();
        this.ChangeIndexColor();
        this.ChangePropProgress();
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.装备切换, this.ChangePropProgress, this);
    }

    //刷新整个仓库
    ShowWarehouse() {
        let warehouseData = SJZGMMT_GameData.Instance.WarehouseData;
        this.PropContent.children.forEach(element => {//取消激活所有box
            element.active = false;
        });

        // 根据Index过滤道具
        let filteredData = warehouseData;
        if (this.Index !== 0) { // 如果不是显示全部
            filteredData = warehouseData.filter(item => {
                const propData = SJZGMMT_Constant.getPropDataByName(item.Name);
                if (!propData) return false; // 如果找不到道具数据，过滤掉

                // 根据Index值判断类型
                if (this.Index === 1) { // 武器
                    return propData.type === SJZGMMT_PropType.武器;
                } else if (this.Index === 2) { // 防具（包括头盔和防具）
                    return propData.type === SJZGMMT_PropType.头盔 || propData.type === SJZGMMT_PropType.防具;
                } else if (this.Index === 3) { // 物品（回收物）
                    return propData.type === SJZGMMT_PropType.回收物;
                }
                return true;
            });
        }

        for (let i = 0; i < filteredData.length; i++) {
            if (this.warehouseBoxMap.has(filteredData[i].Name)) {
                this.warehouseBoxMap.get(filteredData[i].Name).active = true;
                this.warehouseBoxMap.get(filteredData[i].Name).getComponent(SJZGMMT_PropBox).refresh();
            } else {
                let box = instantiate(this.PropBox);
                box.active = true;
                box.setParent(this.PropContent);
                box.getComponent(SJZGMMT_PropBox).Show(filteredData[i].Name);
                this.warehouseBoxMap.set(filteredData[i].Name, box);
            }
        }
        let num = 0;
        this.warehouseBoxMap.forEach(element => {
            if (element.activeInHierarchy) num++;
        });
        this.PropContent.getComponent(UITransform).height = Math.ceil(num / 4) * 228;
        this.PropContent.getComponent(Widget).top = 0;
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.WarehousePanel);
                break;
            case "一键出售":
                SJZGMMT_GameData.Instance.WarehouseData.forEach(element => {
                    let data = SJZGMMT_Constant.getPropDataByName(element.Name);
                    if (data.type == SJZGMMT_PropType.回收物 && data.quality != SJZGMMT_Quality.红色) {
                        const num = element.Num; // 先保存数量防止被清空
                        SJZGMMT_GameData.Instance.SubWarehouseData(element.Name, element.Num);
                        SJZGMMT_GameData.Instance.ChanggeMoney(data.price * num);
                    }
                });
                SJZGMMT_UIManager.Instance.ShowText(`一键出售成功！`);
                SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.一键出售杂物);
                break;
        }

    }

    OnIndexClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "全部": this.Index = 0; break;
            case "武器": this.Index = 1; break;
            case "防具": this.Index = 2; break;
            case "物品": this.Index = 3; break;
        }
        this.ShowWarehouse();
        tween(this.node.getChildByPath("框/仓库区/选中"))
            .to(0.4, { x: event.target.position.x }, { easing: "backOut" })
            .start();
        this.ChangeIndexColor();
    }

    //改变选择文字颜色
    ChangeIndexColor() {
        this.node.getChildByPath("框/仓库区/顶栏").children.forEach((element, index) => {
            element.getChildByName("Label").getComponent(Label).color
                = index == this.Index ? new Color(255, 168, 0) : new Color(255, 255, 255, 255);
        });
    }

    //切换装备事件(刷新已经调整进度条)
    ChangePropProgress() {
        if (this.node.activeInHierarchy) this.ShowWarehouse();
        this.propProgressNode.children.forEach((element: Node, index: number) => {
            let num = 0;
            if (SJZGMMT_GameData.Instance.PlayerData[index] != "无") {
                num = SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.PlayerData[index]).property;
            }
            tween(element.getChildByPath("底/进度条").getComponent(Sprite))
                .to(0.8, { fillRange: num / SJZGMMT_Constant.Maxproperty[index] }, { easing: "backOut" })
                .start();
        });
    }
}


