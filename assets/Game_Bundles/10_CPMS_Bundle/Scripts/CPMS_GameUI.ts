import { _decorator, Animation, Button, Color, Component, director, Event, instantiate, Label, Node, Prefab, randomRangeInt, Sprite, Tween, tween, UIOpacity, v3, Vec3 } from 'cc';
import { CPMS_PoolManager } from './CPMS_PoolManager';
import { CPMS_Lotto } from './CPMS_Lotto';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { CPMS_Audio } from './CPMS_Audio';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('CPMS_GameUI')
export class CPMS_GameUI extends Component {

    private static instance: CPMS_GameUI;

    public static get Instance(): CPMS_GameUI {
        return this.instance;
    }

    @property(Animation)
    player: Animation;

    @property(Label)
    lottoTimesLabel: Label;

    @property(Label)
    restMoneyLabel: Label;

    @property(Label)
    changeLabel: Label;

    @property(Label)
    targetMoneyLabel: Label;

    @property(Node)
    lottos: Node;

    @property(Node)
    lottoBg: Node;

    @property(Node)
    buttons: Node;

    @property(Node)
    CheckButtons: Node;

    @property(Node)
    winPanel: Node;

    @property(Node)
    failPanel: Node;

    @property(Node)
    plans: Node;

    @property(Node)
    planButton: Node;

    @property(Node)
    toolChoose: Node;

    @property(Node)
    more: Node;

    @property(Label)
    timeLabel: Label;

    @property([Label])
    TalkLabels: Label[] = [];

    lotto: CPMS_Lotto;

    @property([Prefab])
    lottoPrefabs: Prefab[] = [];

    lottoNum: number;
    mostMoney: number = 100;
    getMoney = 0;
    multiply = 1;
    isFree = false;
    isFinish = false;
    isVideo = false;
    videoTime = 0;
    planCD = 2;
    lineWidth = 30;

    planCost = 0;
    planMul = 0;
    planDatas = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    muls = [3, 5, 10];
    lottoCosts = [5, 10, 20, 30, 50];

    private lottoTimes: number;

    public get LottoTimes(): number {
        return this.lottoTimes;
    }

    public set LottoTimes(value: number) {
        this.lottoTimes = value;
        this.lottoTimesLabel.string = this.lottoTimes.toString();
    }

    private restMoney: number;

    public get RestMoney(): number {
        return this.restMoney;
    }

    public set RestMoney(value: number) {
        var change = value - this.restMoney;
        this.changeLabel.string = (change > 0 ? "+" : "") + change.toString();
        change > 0 ? this.changeLabel.color = Color.YELLOW : this.changeLabel.color = Color.RED;
        this.changeLabel.node.active = true;
        var pos = this.changeLabel.node.getPosition();
        tween(this.changeLabel.node)
            .by(0.5, { position: v3(0, 100) })
            .call(() => {
                this.changeLabel.node.active = false;
                this.changeLabel.node.setPosition(pos);
            })
            .start();
        this.restMoney = value;
        if (this.restMoney > this.mostMoney) this.mostMoney = this.restMoney;
        this.restMoneyLabel.string = this.restMoney + "币";
        var numStr = (this.restMoney / 1000000 * 100).toString();
        if (numStr.split(".")[1]?.length > 4) numStr = (this.restMoney / 1000000 * 100).toFixed(4);
        this.targetMoneyLabel.string = "（进度：" + numStr + "%）";
    }

    private costedMoney = 0;


    public get CostedMoney(): number {
        return this.costedMoney;
    }

    public set CostedMoney(v: number) {
        this.costedMoney = v;
        if (this.costedMoney >= 100 && this.RestMoney != 0) {
            this.costedMoney = 0;
            this.IHaveAPlan();
        }
    }

