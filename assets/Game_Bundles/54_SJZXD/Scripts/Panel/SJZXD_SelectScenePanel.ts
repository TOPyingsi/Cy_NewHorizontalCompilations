import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_PropBox } from '../SJZXD_PropBox';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZXD_SelectScenePanel')
export class SJZXD_SelectScenePanel extends PanelBase {
    public SelectGameScene: string = "荒野营地";//选中名字

    public SceneData: { Name: string, Prop: string[], Star: number }[] = [//专属大红
        { Name: "荒野营地", Prop: ["坦克模型", "唱片机", "纯金怀表"], Star: 1 },
        { Name: "沙漠遗迹", Prop: ["纯金战马雕像", "黄金电话", "黄金花瓶"], Star: 2 },
        { Name: "修狗小镇", Prop: ["黄金香炉", "黄金印章", "科技原石"], Star: 3 },
        { Name: "军事基地", Prop: ["碳纤维原石", "招财狗", "天圆地方"], Star: 4 },
        { Name: "实验室", Prop: ["鎏金三足鼎", "留声机", "黄金油灯"], Star: 5 },
    ];

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.OnSelectScene(this.SelectGameScene);
        this.IsUnlock();
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "荒野营地": this.OnSelectScene("荒野营地"); break;
            case "沙漠遗迹": this.OnSelectScene("沙漠遗迹"); break;
            case "修狗小镇": this.OnSelectScene("修狗小镇"); break;
            case "军事基地": this.OnSelectScene("军事基地"); break;
            case "实验室": this.OnSelectScene("实验室"); break;
            case "确定按钮": this.OnSelectClick(); break;
            case "返回": SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SelectScenePanel); break;
        }
    }


    OnSelectScene(Name: string) {
        this.SelectGameScene = Name;
        //刷新右边显示
        let nd = this.node.getChildByPath("框/关卡信息/掉落物");
        let data = this.SceneData.find(element => element.Name == Name);
        nd.children.forEach((element, index) => {
            element.getComponent(SJZXD_PropBox).Show(data.Prop[index], 1, true);
        });
        SJZXD_Incident.LoadSprite("Sprites/选关界面/关卡图/" + this.SelectGameScene).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/关卡信息/关卡图").getComponent(Sprite).spriteFrame = sp;
        })
        this.node.getChildByPath("框/选关Content").children.forEach((element) => {
            element.getChildByName("选中框").active = element.name == this.SelectGameScene;
        });
        this.node.getChildByPath("框/关卡信息/星级").children.forEach((element, index) => {
            element.getChildByName("亮").active = data.Star > index;
        });
    }

    //确定按下
    OnSelectClick() {
        if (SJZXD_GameData.Instance.UnlockScene.indexOf(this.SelectGameScene) == -1) {
            SJZXD_UIManager.Instance.ShowText("请先成功撤离前场景解锁该关卡!");
            return;
        }
        SJZXD_UIManager.Instance.ShowText("场景已切换!");
        SJZXD_GameManager.GameScene = this.SelectGameScene;
        director.getScene().emit(SJZXD_EventManager.主页_场景切换, this.SelectGameScene)
        SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SelectScenePanel);
    }

    //判断场景是否解锁
    public IsUnlock() {
        this.node.getChildByPath("框/选关Content").children.forEach((element) => {
            element.getChildByName("未解锁").active = SJZXD_GameData.Instance.UnlockScene.indexOf(element.name) == -1;
        });
    }
}


