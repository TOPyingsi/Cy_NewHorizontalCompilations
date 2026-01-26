import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, UITransform, Widget, widgetManager } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_EnhanceBox } from '../SJZXD_EnhanceBox';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_GameData } from '../SJZXD_GameData';

const { ccclass, property } = _decorator;

@ccclass('SJZXD_EnhancePanel')
export class SJZXD_EnhancePanel extends PanelBase {
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
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.使用增强针, this.ShowText, this)
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ShowText();
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.EnhancePanel);
                break;


        }
    }
    //初始化所有针
    Init() {
        this.EnhanceBoxData.forEach((item, index) => {
            let node = instantiate(this.EnhanceBoxPre);
            node.setParent(this.Conten);
            node.getComponent(SJZXD_EnhanceBox).Show(item.Name, item.Price, item.spirteId, item.description);
        });
        console.log(this.EnhanceBoxData.length);

        this.Conten.getComponent(UITransform).width = this.EnhanceBoxData.length * 333 + 40;
        this.Conten.getComponent(Widget).left = 0;
    }

    //刷新显示
    ShowText() {
        this.node.getChildByPath("框/当前针").getComponent(Label).string = "当前使用镇强针：" + SJZXD_GameData.Instance.Enhance;

    }
}


