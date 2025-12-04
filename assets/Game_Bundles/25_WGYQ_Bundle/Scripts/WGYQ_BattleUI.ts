import { _decorator, Animation, Component, director, Node, Prefab, Sprite, Vec3 } from 'cc';
import { WGYQ_UI } from './WGYQ_UI';
import { WGYQ_GameData } from './WGYQ_GameData';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { WGYQ_BattlePanel } from './WGYQ_BattlePanel';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_BattleUI')
export class WGYQ_BattleUI extends WGYQ_UI {

    private static instance: WGYQ_BattleUI;
    public static get Instance(): WGYQ_BattleUI {
        return this.instance;
    }

    @property(Animation)
    bgAni: Animation;

    tutorialTexts = [
        "这里是直播间！",
        "可以根据直播评论内容决定行为",
        "但是注意，过度使用花里胡哨的技能会导致狗受伤或死亡",
        "狂按左下角“训”进行训狗",
        "使用训狗可以降低狗的桀骜并降低它的速度",
        "火龙果会降低狗的血条，也会较大辐减少桀骜；窝心脚与火龙果效果相似，但会降低更多血条；放风筝在削血削桀骜的同时可以大幅击退狗，推荐狗要跑掉时使用",
        "尽量对狗好一点，它们毕竟是活物"
    ]

    protected onLoad(): void {
        super.onLoad();
        WGYQ_BattleUI.instance = this;
        let data = WGYQ_GameData.Instance.getNumberData("BattleTutorial");
        if (data == 0) this.Talk();
        else WGYQ_BattlePanel.Instance.BattleInit();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Talk(): void {
        if (this.talkNum < this.tutorialTexts.length) super.Talk();
        else {
            this.talkPanel.active = false;
            WGYQ_GameData.Instance.setNumberData("BattleTutorial", 1);
            WGYQ_BattlePanel.Instance.BattleInit();
        }
    }

    Init() {
        this.coinLabel.string = WGYQ_GameData.Instance.getNumberData("Coins").toString();
        let level = WGYQ_GameData.Instance.getNumberData("Level");
        this.levelLabel.string = "等级 " + level.toString();
        this.levelBar.fillRange = WGYQ_GameData.Instance.getNumberData("Experience") / (level * 100);
    }

    Reset() {
        UIManager.ShowPanel(Panel.LoadingPanel, director.getScene().name);
    }

    Back() {
        UIManager.ShowPanel(Panel.LoadingPanel, "WGYQ_Yard");
    }

}
