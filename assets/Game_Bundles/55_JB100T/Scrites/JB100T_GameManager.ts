import { _decorator, AssetManager, assetManager, Color, Component, director, Label, Node, RichText, Sprite, SpriteFrame, Texture2D } from 'cc';
import { JB100T_GameData } from './JB100T_GameData';
import { JB100T_DayData } from './JB100T_DayData';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('JB100T_GameManager')
export class JB100T_GameManager extends Component {

    @property(Node)
    private viewNode: Node;
    // Title Labels
    @property(Label)
    private titleHumanityValue: Label;
    @property(Label)
    private titleMaterialsValue: Label;
    @property(Label)
    private titleAmmunitionValue: Label;
    @property(Label)
    private titleHumanityValue_1: Label;
    @property(Label)
    private titleMaterialsValue_1: Label;
    @property(Label)
    private titleAmmunitionValue_1: Label;
    @property(Sprite)
    private viewImage: Sprite;
    @property(RichText)
    private viewTitle: RichText;
    @property(RichText)
    private viewLabel: RichText;

    @property(Node)
    private choose: Node;
    @property(Node)
    private clickText: Node;

    @property(RichText)
    private chooseA: RichText;
    @property(RichText)
    private chooseB: RichText;
    @property(RichText)
    private chooseC: RichText;
    @property(RichText)
    private chooseD: RichText;

    @property(Label)
    private gameSpeedText: Label;

    // 人性值|物资|弹药
    private humanity: number = 50;
    private materials: number = 0
    private ammunition: number = 0;

    private isHumanityFull = true;

    private currentDay: number = 0;
    private currentLevel: number = 0;
    private viewTextInterval: any = null;
    private currentViewTitleTextIndex: number = 0;
    private currentViewTextIndex: number = 0;
    private dayData: JB100T_DayData;
    private bundle: AssetManager.Bundle;

    // 道具
    private house: boolean = false;
    private dog: boolean = false;
    private truth: boolean = false;
    private first_aid: number = 0;
    private radio: boolean = false;
    private bady: boolean = false;
    private blk: boolean = false;
    private yfl: boolean = false;
    private yhbs: boolean = false;
    private hotelThreePeople: boolean = false;
    private shareMaterials: boolean = false;
    private survivorCamp: boolean = false;

    private gameSpeed: number = 1;

    private gameEnd = false;

    private loadingPath = null;

    start() {
        this.gameEnd = false;

        this.choose.active = false;
        this.clickText.active = false;
        this.titleHumanityValue_1.node.active = false;
        this.titleMaterialsValue_1.node.active = false;
        this.titleAmmunitionValue_1.node.active = false;

        this.chooseA.node.on(Node.EventType.TOUCH_END, () => this.clickChoose(0))
        this.chooseB.node.on(Node.EventType.TOUCH_END, () => this.clickChoose(1))
        this.chooseC.node.on(Node.EventType.TOUCH_END, () => this.clickChoose(2))
        this.chooseD.node.on(Node.EventType.TOUCH_END, () => this.clickChoose(3))

        /* assetManager.loadBundle('55_JB100T', (err, bundle) => {
            if (err) {
                console.log("加载Bundle失败")
                return;
            }
            this.bundle = bundle; */

        this.updateTitleValues();
        this.updateViewText();
        //})

        ProjectEventManager.emit(ProjectEvent.游戏开始, "惊变100天");
    }

    update(deltaTime: number) {

    }

    updateTitleValues() {
        this.titleHumanityValue.string = "人性值：" + this.humanity.toString();
        this.titleMaterialsValue.string = "物资：" + this.materials.toString();
        this.titleAmmunitionValue.string = "弹药：" + this.ammunition.toString();
    }

    // 更新剧情文本
    updateViewText() {
        this.currentViewTextIndex = 0;
        this.currentViewTitleTextIndex = 0;
        // 克隆对象
        if (this.gameEnd) {
            this.dayData = JB100T_DayData.clone(JB100T_GameData.daysData[JB100T_GameData.daysData.length - 1]);
        } else {
            this.dayData = JB100T_DayData.clone(JB100T_GameData.daysData[this.currentLevel]);
        }
        this.viewLabel.string = "";
        this.viewTitle.string = "";

        var img = this.dayData.img;
        if (img.startsWith("_")) {
            if (img.startsWith("_house")) {
                img = (this.house ? "1" : "0") + img
            } else if (img.startsWith("_dog")) {
                img = (this.dog ? "1" : "0") + img
            } else if (img.startsWith("_blk")) {
                img = (this.blk ? "1" : "0") + img
            } else if (img.startsWith("_yfl")) {
                img = (this.yfl ? "1" : "0") + img
            }
        }

        // 加载图片
        if (img !== "") BundleManager.LoadSpriteFrame("55_JB100T", "Sprites/" + img).then((sf: SpriteFrame) => {
            console.log(sf);
            this.viewImage.spriteFrame = sf;
        }).catch(() => {
            console.log("加载图片失败，图片路径：Sprites/" + img)
        })


        this.startInterval(50 / this.gameSpeed);
    }

