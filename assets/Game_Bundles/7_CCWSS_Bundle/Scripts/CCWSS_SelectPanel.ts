import { _decorator, Color, Component, Event, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, UIOpacity, v3, Vec3 } from 'cc';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_PeopleSelect } from './CCWSS_PeopleSelect';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

export enum SelectMode {
    StartSelect,//游戏开始前的选择
    LookSelect,//查看自己的选择
    AskSelect,//询问结束后的选择
    GuessSelect,//确定选择
}

@ccclass('CCWSS_SelectPanel')
export class CCWSS_SelectPanel extends Component {

    private static _instance: CCWSS_SelectPanel = null;
    public static get Instance(): CCWSS_SelectPanel {
        if (this._instance == null) {
            this._instance = new CCWSS_SelectPanel();
        }
        return this._instance;
    }

    selectMode: SelectMode = SelectMode.StartSelect;

    protected onLoad(): void {
        CCWSS_SelectPanel._instance = this;
        this.Init();
    }

    protected onEnable(): void {
        if (this.selectMode == SelectMode.AskSelect) {
            for (let i of this.node.getChildByName("Content").children) {
                if (CCWSS_Constant.PeopleTeZheng[i.getSiblingIndex()][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]]
                    != CCWSS_Constant.PeopleTeZheng[CCWSS_Constant.AISelectIndex][CCWSS_Constant.Question[0]][CCWSS_Constant.Question[1]]
                    && !i.getComponent(CCWSS_PeopleSelect).IsPass) {

                    i.getChildByName("selectTip").active = true;
                    i.getChildByName("touch").active = true;
                }
            }
        }
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }

    protected onDisable(): void {
        for (let i of this.node.getChildByName("Content").children) {
            i.getChildByName("select").active = false;
            i.getChildByName("touch").active = false;
        }
    }

    Init() {
        for (let i in CCWSS_Constant.PeopleNames) {
            BundleManager.GetBundle("7_CCWSS_Bundle").load("Prefabs/PeopleSelect", Prefab, (err, pre) => {
                if (err) console.log(err);
                instantiate(pre).setParent(this.node.getChildByName("Content"));
            })
        }
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "YesBtn":
                {
                    switch (this.selectMode) {
                        case SelectMode.StartSelect:
                            {
                                CCWSS_UIManager.Instance.MoveCameraToChair();
                                for (let i of this.node.getChildByName("Content").children) {
                                    tween(i.getChildByName("selectTip").getComponent(UIOpacity))
                                        .to(0.8, { opacity: 120 })
                                        .to(0.8, { opacity: 255 })
                                        .union()
                                        .repeatForever()
                                        .start();
                                    tween(i.getChildByName("touch"))
                                        .to(0.5, { scale: v3(0.8, 0.8) })
                                        .to(0.5, { scale: Vec3.ONE })
                                        .union()
                                        .repeatForever()
                                        .start();
                                }
                            }
                            break;
                        case SelectMode.LookSelect:
                            {
                                CCWSS_UIManager.Instance.SelectMePeopleCard();
                            }
                            break;
                        case SelectMode.GuessSelect:
                            {

                            }
                            break;
                        case SelectMode.AskSelect:
                            {
                                CCWSS_UIManager.Instance.SelectMePeopleCard();
                            }
                            break;
                    }
                    this.node.active = false;
                }
                break;
        }
    }
}


