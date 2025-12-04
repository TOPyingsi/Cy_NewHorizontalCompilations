import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, ScrollView } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_WorkbenchPanel')
export default class SJZ_WorkbenchPanel extends PanelBase {
    DescLabel: Label = null;
    Button_0: Node = null;
    Button_1: Node = null;
    Button_2: Node = null;
    Button_0_Label: Label = null;
    Button_1_Label: Label = null;
    Button_2_Label: Label = null;

    cb_0: Function = null;
    cb_1: Function = null;
    cb_2: Function = null;

    nowText: string = "";
    timer: number = 0;
    index: number = 0;

    protected onLoad(): void {
        this.Button_0 = NodeUtil.GetNode("Button_0", this.node);
        this.Button_0_Label = NodeUtil.GetComponent("Button_0_Label", this.node, Label);
        this.Button_1 = NodeUtil.GetNode("Button_1", this.node);
        this.Button_1_Label = NodeUtil.GetComponent("Button_1_Label", this.node, Label);
        this.Button_2 = NodeUtil.GetNode("Button_2", this.node);
        this.Button_2_Label = NodeUtil.GetComponent("Button_2_Label", this.node, Label);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
    }

    Show(desc: string, arg_0: any = null, arg_1: any = null, arg_2: any = null): void {
        this.cb_0 = null;
        this.cb_1 = null;
        this.cb_2 = null;

        this.Button_0.active = arg_0 != null;
        this.Button_1.active = arg_1 != null;
        this.Button_2.active = arg_2 != null;

        this.nowText = desc;
        this.DescLabel.string = "";

        if (arg_0 != null) {
            this.cb_0 = arg_0.cb;
            this.Button_0_Label.string = arg_0.text;
        };

        if (arg_1 != null) {
            this.cb_1 = arg_1.cb;
            this.Button_1_Label.string = arg_1.text;
        };

        if (arg_2 != null) {
            this.cb_2 = arg_2.cb;
            this.Button_2_Label.string = arg_2.text;
        };

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    protected update(dt: number): void {
        if (this.nowText && this.nowText.length > 0) {
            this.timer += dt;
            if (this.timer >= 0.08) {
                if (this.DescLabel.string.length < this.nowText.length) {
                    this.DescLabel.string = this.nowText.slice(0, this.DescLabel.string.length + 1);
                } else {
                    this.nowText = null;
                }

                this.timer = 0;
            }
        }
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);


        switch (event.target.name) {
            case "Button_0":
                this.cb_0 && this.cb_0();
                break;
            case "Button_1":
                this.cb_1 && this.cb_1();
                break;
            case "Button_2":
                this.cb_2 && this.cb_2();
                break;
        }
    }

    protected onEnable(): void {
    }
    protected onDisable(): void {
    }
}