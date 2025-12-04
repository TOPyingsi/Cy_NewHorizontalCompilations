import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3, Component, math } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import Banner from 'db://assets/Scripts/Banner';
import { Bacon_Manager } from './Bacon_Manager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_Bar')
export default class Bacon_Bar extends Component {
    static Instance: Bacon_Bar = null;

    Panel: Node = null;
    Slider: Sprite = null;
    Label: Label = null;
    CountdownLb: Label = null;

    timer: number = 0;
    time: number = 0;
    dt: number = 100;//1000为一秒

    infiniteMode: boolean = false;

    protected onLoad(): void {
        Bacon_Bar.Instance = this;

        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Slider = NodeUtil.GetComponent("Slider", this.node, Sprite);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
        this.CountdownLb = NodeUtil.GetComponent("CountdownLb", this.node, Label);
        this.Slider.fillRange = 0;
        this.Refresh();
        this.StartCounter();

        if (Bacon_Manager.InfiniteTime > 0) this.StartInfiniteBacon();
    }

    Refresh() {
        this.Label.string = `${Bacon_Manager.Bacon}/${Bacon_Constant.MaxBaconCount}`
    }

    StartInfiniteBacon() {
        this.Label.string = `无限培根`;
        this.time = Bacon_Manager.InfiniteTime;
        this.infiniteMode = true;
        this.Slider.fillRange = 1;
    }

    StopInfiniteBacon() {
        this.Refresh();
        this.time = Bacon_Constant.AddBaconTime;
        this.infiniteMode = false;
    }

    StartCounter() {
        clearInterval(this.timer);
        this.time = Bacon_Constant.MaxBaconCount;
        this.timer = setInterval(this.Counter.bind(this), this.dt);
    }

    StopCounter() {
        clearInterval(this.timer);
    }

    Counter() {
        let time = this.infiniteMode ? Bacon_Manager.InfiniteTime : this.time;

        time = Tools.Clamp(time - this.dt / 1000, 0, Infinity);

        this.CountdownLb.string = `${Tools.FillWithZero(Math.floor(time / 60), 2)}:${Tools.FillWithZero(Math.floor(time % 60), 2)}`;

        if (this.infiniteMode) {
            Bacon_Manager.InfiniteTime -= this.dt / 1000;
        } else {
            this.time = time;
            this.Slider.fillRange = 1 - time / Bacon_Constant.AddBaconTime;
        }

        if (this.time <= 0 && !this.infiniteMode) {
            this.time = Bacon_Constant.AddBaconTime;
            Bacon_Manager.Bacon += 1;
        }
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);
        Banner.Instance.ShowVideoAd(() => {
            UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconGetPanel);
        });
    }

    protected onEnable(): void {
        EventManager.on(Bacon_Constant.Event_RefreshBacon, this.Refresh, this);
        EventManager.on(Bacon_Constant.Event_StartInfiniteBacon, this.StartInfiniteBacon, this);
        EventManager.on(Bacon_Constant.Event_StopInfiniteBacon, this.StopInfiniteBacon, this);
    }

    protected onDisable(): void {
        this.StopCounter();
        EventManager.off(Bacon_Constant.Event_RefreshBacon, this.Refresh, this);
        EventManager.off(Bacon_Constant.Event_StartInfiniteBacon, this.StartInfiniteBacon, this);
        EventManager.off(Bacon_Constant.Event_StopInfiniteBacon, this.StopInfiniteBacon, this);
    }
}


