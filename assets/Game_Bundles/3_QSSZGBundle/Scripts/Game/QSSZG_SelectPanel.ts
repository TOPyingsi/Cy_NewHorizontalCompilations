import { _decorator, Component, EventTouch, Layout, Node, tween, v3 } from 'cc';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_SelectPanel')
export class QSSZG_SelectPanel extends Component {
    private Types: string = "";
    Show(data: number[], Types: string) {
        this.Types = Types;
        if (Types == "鱼") {
            this.node.getChildByName("Other").getComponent(Layout).spacingX = 200;
        }
        if (Types == "装饰") {
            this.node.getChildByName("Other").getComponent(Layout).spacingX = 50;
        }
        this.node.getChildByName("Other").children.forEach((cd, index) => {
            if (data.indexOf(index) != -1) {
                if (QSSZG_GameData.Instance.aquariumLevel[index] >= 0) {
                    cd.active = true;
                }
                if (index != QSSZG_GameManager.Instance.aquariumID) {
                    cd.children[2].active = true;
                    cd.getChildByName("当前").active = false;
                } else {
                    cd.children[2].active = false;
                    cd.getChildByName("当前").active = true;
                }
            } else {
                cd.active = false;
            }
        });
        this.Windows_InorOut(true);
    }

    OnButtonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
                if (this.Types == "鱼") {
                    this.Fish_move(Number(btn.target.name));//转移鱼苗
                    this.Windows_InorOut(false);
                }
                if (this.Types == "装饰") {
                    this.Accessories_Move(Number(btn.target.name));//转移鱼苗
                    this.Windows_InorOut(false);
                }
                break;
            case "取消":
                this.Windows_InorOut(false);
                break;
        }
    }
    //鱼苗转移
    Fish_move(id: number) {
        if (QSSZG_GameManager.Instance.selectfish) {
            QSSZG_GameManager.Instance.selectfish.aquariumID = id;
            QSSZG_GameManager.Instance.LoadFish(QSSZG_GameManager.Instance.selectfish);
            QSSZG_GameManager.Instance.DeletFish();
        }
    }
    //装饰转移
    Accessories_Move(id: number) {
        if (QSSZG_GameManager.Instance.selectaccessories) {
            QSSZG_GameManager.Instance.selectaccessories.aquariumID = id;
            QSSZG_GameManager.Instance.Loadaccessories(QSSZG_GameManager.Instance.selectaccessories);
            QSSZG_GameManager.Instance.Deletaccessories();
        }
    }
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.getChildByName("Other").setPosition(0, -1200, 0);
            tween(this.node.getChildByName("Other"))
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node.getChildByName("Other"))
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.切换鱼缸选择界面);
                })
                .start();
        }
    }
}


