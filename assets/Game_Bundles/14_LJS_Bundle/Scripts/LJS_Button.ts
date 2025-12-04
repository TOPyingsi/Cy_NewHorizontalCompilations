import { _decorator, Component, director, EditBox, find, input, Label, Node } from 'cc';
import Banner from 'db://assets/Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { LJS_GameManager } from './LJS_GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('LJS_Button')
export class LJS_Button extends Component {
    public Tipschick: number = 1;
    public TipString: string = null;
    public TipOutput: string = null;
    protected onLoad(): void {
        if (Banner.IsShowServerBundle == false) {
            find("Canvas/更多游戏").active = false;
        }
        else {
            find("Canvas/更多游戏").active = true;
        }

    }
    EncyclopediaOpen() {
        find("Canvas/图鉴").active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "炼金术");
    }
    EncyclopediaClose() {

        find("Canvas/图鉴").active = false;
    }
    EncyclopediaGroupClose() {

        find("Canvas/分级图鉴").active = false;
        find("Canvas/图鉴").active = true;
    }
    EncyclopediaGroupOpen() {

        find("Canvas/分级图鉴").active = true;
        find("Canvas/图鉴").active = false;
    }
    Clear() {
        for (let i = 0; i < find("Canvas/BG/合成").children.length; i++) {
            find("Canvas/BG/合成").children[i].destroy();

        }
    }
    TipsOpen() {
        this.TipsChange();
    }
    TipsChange() {

        if (this.Tipschick == 0) {

            Banner.Instance.ShowVideoAd(() => {
                find("Canvas/提示11/视频角标").active = false;
                find("Canvas/提示11/角标3").active = true;
                this.Tipschick = 1;
            });

        }
        else if (this.Tipschick == 1) {
            ProjectEventManager.emit(ProjectEvent.弹出窗口, "炼金术");
            this.TipsStringChange();
            find("Canvas/提示/提示").getComponent(Label).string = this.TipString;
            find("Canvas/提示").active = true;
            find("Canvas/提示11/角标3").active = false;
            find("Canvas/提示11/角标2").active = true;
            this.Tipschick = 2;

        }
        else if (this.Tipschick == 2) {
            for (let i = 0; i < find("Canvas/工具栏/view/content").children.length; i++) {
                if (find("Canvas/工具栏/view/content").children[i].name == this.TipOutput) {
                    this.TipsStringChange();
                    find("Canvas/提示/提示").getComponent(Label).string = this.TipString;
                    this.Tipschick = 3;
                    find("Canvas/提示11/角标2").active = false;
                    find("Canvas/提示11/角标1").active = true;
                    break;
                }
                find("Canvas/提示").active = true;
            }
        }
        else if (this.Tipschick == 3) {
            for (let i = 0; i < find("Canvas/工具栏/view/content").children.length; i++) {
                if (find("Canvas/工具栏/view/content").children[i].name == this.TipOutput) {
                    this.TipsStringChange();
                    find("Canvas/提示/提示").getComponent(Label).string = this.TipString;
                    this.Tipschick = 0;
                    find("Canvas/提示11/角标1").active = false;
                    find("Canvas/提示11/视频角标").active = true;
                    break;
                }
                find("Canvas/提示").active = true;
            }
        }
    }



    TipsStringChange() {
        const recipes = LJS_GameManager.getRecipes();
        for (let i = 0; i < recipes.length - 1; i++) {
            let IsFind: boolean = false;
            const recipe = recipes[i];
            const output = recipe.output;
            const intput = recipe.inputs[0];
            const intput2 = recipe.inputs[1];
            for (let j = 0; j < find("Canvas/工具栏/view/content").children.length; j++) {
                {

                    if (find("Canvas/工具栏/view/content").children[j].name === output) {
                        // this.TipString = (intput + "+" + intput2 + "=" + output);
                        // console.log(this.TipString);
                        // this.TipOutput = output;
                        IsFind = true;
                        break;
                    }
                }
            }
            if (!IsFind) {
                this.TipString = (intput + "+" + intput2 + "=" + output);

                this.TipOutput = output;
                break;
            }
        }
    }
    TipsClose() {
        find("Canvas/提示").active = false;


    }
    SearchOPen() {
        find("Canvas/BG/搜索/EditBox").active = true;
    }
    SearchClose() {
        find("Canvas/BG/搜索/EditBox").getComponent(EditBox).string = "";
        find("Canvas/BG/搜索/EditBox").active = false;

    }
    GoHome() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, "Start", () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "炼金术");
            })
        })

    }
    MoreGame() {
        UIManager.ShowPanel(Panel.MoreGamePanel);
    }

}