    startInterval(time: number) {
        /* if (this.viewTextInterval) {
            clearInterval(this.viewTextInterval);
        } */
        this.unschedule(this.scheduleMethod)
        this.schedule(this.scheduleMethod, time / 1000);
    }

    private scheduleMethod() {
        if (this.currentViewTitleTextIndex > this.dayData.title.length) {
            this.viewLabel.string = "<outline color=black width=4>" + this.dayData.description.substring(0, this.currentViewTextIndex) + "</outline>";
            this.currentViewTextIndex++;

            // 所有字符显示完成后，清除定时器
            if (this.currentViewTextIndex > this.dayData.description.length) {
                //clearInterval(this.viewTextInterval);
                this.unschedule(this.scheduleMethod);
                this.viewTextInterval = null;

                // 根据道具/伙伴更新数值变化
                this.dataIncreaseAndDecrease();

                // 更新数值
                this.updateTitleValues();

                this.updateChooseTexts();

                if (this.dayData.hu != 0) {
                    this.viewLabel.string += (this.dayData.hu > 0 ? "<color=red> 人性值 +" : "<color=green> 人性值 ") + this.dayData.hu + " </color>";
                }
                if (this.dayData.ma != 0) {
                    this.viewLabel.string += (this.dayData.ma > 0 ? "<color=red> 物资 +" : "<color=green> 物资 ") + this.dayData.ma + " </color>";
                }
                if (this.dayData.am != 0) {
                    this.viewLabel.string += (this.dayData.am > 0 ? "<color=red> 弹药 +" : "<color=green> 弹药 ") + this.dayData.am + " </color>";
                }
            }
        } else {
            this.viewTitle.string = "<outline color=black width=4>" + this.dayData.title.substring(0, this.currentViewTitleTextIndex) + "</outline>";
            this.currentViewTitleTextIndex++;
        }
    }

    updateChooseTexts() {
        // 显示选择
        if (this.dayData.choices.length > 0 && !this.gameEnd) {
            this.choose.active = true;
            this.clickText.active = false;
            if (this.dayData.choices.length > 3) {
                this.chooseD.node.parent.active = true;
                this.chooseD.string = "<outline width=2 color=red>D:" + JB100T_GameData.daysData[this.dayData.choices[3]].title + "</color>";
            } else {
                this.chooseD.node.parent.active = false;
            }
            if (this.dayData.choices.length > 2) {
                this.chooseC.node.parent.active = true;
                this.chooseC.string = "<outline width=2 color=red>C:" + JB100T_GameData.daysData[this.dayData.choices[2]].title + "</color>";
            } else {
                this.chooseC.node.parent.active = false;
            }
            if (this.dayData.choices.length > 1) {
                this.chooseB.node.parent.active = true;
                this.chooseB.string = "<outline width=2 color=red>B:" + JB100T_GameData.daysData[this.dayData.choices[1]].title + "</color>";
            } else {
                this.chooseB.node.parent.active = false;
            }
            this.chooseA.string = "<outline width=2 color=red>A:" + JB100T_GameData.daysData[this.dayData.choices[0]].title + "</color>";
        } else {
            this.choose.active = false;
            this.clickText.active = true;
            this.viewNode.once(Node.EventType.TOUCH_END, () => {
                if (this.dayData.day > 100) {
                    director.loadScene("JB100T_Start");
                } else {
                    if (this.dayData.day === 100) {
                        this.gameEnd = true;
                        var str = "";
                        if (this.isHumanityFull) str += "守护者：坚守人性底线，未做任何残忍选择。\n";
                        if (this.bady) str += "人类火种：保护婴儿存活至最后，延续人类希望\n";
                        if (this.blk) str += "最佳队友: 与布莱克并肩作战\n";
                        if (!this.bady) str += "冷血无情：放弃救助婴儿，牺牲一切弱小，成为末世冷血生存者\n";
                        if (this.hotelThreePeople) str += "正义守护者：清除旅店店主等邪恶，维护末世正义\n";
                        if (!this.hotelThreePeople && this.humanity < 60) str += "伪善者：表面善良，实则自私，放弃他人生命\n";
                        if (this.house) str += "高墙独存：建立安全区，独自或与少量伙伴安稳生存\n";
                        if (this.shareMaterials) str += "共享富足：获取海量物资后与幸存者共享\n";
                        if (this.yhbs) str += "人类复兴：帮助研制血清，带领人类重建文明\n";
                        if (this.truth) str += "真相追寻者：优先探索真相，兼顾生存与人性，揭开末世秘密\n";
                        if (this.dog) str += "伙伴同行：与莱姆相互扶持，坚守伙伴情谊存活至最后\n";
                        if (this.yfl) str += "生死搭档：与伊芙琳并肩作战，在末世中相互依靠\n";
                        if (!this.bady && !this.yfl && !this.yhbs && !this.blk && !this.shareMaterials) str += "独夫：不择手段生存，牺牲所有他人，最终孤独终老\n";
                        JB100T_GameData.daysData[JB100T_GameData.daysData.length - 1].description = str;
                    } else if (this.gameEnd) {
                        JB100T_GameData.daysData[JB100T_GameData.daysData.length - 1].title = "生存失败";
                        var str = "你未能存活到最后\n获得词条：\n";
                        if (!this.bady && !this.yfl && !this.blk && !this.yhbs && !this.shareMaterials) str += "心狠手辣: 不择手段生存，牺牲所有他人。\n";
                        if (!this.bady) str += "冷血无情：放弃救助婴儿，牺牲一切弱小，成为末世冷血生存者。\n";
                        if (this.materials < 0) str += "饥寒交迫：你没有收集到充足的物资导致无法在末世生存。\n";
                        if (this.ammunition < 0) str += "感染者：由于没有充足的弹药，你在和丧尸的交战中被咬伤，从而感染。\n";

                        JB100T_GameData.daysData[JB100T_GameData.daysData.length - 1].description = str;
                    }
                    if (this.gameEnd) {
                        ProjectEventManager.emit(ProjectEvent.游戏结束, "惊变100天");
                    }
                    this.currentLevel = this.dayData.to;
                    this.clickText.active = false;
                    this.updateViewText();
                }
            });
        }
    }

