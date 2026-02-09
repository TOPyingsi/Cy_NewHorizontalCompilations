import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, UITransform, Widget, widgetManager } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_EnhanceBox } from '../SJZGMMT_EnhanceBox';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_EnhancePanel')
export class SJZGMMT_EnhancePanel extends PanelBase {
    @property(Node)
    public Conten: Node = null;
    @property(Prefab)
    public EnhanceBoxPre: Prefab = null;

    private EnhanceBoxData: { Name: string, Price: number, spirteId: number, description: string }[] = [
        { Name: "生命针", Price: 1000000, spirteId: 0, description: "使用后增加500生命值上限" },
        { Name: "防御针", Price: 1000000, spirteId: 1, description: "使用后增加50防御力" },
        { Name: "攻击针", Price: 2000000, spirteId: 2, description: "使用后增加50攻击力" },
        { Name: "爆率针", Price: 0, spirteId: 3, description: "使用后场景大红爆率提升5%" },
        { Name: "移速针", Price: 0, spirteId: 4, description: "使用后移速增加20%" }
    ]
    protected start(): void {
        this.Init();
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.使用增强针, this.ShowText, this)
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ShowText();
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.EnhancePanel);
                break;


        }
    }
    //初始化所有针
    Init() {
        this.EnhanceBoxData.forEach((item, index) => {
            let node = instantiate(this.EnhanceBoxPre);
            node.setParent(this.Conten);
            node.getComponent(SJZGMMT_EnhanceBox).Show(item.Name, item.Price, item.spirteId, item.description);
        });
        console.log(this.EnhanceBoxData.length);

        this.Conten.getComponent(UITransform).width = this.EnhanceBoxData.length * 333 + 40;
        this.Conten.getComponent(Widget).left = 0;
    }

    //刷新显示
    ShowText() {
        this.node.getChildByPath("框/当前针").getComponent(Label).string = "当前使用镇强针：" + SJZGMMT_GameData.Instance.Enhance;

    }
}


