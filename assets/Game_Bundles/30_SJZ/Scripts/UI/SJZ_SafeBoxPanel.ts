import { _decorator, Component, Node, v3, Event, Label, UIOpacity, math, Color } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

const v3_0 = v3(0, 0, 0);

@ccclass('SJZ_SafeBoxPanel')
export class SJZ_SafeBoxPanel extends PanelBase {
    Panel: Node = null;
    SafeBox: Node = null;

    speed: number = 300;

    crossIndex: number = 0;
    passworld: string[] = ["6", "D", "F", "U", "P"];

    isStucked: boolean = false;
    stuck: number = 0.5;

    callback: Function = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.SafeBox = NodeUtil.GetNode("SafeBox", this.node);
    }

    Show(callback: Function) {
        SJZ_AudioManager.Instance.PlayBGM(SJZ_Audio.SafeBoxBG);

        this.callback = callback;
        super.Show(this.Panel);
        this.crossIndex = 0;
        this.isStucked = false;
        this.stuck = 0.5;
        this.SetCurCol();
    }

    lateUpdate(deltaTime: number) {
        for (let i = 0; i < this.SafeBox.children.length; i++) {
            let col = this.SafeBox.children[i];
            if (i <= this.crossIndex - 1) continue;
            if (this.isStucked && i == this.crossIndex) {
                this.stuck -= deltaTime;
                if (this.stuck <= 0) {
                    this.isStucked = false;
                    this.stuck = 0.5;
                }
                continue;
            }
            for (let j = 0; j < col.children.length; j++) {
                v3_0.set(col.children[j].position.x, col.children[j].position.y, 0);
                v3_0.y -= deltaTime * (this.speed + i * 20);
                if (v3_0.y <= -300) v3_0.y = v3_0.y + 600;
                col.children[j].setPosition(v3_0);
            }
        }

    }

    SetCurCol() {
        for (let i = 0; i < this.SafeBox.children.length; i++) {
            this.SafeBox.children[i].getComponent(UIOpacity).opacity = this.crossIndex == i ? 255 : 80;
        }
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "Button":
                let count = 0;

                const wrongFlink = () => {
                    SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.SafeBoxF);
                    this.scheduleOnce(() => {
                        let color: Color[] = [];

                        for (let i = 0; i < this.SafeBox.children[this.crossIndex].children.length; i++) {
                            color.push(this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color.clone());
                            this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color = Tools.GetColorFromHex("#FF5050");
                        }
                        this.scheduleOnce(() => {
                            for (let i = 0; i < this.SafeBox.children[this.crossIndex].children.length; i++) {
                                this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color = color[i];
                            }
                            count++;
                            if (count >= 2) {
                            } else {
                                wrongFlink();
                            }

                        }, 0.1);
                    }, 0.1);
                }

                const sucessFlink = () => {
                    SJZ_AudioManager.Instance.StopBGM();
                    this.scheduleOnce(() => {
                        for (let i = 0; i < this.SafeBox.children.length; i++) {
                            this.SafeBox.children[i].getComponent(UIOpacity).opacity = 80;
                        }
                        this.scheduleOnce(() => {
                            for (let i = 0; i < this.SafeBox.children.length; i++) {
                                this.SafeBox.children[i].getComponent(UIOpacity).opacity = 255;
                            }
                            count++;
                            if (count >= 5) {
                                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SafeBoxPanel);
                                this.callback && this.callback();
                            } else {
                                sucessFlink();
                            }

                        }, 0.1);
                    }, 0.1);
                }


                if (this.crossIndex == this.passworld.length) return;

                if (this.isStucked) return;
                let col = this.SafeBox.children[this.crossIndex];
                let result = col.children.find(e => Math.abs(e.position.y) < 35);
                if (result) {
                    if (result.getComponent(Label).string == this.passworld[this.crossIndex]) {
                        let gap = result.position.y;
                        for (let i = 0; i < col.children.length; i++) {
                            col.children[i].setPosition(v3(col.children[i].position.x, col.children[i].position.y - gap, 0));
                        }

                        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.SafeBoxT);
                        this.crossIndex = math.clamp(this.crossIndex + 1, 0, this.passworld.length);
                        this.SetCurCol();

                        if (this.crossIndex == this.passworld.length) {
                            sucessFlink();
                        }

                    } else {
                        this.isStucked = true;
                        wrongFlink();
                    }
                } else {
                    this.isStucked = true;
                    wrongFlink();
                }

                break;
        }
    }

}