    clickChoose(type: number) {
        if (type >= 0 && type < this.dayData.choices.length) {
            this.currentLevel = this.dayData.choices[type];
            if (this.currentLevel === 66 && !this.radio) {
                this.currentLevel = 67; //无收音机
            }
            this.choose.active = false;

            // 获取伙伴/道具
            switch (JB100T_GameData.daysData[this.dayData.choices[type]].title) {
                case "山中别墅": {
                    this.house = true;
                    break;
                }
                case "城郊的防空洞": {
                    this.house = false;
                    break;
                }
                case "带回庇护所救治": {
                    this.dog = true;
                    break;
                }
                case "我要调查真相": {
                    this.truth = true;
                    break;
                }
                case "购买一些药品": {
                    this.first_aid += 2;
                    break;
                }
                case "收听": {
                    this.radio = true;
                    break;
                }
                case "同意共享":
                case "掏枪自首": {
                    this.blk = true
                    break;
                }
                case "收养": {
                    this.bady = true;
                    break;
                }
                case "寻找幸存者营地": {
                    this.survivorCamp = true;
                    break;
                }
                case "邀请成为伙伴": {
                    this.yfl = true;
                    break;
                }
                case "挺身而出保护三人": {
                    this.hotelThreePeople = true;
                    break;
                }
                case "同意，给予20物资": {
                    this.shareMaterials = true;
                    break;
                }
                case "救约翰博士": {
                    this.yhbs = true;
                    break;
                }
            }

            this.updateViewText();
        }
    }