    protected onLoad(): void {
        // if (Banner.getGG == "2") {
        // if (Banner.RegionMask)  UIManager.ShowPanel(Panel.TreasureBoxPanel);
        // }
        // if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
        CPMS_GameUI.instance = this;
        this.LottoTimes = 0;
        this.restMoney = 100;
        var numStr = (this.restMoney / 1000000 * 100).toString();
        if (numStr.split(".")[1].length > 4) numStr = (this.restMoney / 1000000 * 100).toFixed(4);
        this.targetMoneyLabel.string = "（进度：" + numStr + "%）";
        ProjectEventManager.emit(ProjectEvent.游戏开始, "彩票模式");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        // BundleManager_Main.GetBundle("CPMS_Bundle").loadDir("Prefabs", Prefab, (err, assets) => {
        //     if (err) return console.error(err);
        //     for (let h = 0; h < 10; h++) {
        //         for (let i = 0; i < assets.length; i++) {
        //             const element = assets[i];
        //             console.log(element.name);
        //             if (element.name == i.toString()) this.lottoPrefabs.push(element);
        //         }
        //     }
        // })

    }

    Init() {
        this.Talk(1, "选哪一张呢");
        this.scheduleOnce(() => {
            this.Talk(0, "先付钱才能刮奖哈~！");
        }, 1);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Back() {
        // if (Banner.IsShowServerBundle) UIManager.ShowPanel(Panel.MoreGamePanel, false);
        // else director.loadScene(GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "沙威玛传奇");
            })
        });
    }

    Talk(num: number, text: string) {
        var label = this.TalkLabels[num];
        if (label.node.parent.scale != Vec3.ZERO) Tween.stopAllByTarget(label.node.parent);
        label.node.parent.setScale(Vec3.ZERO);
        label.string = text;
        tween(label.node.parent)
            .to(0.25, { scale: num == 0 ? v3(-1, 1, 1) : Vec3.ONE })
            .delay(2.5)
            .to(0.25, { scale: Vec3.ZERO })
            .start();
    }

    ClickLotto(event: Event) {
        if (this.isFinish) return;
        this.lottoNum = this.lottos.children.indexOf(event.target);
        var lotto = CPMS_PoolManager.Instance.GetNode(this.lottoPrefabs[this.lottoNum], this.lottoBg);
        this.lotto = lotto.getComponent(CPMS_Lotto);
        lotto.setSiblingIndex(0);
        this.lottoBg.active = true;
        this.buttons.active = true;
        this.buttons.children[0].setPosition(v3(this.lottoNum == 6 ? 800 : 600, 200));
        this.buttons.children[1].setPosition(v3(this.lottoNum == 6 ? 800 : 600, -200));
        this.CheckButtons.children[0].setPosition(v3(this.lottoNum == 6 ? 800 : 600, 0));
        this.CheckButtons.children[1].setPosition(v3(this.lottoNum == 6 ? 800 : 600, 0));
        this.CheckButtons.children[0].active = false;
        this.CheckButtons.children[1].active = false;
    }

    BuyLotto() {
        if (this.RestMoney >= this.lotto.costMoney * this.multiply || this.isFree) {
            CPMS_Audio.Instance.PlayAudio(2);
            if (!this.isFree) this.RestMoney -= this.lotto.costMoney * this.multiply;
            this.buttons.active = false;
            this.lotto.Init();
            if (this.RestMoney <= 0) this.Talk(1, "上帝保佑！");
            this.PlanClose();
            this.LottoTimes++;
        }
        else if (this.RestMoney < this.lotto.costMoney * this.multiply) this.Talk(1, "币不够啊");
    }

    CancelLotto() {
        CPMS_PoolManager.Instance.PutNode(this.lotto.node);
        this.lotto = null;
        this.lottoBg.active = false;
        if (this.planCD == 0) this.Plan();
    }

    CheckLotto(money: number) {
        this.planButton.active = false;
        this.CheckButtons.children[0].active = money == 0;
        this.CheckButtons.children[1].active = money != 0;
        this.getMoney = money * this.multiply;
        if (this.RestMoney <= 0 && this.getMoney <= 0) this.Talk(1, "完了！");
        for (let i = 0; i < this.lottos.children.length; i++) {
            const element = this.lottos.children[i];
            element.getComponent(Button).interactable = true;
            element.children[0].getComponent(Sprite).color = Color.WHITE;
            if (element.children[0].children[0].getComponent(Sprite)) element.children[0].children[0].getComponent(Sprite).color = Color.WHITE;
        }
        this.multiply = 1;
        if (this.planCD > 0) this.planCD--;
    }
    WinLotto() {
        CPMS_Audio.Instance.PlayAudio(1);
        if (this.isFree) {
            this.getMoney -= this.lotto.costMoney;
            this.isFree = false;
        }
        this.RestMoney += this.getMoney;
        this.CostedMoney += this.lotto.costMoney;
        this.CancelLotto();
        if (this.RestMoney >= 1000000) {
            this.isFinish = true;
            this.Talk(1, "太好了！终于逆袭了！");
            this.scheduleOnce(() => {
                this.Talk(0, "纳尼！");
                this.scheduleOnce(() => {
                    this.Talk(0, "不玩了嘛？");
                    this.scheduleOnce(() => {
                        this.Talk(1, "不玩了！我要走了");
                        this.scheduleOnce(() => {
                            this.Talk(0, "这么就走了！真不玩了？");
                            this.scheduleOnce(() => {
                                this.Talk(1, "是啊！");
                                this.scheduleOnce(() => {
                                    this.player.play("Move");
                                    this.scheduleOnce(() => {
                                        this.Victory();
                                    }, 1);
                                }, 0.5);
                            }, 1);
                        }, 1);
                    }, 2);
                }, 1);
            }, 1);
        }
    }

    LoseLotto() {
        this.isFree = false;
        this.CostedMoney += this.lotto.costMoney;
        if (this.RestMoney == 0) {
            this.isFinish = true;
            this.Talk(1, "啊~~~~~~！");
            this.player.play("Die");
            this.scheduleOnce(() => {
                this.Fail();
            }, 1.5);
        }
        this.CancelLotto();
    }

    Victory() {
        // if (Banner.RegionMask) UIManager.ShowPanel(Panel.TreasureBoxPanel);
        // else Banner.Instance.ShowCustomAd();
        ProjectEventManager.emit(ProjectEvent.游戏结束, "彩票模式");
        this.winPanel.active = true;
        this.winPanel.children[3].getComponent(Label).string = "最高纪录：" + this.mostMoney + "币";
        tween(this.winPanel.getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .call(() => {
                tween(this.winPanel.children[2].getComponent(UIOpacity))
                    .to(0.5, { opacity: 255 })
                    .call(() => {
                        tween(this.winPanel.children[0].getComponent(UIOpacity))
                            .to(0.5, { opacity: 255 })
                            .call(() => {
                                tween(this.winPanel.children[3].getComponent(UIOpacity))
                                    .to(0.5, { opacity: 255 })
                                    .call(() => {
                                        this.winPanel.children[4].active = true;
                                    })
                                    .start();
                            })
                            .start();
                    })
                    .start();
            })
            .start();
    }

    Fail() {
        // if (Banner.RegionMask) UIManager.ShowPanel(Panel.TreasureBoxPanel);
        // else Banner.Instance.ShowCustomAd();
        ProjectEventManager.emit(ProjectEvent.游戏结束, "沙威玛传奇");
        this.failPanel.active = true;
        this.failPanel.children[2].getComponent(Label).string = "最高纪录：" + this.mostMoney + "币";
        tween(this.failPanel.getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .call(() => {
                tween(this.failPanel.children[0].getComponent(UIOpacity))
                    .to(0.5, { opacity: 255 })
                    .call(() => {
                        tween(this.failPanel.children[1].getComponent(UIOpacity))
                            .to(0.5, { opacity: 255 })
                            .call(() => {
                                tween(this.failPanel.children[2].getComponent(UIOpacity))
                                    .to(0.25, { opacity: 255 })
                                    .call(() => {
                                        this.failPanel.children[3].active = true;
                                    })
                                    .start();
                            })
                            .start();
                    })
                    .start();
            })
            .start();
    }

    Plan() {
        CPMS_Audio.Instance.PlayAudio(0);
        this.planCD = 2;
        this.planButton.active = true;
        for (let i = 0; i < this.plans.children[0].children.length; i++) {
            const element = this.plans.children[0].children[i].getComponent(Label);
            this.planDatas[i][0] = randomRangeInt(0, 2);
            this.planDatas[i][1] = this.lottoCosts[randomRangeInt(0, this.lottoCosts.length)];
            this.planDatas[i][2] = this.muls[randomRangeInt(0, this.muls.length)];
            this.planCost = this.planDatas[i][1];
            this.planMul = this.planDatas[i][2];
            let planStrs = [
                `以${this.planCost * this.planMul}币的价格兑换一张${this.planCost}币的刮刮乐，如果中奖，奖励翻${this.planMul}倍！`,
                `老板免费让你刮一张${this.planCost}币的刮刮乐，如果中奖要返还${this.planCost}币，多余的部分归你！`
            ]
            element.string = planStrs[this.planDatas[i][0]];
        }
    }

    IHaveAPlan() {
        this.plans.active = true;
        // if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "沙威玛传奇");
    }

    PlanClose() {
        this.plans.active = false;
    }

    BackBtnClick() {
        // UIManager.Instance.ShowPanel(Constant.Panel.MoreGamePanel, [true]);
        // director.loadScene(GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "沙威玛传奇");
            })
        });
    }

    UsePlan(event: Event) {
        var node = event.target as Node;
        var num = node.getSiblingIndex();
        var data = this.planDatas[num];
        if (data[0] == 0) {
            if (this.RestMoney > data[1] * data[2]) {
                for (let i = 0; i < this.lottos.children.length; i++) {
                    const element = this.lottos.children[i];
                    element.getComponent(Button).interactable = i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1;
                    element.children[0].getComponent(Sprite).color = !(i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1) ? Color.GRAY : Color.WHITE;
                    if (element.children[0].children[0].getComponent(Sprite)) element.children[0].children[0].getComponent(Sprite).color = !(i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1) ? Color.GRAY : Color.WHITE;
                }
                this.multiply = data[2];
                this.isFree = false;
                this.PlanClose();
            }
            else this.Talk(1, "币不够啊");
        }
        else {
            if (this.RestMoney > data[1]) {
                for (let i = 0; i < this.lottos.children.length; i++) {
                    const element = this.lottos.children[i];
                    element.getComponent(Button).interactable = i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1;
                    element.children[0].getComponent(Sprite).color = !(i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1) ? Color.GRAY : Color.WHITE;
                    if (element.children[0].children[0].getComponent(Sprite)) element.children[0].children[0].getComponent(Sprite).color = !(i == 2 * this.lottoCosts.indexOf(data[1]) || i == 2 * this.lottoCosts.indexOf(data[1]) + 1) ? Color.GRAY : Color.WHITE;
                }
                this.isFree = true;
                this.multiply = 1;
                this.PlanClose();
            }
            else this.Talk(1, "币不够啊");
        }
    }

    Video() {
        var x = CPMS_GameUI.Instance;
        if (x.isVideo) return;
        Banner.Instance.ShowVideoAd(() => {
            x.isVideo = true;
            x.videoTime = 60;
            x.timeLabel.node.active = true;
            x.timeLabel.string = "00:" + (x.videoTime < 10 ? "0" : "") + x.videoTime.toString();
            this.schedule(() => {
                x.videoTime--;
                x.timeLabel.string = "00:" + (x.videoTime < 10 ? "0" : "") + x.videoTime.toString();
                if (this.videoTime == 0) {
                    x.timeLabel.node.active = false;
                    x.isVideo = false;
                }
            }, 1, 59);
        })
    }

    UseTool(event: Event) {
        var node: Node = event.target;
        var num = node.getSiblingIndex();
        this.toolChoose.setPosition(v3(0, num == 0 ? 100 : num == 1 ? 0 : -100));
        this.lineWidth = num == 0 ? 30 : num == 1 ? 50 : 70;
        if (this.lotto) this.lotto.clearMask.LineWidth = this.lineWidth;
    }
}


