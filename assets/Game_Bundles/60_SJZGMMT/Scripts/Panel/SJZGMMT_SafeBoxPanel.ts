import { _decorator, Component, Node, v3, Event, Label, UIOpacity, math, Color } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_vessel } from '../SJZGMMT_vessel';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';

const { ccclass, property } = _decorator;

const v3_0 = v3(0, 0, 0);

@ccclass('SJZGMMT_SafeBoxPanel')
export class SJZGMMT_SafeBoxPanel extends PanelBase {
    Panel: Node = null;
    SafeBox: Node = null;

    speed: number = 300;

    crossIndex: number = 0;
    passworld: string[] = ["6", "D", "F", "U", "P"];

    isStucked: boolean = false;
    stuck: number = 0.5;

    callback: Function = null;

    private _color: Color[][] = [];
    protected onLoad(): void {
        this.Panel = this.node.getChildByName("Panel");
        this.SafeBox = this.node.getChildByPath("Panel/Mask/SafeBox");
        for (let i = 0; i < this.SafeBox.children.length; i++) {
            this._color.push([])
            for (let j = 0; j < this.SafeBox.children[i].children.length; j++) {
                this._color[i].push(this.SafeBox.children[i].children[j].getComponent(Label).color.clone());
            }
        }

    }

    Show(...args: any[]) {
        this.callback = args[0];
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
        for (let i = 0; i < this.SafeBox.children.length; i++) {
            for (let j = 0; j < this.SafeBox.children[i].children.length; j++) {
                this.SafeBox.children[i].children[j].getComponent(Label).color = this._color[i][j].clone();
            }
        }
    }

    OnButtonClick(event: Event) {

        switch (event.target.name) {
            case "Button":
                let count = 0;
                const wrongFlink = () => {
                    SJZGMMT_AudioManager.globalAudioPlay("SafeBoxF");
                    this.scheduleOnce(() => {
                        // let color: Color[] = [];

                        for (let i = 0; i < this.SafeBox.children[this.crossIndex].children.length; i++) {
                            // color.push(this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color.clone());
                            this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color = Tools.GetColorFromHex("#FF5050");
                        }
                        this.scheduleOnce(() => {
                            for (let i = 0; i < this.SafeBox.children[this.crossIndex].children.length; i++) {
                                this.SafeBox.children[this.crossIndex].children[i].getComponent(Label).color = this._color[this.crossIndex][i];
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
                    SJZGMMT_AudioManager.globalAudioPlay("SafeBoxT");
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
                                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SafeBoxPanel);
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
            case "Mask": this.Close(); SJZGMMT_AudioManager.globalAudioPlay("点击");
                break;
        }

    }

    //关闭
    Close() {
        SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SafeBoxPanel);
    }
}