    dataIncreaseAndDecrease() {
        var iad = "";
        switch (this.dayData.title) {
            case "清理附近丧尸":
            case "外出探索物资":
            case "与其进行搏斗": {
                if (this.dog) {
                    this.dayData.am += 1;
                    iad += "，莱姆：弹药消耗减1";
                }
                break;
            }
            case "第五大道":
                if (this.dog) {
                    this.dayData.am += 3;
                    iad += "，莱姆：弹药消耗减3";
                }
                if (this.blk) {
                    this.dayData.ma += 40;
                    iad += "，布莱克：物资加40";
                }
                break;
            case "幼儿园":
                if (this.dog) {
                    this.dayData.am += 1;
                    iad += "，莱姆：弹药消耗1";
                }
                if (this.blk) {
                    this.dayData.ma += 20;
                    iad += "，布莱克：物资加20";
                }
                break;
            case "商业街": {
                if (this.dog) {
                    this.dayData.am += 2;
                    iad += "，莱姆：弹药消耗2";
                }
                if (this.blk) {
                    this.dayData.ma += 30;
                    iad += "，布莱克：物资加30";
                }
                break;
            }
            case "去超市探索物资": {
                if (this.blk) {
                    this.dayData.ma += 20;
                    iad += "，布莱克：物资加20";
                }
                break;
            }
            case "丧尸偏多的超市": {
                if (this.blk) {
                    this.dayData.ma += 30;
                    iad += "，布莱克：物资加30";
                }
                break;
            }
            case "物资兑换": {
                if (this.ammunition < 10) {
                    this.dayData.ma = 0;
                    this.dayData.am = 0;
                    this.viewLabel.string += "<color=red>弹药不足</color>";
                }
                break;
            }
            case "挺身而出保护三人": {
                if (this.yfl) {
                    this.dayData.ma += 30;
                    iad += "，伊芙琳：物资加30";
                }
                break;
            }
        }
        if (iad !== "") {
            this.viewLabel.string += "<color=#0fffff>额外加成(" + iad.substring(1) + ")</color>"
        }

        // 新的一天
        if (this.dayData.day > this.currentDay && !this.gameEnd && this.dayData.day < 100) {
            this.currentDay = this.dayData.day;
            this.dayData.ma -= 5;
            if (this.dayData.day >= 10) this.dayData.ma -= 15;
            if (this.dayData.day >= 50) this.dayData.ma -= 5;
            if (this.blk) this.dayData.ma -= 10;
            if (this.yfl) this.dayData.ma -= 10;
            if (this.bady) this.dayData.ma -= 5;

            if (this.dayData.day == 20 && this.survivorCamp) {
                this.dayData.choices.push(43)
            } else if (this.dayData.day == 30) {
                if (this.truth) {
                    this.dayData.choices.push(48);
                    this.dayData.choices.push(49);
                } else {
                    this.viewLabel.string += "你觉得真相并不重要，选择了继续休息。"
                }
            }
        }
        if (this.dayData.hu != 0) {
            if (this.dayData.hu < 0) {
                this.isHumanityFull = false;
            }
            this.humanity += this.dayData.hu;
            this.titleHumanityValue_1.node.active = true;
            this.titleHumanityValue_1.string = (this.dayData.hu > 0 ? "+" : "") + this.dayData.hu.toString();
            this.titleHumanityValue_1.color = this.dayData.hu > 0 ? new Color(255, 0, 0) : new Color(0, 255, 0);
            this.scheduleOnce(() => {
                this.titleHumanityValue_1.node.active = false;
            }, 1);
        }
        if (this.dayData.ma != 0) {
            if (this.dayData.ma > 0 && this.dayData.am < 0 && this.ammunition + this.dayData.am < 0) {

            } else {
                this.materials += this.dayData.ma;
                this.titleMaterialsValue_1.node.active = true;
                this.titleMaterialsValue_1.string = (this.dayData.ma > 0 ? "+" : "") + this.dayData.ma.toString();
                this.titleMaterialsValue_1.color = this.dayData.ma > 0 ? new Color(255, 0, 0) : new Color(0, 255, 0);
                this.scheduleOnce(() => {
                    this.titleMaterialsValue_1.node.active = false;
                }, 1);
            }
            if (this.materials < 0) {
                // 物资使用完 游戏失败 使用急救包
                if (this.first_aid > 0) {
                    this.materials = 0;
                    this.first_aid--;
                    this.viewLabel.string += "<color=#0fffff>物资不足已使用急救包，剩余(" + this.first_aid + ")。</color>"
                } else {
                    this.gameEnd = true;
                }
            }
        }
        if (this.dayData.am != 0) {
            if (this.dayData.am < 0 && this.ammunition + this.dayData.am < 0) {
                if (this.dayData.flee) {
                    // 逃离
                    this.viewLabel.string += "<color=#0fffff>弹药不足,已逃离。并且无法获得相关物资。</color>"
                    this.dayData.am = 0;
                    // 无法获得物资
                    this.dayData.ma = 0;
                } else {
                    // 游戏失败
                    if (this.first_aid > 0) {
                        this.dayData.am = 0;
                        this.first_aid--;
                        this.viewLabel.string += "<color=#0fffff>弹药不足已使用急救包，剩余(" + this.first_aid + ")。</color>"
                    } else {
                        this.gameEnd = true;
                    }
                }
            }
            if (this.dayData.am != 0) {
                this.ammunition += this.dayData.am;
                this.titleAmmunitionValue_1.node.active = true;
                this.titleAmmunitionValue_1.string = (this.dayData.am > 0 ? "+" : "") + this.dayData.am.toString();
                this.titleAmmunitionValue_1.color = this.dayData.am > 0 ? new Color(255, 0, 0) : new Color(0, 255, 0);
                this.scheduleOnce(() => {
                    this.titleAmmunitionValue_1.node.active = false;
                }, 1);
            }
        }
    }

    public chanageGameSpeed() {
        this.gameSpeed = this.gameSpeed === 1 ? 2 : this.gameSpeed === 2 ? 3 : 1;
        this.gameSpeedText.string = "X" + this.gameSpeed;
        this.startInterval(50 / this.gameSpeed);
    }

    onDestroy() {

    }

    returnStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "惊变100天");
            })
        });
    }
}


