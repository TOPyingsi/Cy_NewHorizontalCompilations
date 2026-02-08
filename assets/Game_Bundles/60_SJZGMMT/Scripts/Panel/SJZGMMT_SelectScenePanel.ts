import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_PropBox } from '../SJZGMMT_PropBox';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SelectScenePanel')
export class SJZGMMT_SelectScenePanel extends PanelBase {
    public SelectGameScene: string = "锢灵青铜墟";//选中名字

    public SceneData: { Name: string, Prop: string[], Star: number }[] = [//专属大红
        { Name: "锢灵青铜墟", Prop: ["青铜鼎", "狗头铜首", "虎头铜首"], Star: 1 },
        { Name: "千机悬魂殿", Prop: ["猪头铜首", "龙头铜首", "猴头铜首"], Star: 2 },
        { Name: "渊龙沉骨陵", Prop: ["黄金香炉", "黄金印章", "三星铜鸟"], Star: 3 },
        { Name: "鬼哭矿髓渊", Prop: ["三星面具", "马头铜首", "牛头铜首"], Star: 4 },
        { Name: "阴阳逆煞墟", Prop: ["兔头铜首", "秦岭神树", "黄金油灯"], Star: 5 },
    ];

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.OnSelectScene(this.SelectGameScene);
        this.IsUnlock();
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "锢灵青铜墟": this.OnSelectScene("锢灵青铜墟"); break;
            case "千机悬魂殿": this.OnSelectScene("千机悬魂殿"); break;
            case "渊龙沉骨陵": this.OnSelectScene("渊龙沉骨陵"); break;
            case "鬼哭矿髓渊": this.OnSelectScene("鬼哭矿髓渊"); break;
            case "阴阳逆煞墟": this.OnSelectScene("阴阳逆煞墟"); break;
            case "确定按钮": this.OnSelectClick(); break;
            case "返回": SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SelectScenePanel); break;
        }
    }


    OnSelectScene(Name: string) {
        this.SelectGameScene = Name;
        //刷新右边显示
        let nd = this.node.getChildByPath("框/关卡信息/掉落物");
        let data = this.SceneData.find(element => element.Name == Name);
        nd.children.forEach((element, index) => {
            element.getComponent(SJZGMMT_PropBox).Show(data.Prop[index], 1, true);
        });
        SJZGMMT_Incident.LoadSprite("Sprites/选关界面/关卡图/" + this.SelectGameScene).then((sp: SpriteFrame) => {
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
        if (SJZGMMT_GameData.Instance.UnlockScene.indexOf(this.SelectGameScene) == -1) {
            SJZGMMT_UIManager.Instance.ShowText("请先成功撤离前场景解锁该关卡!");
            return;
        }
        SJZGMMT_UIManager.Instance.ShowText("场景已切换!");
        SJZGMMT_GameManager.GameScene = this.SelectGameScene;
        director.getScene().emit(SJZGMMT_EventManager.主页_场景切换, this.SelectGameScene)
        SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SelectScenePanel);
    }

    //判断场景是否解锁
    public IsUnlock() {
        this.node.getChildByPath("框/选关Content").children.forEach((element) => {
            element.getChildByName("未解锁").active = SJZGMMT_GameData.Instance.UnlockScene.indexOf(element.name) == -1;
        });
    }
}


