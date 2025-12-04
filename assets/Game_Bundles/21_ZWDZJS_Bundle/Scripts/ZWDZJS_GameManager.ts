import { _decorator, Component, SpriteFrame, Prefab, Node, Label, AudioClip, Vec2, instantiate, v3, UITransform, Widget, tween, v2, director, Sprite, UIOpacity, Collider2D, AudioSource } from 'cc';
import ZWDZJS_GameDate from './ZWDZJS_GameDate';
import ZWDZJS_ZhiWuCao from './ZWDZJS_ZhiWuCao';
import ZWDZJS_ZhiWu from './植物/ZWDZJS_ZhiWu';
import ZWDZJS_JiangShi from './僵尸/ZWDZJS_JiangShi';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../Scripts/Banner';
import { ZWDZJS_Incident } from './ZWDZJS_Incident';
import ZWDZJS_ShengLiZiTiao from './ZWDZJS_ShengLiZiTiao';
import ZWDZJS_Bullet from './ZWDZJS_Bullet';
import ZWDZJS_Bulletpond from './ZWDZJS_Bulletpond';
import { PhysicsManager } from '../../../Scripts/Framework/Managers/PhysicsManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { ZWDZJS_SkillColumnMenu } from './ZWDZJS_SkillColumnMenu';
const { ccclass, property } = _decorator;
export enum ZWDZJS_Physics {
    植物层, //与僵尸碰撞
    僵尸层, //与植物子弹碰撞
    子弹层  //与僵尸碰撞
}

@ccclass('ZWDZJS_GameManager')
export default class ZWDZJS_GameManager extends Component {


    @property({ type: [Prefab] })
    ZiDanPre: Array<Prefab> = [];//子弹预制体
    @property({ type: [Prefab] })
    JiangShiPre: Array<Prefab> = [];//僵尸
    @property({ type: [Prefab] })
    OtherPre: Array<Prefab> = [];//其他预制体0.植物槽1.旗帜2.植物卡片
    @property(Node)//草场
    CaoChang: Node;
    @property(Node)//UI层次
    UI: Node;
    @property(Label)//剩余阳光文本
    YanGuanText: Label;
    @property(Node)//草场左上角标
    ZuoShangJiaoBiao: Node;
    @property(Node)//植物栏
    ZhiWuLan: Node;
    @property(Node)//进度条
    JinDuTiao: Node;
    @property({ type: [AudioClip] })
    AudioClips: Array<AudioClip> = [];//音效


    private static _instance: ZWDZJS_GameManager = null;
    public static get Instance(): ZWDZJS_GameManager {
        if (!this._instance) {
            this._instance = new ZWDZJS_GameManager();
        }
        return this._instance;
    }
    public static GameMode: string = "Q版";//星空版,Q版

    public ChaoChangZhuanTai: number[][] = [];//草场上的植物状态
    public JiangShiZhuanTai: number[] = [0, 0, 0, 0, 0];//每一行存在多少只僵尸
    public JuLiZhuanTai: number[] = [0, 0, 0, 0, 0];//每一行有多少只僵尸进入攻击检测
    public JiangShiArray: Node[][] = [[], [], [], [], []];//存在的僵尸管理集合
    public ZhiWuArray: Node[][] = [[], [], [], [], []];//存在的植物管理集合
    public Dates: number[] = [50, 0, 30];//0-阳光1.是否自动拾取阳光2.第一只僵尸到达剩余时间
    public static Scence: number = 0;//当前关卡
    public JinDu: number = 0;//关卡波数
    private JiangShiShuLiang_Max: number = 0;//当前关卡总僵尸数量
    private JiangShiShuLiang_current: number = 0;//当前关卡总僵尸数量

    public SkillColumnMenu: ZWDZJS_SkillColumnMenu = null;
    private JinDuDaTe: number[] = [0, 0, 0, 0];//关于进度的数据(0游戏波数，1当前波束敌人数量2当前波数死亡敌人数量3.旗帜之间距离)
    onLoad() {
        ZWDZJS_GameManager._instance = this;

        // cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "植物大战僵尸");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UI.getChildByName("更多游戏"));
        this.Init();
    }
    //    //初始化数据
    Init() {
        for (let i = 0; i < 5; i++) {
            this.ChaoChangZhuanTai.push([-1, -1, -1, -1, -1, -1, -1, -1, -1]);
        }
        this.Login_wave(0);
        for (let i = 0; i < ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence].length; i++) {
            for (let j = 0; j < ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][i].length; j++) {
                this.JiangShiShuLiang_Max += ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][i][j][1];
            }
        }
        this.JiangShiShuLiang_current = this.JiangShiShuLiang_Max
        console.log("当前关卡一共有僵尸" + this.JiangShiShuLiang_Max + "只");
        this.JinDuDaTe[0] = ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence].length;
        console.log("当前关卡一共有" + this.JinDuDaTe[0] + "波敌人");
        //生成旗帜
        this.JinDuDaTe[3] = 382 / (this.JinDuDaTe[0] - 1);
        for (let i = 1; i < this.JinDuDaTe[0]; i++) {
            let pre = instantiate(this.OtherPre[1]);
            ZWDZJS_Incident.LoadSprite("Sprite/旗帜/" + ZWDZJS_GameManager.GameMode).then((sp: SpriteFrame) => {
                pre.getComponent(Sprite).spriteFrame = sp;
            })
            pre.setParent(this.JinDuTiao.getChildByName("旗帜"));
            pre.setPosition(v3(0 - this.JinDuDaTe[3] * i, 20));
        }

        this.SunShine_Dropping();
        let ZhiWuCaoNumber: number = 0;
        for (let i = 0; i < ZWDZJS_GameDate.JieSuo.length; i++) {
            if (ZWDZJS_GameDate.JieSuo[i] == 1) {
                ZhiWuCaoNumber++;
                this.ZhiWuCai_PuSh(i);
            }
        }
        //初始CD清空
        for (let pre of this.ZhiWuLan.children) {
            pre.getComponent(ZWDZJS_ZhiWuCao).cd = -1;
        }
        this.ZhiWuCao_Show(ZhiWuCaoNumber);
        this.scheduleOnce(() => {
            this.hint(4, 1, () => {
                this.hint(5, 1, () => {
                    this.hint(6, 2, null)
                })
            })
        }, 1)
        this.Changge_YanGuang(0);

        //倒计时
        this.schedule(this.SubOnceTime, 1);
        if (ZWDZJS_GameManager.Scence == ZWDZJS_GameDate.GuanQia_JieSuo.length - 1) {//最后一关
            this.UI.getChildByName("广告").getChildByName("解锁所有植物").active = false;//没有此激励
        }

        //判断是否开启技能栏
        if (ZWDZJS_GameDate.GetIsCanSkii()) {
            ZWDZJS_Incident.Loadprefab("PreFab/技能豆子栏").then((pre: Prefab) => {
                let nd = instantiate(pre);
                this.SkillColumnMenu = nd.getComponent(ZWDZJS_SkillColumnMenu);
                nd.setParent(this.UI);
                nd.setSiblingIndex(0);
            })
        }


    }
    update(dt: number) {
        this.JiSuanMeiHan();


    }
    //    //调整植物槽宽度
    ZhiWuCao_Show(num: number) {
        this.UI.getChildByName("植物栏").getComponent(UITransform).width = 250 + num * 141;
        this.UI.getChildByName("植物栏").getComponent(Widget).left = 0;
        this.UI.getChildByName("铲子").getComponent(Widget).left = 250 + num * 141;
        this.UI.getChildByName("植物栏").getComponent(Widget).enabled = false;
        this.UI.getChildByName("植物栏").getComponent(Widget).enabled = true;
        this.UI.getChildByName("铲子").getComponent(Widget).enabled = false;
        this.UI.getChildByName("铲子").getComponent(Widget).enabled = true;
        this.Changge_YanGuang(0);
    }
    //    //播放音效
    PlayAudio(id: number, callback?: Function) {
        this.node.getComponent(AudioSource).playOneShot(this.AudioClips[id]);
    }
    //    //开始波数
    Login_wave(index: number) {
        if (index == ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence].length - 1) {//最后一波
            this.hint(1, 2.5, () => {
                this.hint(2, 2.5, null);
            });
        } else if (index != 0) {//普通波次
            this.hint(1, 2.5, null);
        } else {//第一波

        }
        this.JinDuDaTe[2] = 0;
        this.JinDuDaTe[1] = 0;
        for (let j = 0; j < ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index].length; j++) {
            this.JinDuDaTe[1] += ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][j][1];
        }
        console.log("当前波数敌人数量为" + this.JinDuDaTe[1]);
        //循环每一小波
        for (let i = 0; i < ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index].length; i++) {
            let QuanZhon: number[] = [20, 20, 20, 20, 20];//五条线的权重
            //循环每个僵尸
            for (let j = 0; j < ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][i][1]; j++) {
                let RandonNums: number = Math.floor(Math.random() * 100);//0-99随机数
                let Lin: number = 0;//行权重
                for (let k = 0; k < 5; k++) {
                    Lin += QuanZhon[k];
                    if (Lin > RandonNums) {//当前行权重大于僵尸权重，产生僵尸
                        let Y: number = ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][i][3] - ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][i][2];
                        Y = Math.random() * Y;
                        Y += ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][i][2];//计算出随机Y
                        this.Call_JiangShi(k, ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence][index][i][0], 1000 + Y);//生成僵尸
                        for (let o = 0; o < 5; o++) {//重新分配权重
                            if (o != k) {
                                QuanZhon[o] += 5;
                            } else {
                                QuanZhon[o] -= 20;
                            }
                        }
                        break;
                    }
                }

            }

        }
    }
    //    //返回场上僵尸数量
    GetJiangShiNumber(): number {
        let Num: number = 0;
        for (let i = 0; i < 5; i++) {
            Num += this.JiangShiZhuanTai[i];
        }
        return Num;
    }
    //    //扣除第一只僵尸倒计时
    SubOnceTime() {
        this.Dates[2]--;
        const name = ZWDZJS_GameDate.TimeText.find((dt) => { return dt.Mode == ZWDZJS_GameManager.GameMode }).Text;
        this.UI.getChildByName("时钟").getComponentInChildren(Label).string = "第一个" + name + "还有" + this.Dates[2] + "秒到达";
        if (this.Dates[2] < 0) {
            this.UI.getChildByName("时钟").active = false;
            // cc.audioEngine.playEffect(this.AudioClips[11], false); //音效
            this.unschedule(this.SubOnceTime);
        }
    }
    //    //计算进入攻击状态的行
    JiSuanMeiHan() {
        this.JuLiZhuanTai = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < this.JiangShiArray[i].length; j++) {
                if (this.JiangShiArray[i][j].position.x < 800) {
                    this.JuLiZhuanTai[i] = 1;
                }
            }
        }
    }
    //    //修改阳光
    Changge_YanGuang(num: number) {
        this.Dates[0] += num;
        this.YanGuanText.string = "" + this.Dates[0];

        //遍历植物栏遮罩
        for (let pre of this.ZhiWuLan.children) {
            if (ZWDZJS_GameDate.ZhiWu_price[pre.getComponent(ZWDZJS_ZhiWuCao).Id] <= this.Dates[0]) {
                pre.getChildByName("阳光遮罩").active = false;
            } else {
                pre.getChildByName("阳光遮罩").active = true;
            }
        }
    }
    //    //天空阳光掉落
    SunShine_Dropping() {
        tween(this.node)
            .delay(11)
            .call(() => {
                let pre = ZWDZJS_Bulletpond.Instance.Getbullet(1);
                pre.getComponent(UIOpacity).opacity = 255;
                let x = 300 + Math.random() * 1800;
                pre.getComponent(ZWDZJS_Bullet).Init();//设置运动状态
                pre.setWorldPosition(v3(x, 1080));
                pre.getComponent(ZWDZJS_Bullet).Tweens = tween(pre)
                    .call(() => { if (ZWDZJS_GameManager.Instance.Dates[1] == 1) pre.getComponent(ZWDZJS_Bullet).YanGuanOnClick(); })//自动拾取
                    .by(8, { position: v3(0, -1000) })
                    .call(() => {
                        pre.getComponent(ZWDZJS_Bullet).scheduleOnce(pre.getComponent(ZWDZJS_Bullet).YanGuan_RuoYingRuoXian, 3);
                        pre.getComponent(ZWDZJS_Bullet).scheduleOnce(pre.getComponent(ZWDZJS_Bullet).YanGuan_Die, 5)
                    })
                    .start();
                pre.getComponent(ZWDZJS_Bullet).Init();//子弹的初始化
            })
            .union()
            .repeatForever()
            .start();
    }
    //    //生成植物
    Loding_ZhiWu(Id: number, Pos: Vec2) {
        ZWDZJS_Incident.Loadprefab("PreFab/植物/" + ZWDZJS_GameDate.GetNameById(Id)).then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.CaoChang.getChildByName("植物与僵尸"));
            nd.getComponent(ZWDZJS_ZhiWu).InLine = Pos.x;//设置第几行
            nd.setSiblingIndex(Pos.x * 1000 + Pos.y);
            this.ZhiWuArray[Pos.x][Pos.y] = nd;
            nd.setWorldPosition(this.ZuoShangJiaoBiao.getWorldPosition().clone().add(v3((Pos.y + 0.5) * ZWDZJS_ZhiWuCao.WHITH, -(Pos.x + 0.5) * ZWDZJS_ZhiWuCao.WHITH)));

            this.ChaoChangZhuanTai[Pos.x][Pos.y] = Id;
        });

    }
    //通过坐标获得实际位置坐标
    GetGroundPos(v2: Vec2) {
        return this.ZuoShangJiaoBiao.getWorldPosition().clone().add(v3((v2.y + 0.5) * ZWDZJS_ZhiWuCao.WHITH, -(v2.x + 0.5) * ZWDZJS_ZhiWuCao.WHITH));
    }


    //    //生成僵尸
    Call_JiangShi(Line: number, Id: number, Y: number = 1000) {
        console.log("生成僵尸");
        ZWDZJS_Incident.Loadprefab("PreFab/僵尸/" + ZWDZJS_GameDate.GetZombieNameById(Id)).then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.CaoChang.getChildByName("植物与僵尸"));
            nd.setSiblingIndex(1000 * Line + 500 + this.JiangShiZhuanTai[Line]);
            nd.position = v3(Y, 260 - (Line * 160));
            this.JiangShiArray[Line].push(nd);
            this.JiangShiZhuanTai[Line]++;
        });

    }
    //    //销毁植物
    Delet_ZhiWu(Pre: Node) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j <= 9; j++) {
                if (this.ZhiWuArray[i][j] == Pre) {
                    this.ZhiWuArray[i][j] = undefined;
                    this.ChaoChangZhuanTai[i][j] = -1;
                    Pre.active = false;
                    this.scheduleOnce(() => {
                        Pre.destroy();
                    })
                    console.log(this.ZhiWuArray);
                    console.log(this.ChaoChangZhuanTai);
                }
            }
        }

    }
    //    //销毁僵尸
    Delet_JiangShi(Pre: Node) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < this.JiangShiArray[i].length; j++) {
                if (this.JiangShiArray[i][j] == Pre) {
                    this.JiangShiArray[i].splice(j, 1);
                    this.JinDuDaTe[2]++;
                    this.JiangShiZhuanTai[i]--;
                    this.JiangShiShuLiang_current--;
                    this.progress_Bar_Up();
                    if (this.GetJiangShiNumber() == 0) {//场上没有僵尸
                        this.JinDu++;
                        if (this.JinDu >= ZWDZJS_GameDate.GuanQia_Date[ZWDZJS_GameManager.Scence].length) {
                            this.Winner(v2(Pre.getWorldPosition().x, Pre.getWorldPosition().y));
                        } else {
                            this.Login_wave(this.JinDu);
                        }
                    }
                    Pre.getComponent(Collider2D).enabled = false;
                    this.scheduleOnce(() => {
                        Pre.destroy();
                    })
                    // for (let c = 0; c < 5; c++) {
                    //     console.log("当前第" + c + "行僵尸有" + this.JiangShiZhuanTai[c] + "个");
                    // }
                }
            }
        }
    }
    //    //胜利事件（参数是最后一只僵尸的位置）
    Winner(pos: Vec2) {
        if (ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence] != -999) {
            this.GenerateCard(pos);
        } else {
            this.UI.getChildByName("胜利纸条").active = true;
            this.UI.getChildByName("胜利纸条").getComponent(ZWDZJS_ShengLiZiTiao).Look();
        }
    }
    //    //进度条增加
    progress_Bar_Up() {
        if (this.JinDu < this.JinDuDaTe[0] - 1) {
            this.JinDuTiao.getChildByName("顶图").getComponent(Sprite).fillRange -= (1 / (this.JinDuDaTe[0] - 1)) / this.JinDuDaTe[1];
            this.JinDuTiao.getChildByName("僵尸头").position.add(v3((382 / (this.JinDuDaTe[0] - 1)) / this.JinDuDaTe[1], 0, 0));
        } else {//最后一波不加进度

        }
        if (this.JinDuDaTe[1] == this.JinDuDaTe[2]) {//当前波束结束
            let nd = this.JinDuTiao.getChildByName("旗帜").children[this.JinDu];
            if (nd) {
                tween(nd)
                    .to(0.8, { position: v3(nd.position.x, 50, 0) })
                    .start();
            }
        }
    }
    //    //插入植物槽
    ZhiWuCai_PuSh(id: number) {
        let pre = instantiate(this.OtherPre[0]);
        pre.setParent(this.ZhiWuLan);
        pre.getComponent(ZWDZJS_ZhiWuCao).Id = id;
        pre.getComponent(ZWDZJS_ZhiWuCao).Cd = ZWDZJS_GameDate.ZhiWu_Cd[id];
        pre.getComponent(ZWDZJS_ZhiWuCao).cd = ZWDZJS_GameDate.ZhiWu_Cd[id];
        ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + ZWDZJS_GameDate.GetNameById(id)).then((sp: SpriteFrame) => {
            pre.getChildByName("小图").getComponent(Sprite).spriteFrame = sp;
        });

        pre.getChildByName("价格Text").getComponent(Label).string = "" + ZWDZJS_GameDate.ZhiWu_price[id];
        if (ZWDZJS_GameDate.IsTiphint[id] == 0) {
            ZWDZJS_GameDate.IsTiphint[id] = 1;
            ZWDZJS_GameDate.TipPool.push(id);
            this.open_ZhiWuTip();
        }
    }
    //    //僵尸移速为0
    JianShiPause() {
        for (let pre of this.JiangShiArray) {
            for (let pre2 of pre) {
                pre2.getComponent(ZWDZJS_JiangShi).Stop();
            }
        }
    }
    CeShi() {
        let RandonNums: number = Math.floor(Math.random() * 5);//0-4随机数
        let RandonNums2: number = Math.floor(Math.random() * 1100);//0-1099随机数
        let RandonNums3: number = Math.floor(Math.random() * 4);//0--1随机数
        this.Call_JiangShi(RandonNums, RandonNums3, RandonNums2);
    }
    CeShi2() {
        for (let pre of this.ZhiWuLan.children) {
            pre.getComponent(ZWDZJS_ZhiWuCao).cd = -1;
            pre.getComponent(ZWDZJS_ZhiWuCao).Cd = 0.01;
        }

        this.Changge_YanGuang(99999999);
        console.log(this.ZhiWuArray);
        console.log(this.ChaoChangZhuanTai);
    }
    CeShi3() {
        for (let pre of this.JiangShiArray) {
            for (let pre2 of pre) {
                pre2.getComponent(ZWDZJS_JiangShi).slowdown(20, 9999);
            }
        }
    }
    //回满金铲子
    SkillMax() {
        this.SkillColumnMenu.Add_SkiiBeans(3);
    }
    //直接获胜
    WinClick() {
        this.Winner(v2(500, 500));
    }
    ZhiWU_ShanHaiX100() {
        for (let pres of this.ZhiWuArray) {
            for (let pre of pres) {
                if (pre)
                    pre.getComponent(ZWDZJS_ZhiWu).attack = 9999;
            }
        }
    }
    //    //文字提示
    hint(id: number, time: number, call: Function) {
        console.log("弹出文字提示");

        if (id == 1 || id == 2 || id == 4 || id == 5 || id == 6) {//一大波僵尸在靠近
            let pre = null;
            if (id == 1) {
                pre = this.UI.getChildByName("文字提示层").getChildByName("一大波");
            }
            if (id == 2) {
                pre = this.UI.getChildByName("文字提示层").getChildByName("最后一波");
            }
            if (id == 4) {
                pre = this.UI.getChildByName("文字提示层").getChildByName("准备…");
            }
            if (id == 5) {
                pre = this.UI.getChildByName("文字提示层").getChildByName("安放…");
            }
            if (id == 6) {
                pre = this.UI.getChildByName("文字提示层").getChildByName("植物！");
            }
            pre.scale = v3(2, 2, 1);
            pre.active = true;
            this.PlayAudio(12);
            tween(pre)
                .to(0.4, { scale: v3(1, 1, 1) })
                .start();
            this.scheduleOnce(() => {
                pre.active = false;
                if (call) call();
            }, time)
        }
        if (id == 3) {//僵尸吃了你的脑子--失败
            this.UI.getChildByName("文字提示层").getChildByName("Bg").active = true;
            let pre = this.UI.getChildByName("文字提示层").getChildByName("僵尸吃掉了你的脑子");
            pre.setScale(v3(0, 0, 0));
            pre.active = true;
            this.PlayAudio(13);
            tween(pre)
                .to(1.5, { scale: v3(1, 1, 1) })
                .start();
            ProjectEventManager.emit(ProjectEvent.游戏结束, "植物大战僵尸");
            this.scheduleOnce(() => {
                this.ReStar();
            }, 3)
        }
    }
    //    //生成植物卡片--胜利
    GenerateCard(pos: Vec2) {
        console.log("生成卡片");
        let pre: Node = instantiate(this.OtherPre[2]);
        ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + ZWDZJS_GameDate.GetNameById(ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence])).then((sp: SpriteFrame) => {
            pre.getChildByName("卡片").getChildByName("卡片内容").getComponent(Sprite).spriteFrame = sp;
        });
        pre.getChildByName("卡片").getChildByName("价格Text").getComponent(Label).string = "" + ZWDZJS_GameDate.ZhiWu_price[ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence]];
        pre.setParent(this.UI.getChildByName("文字提示层"));
        pre.setWorldPosition(v3(pos.x, pos.y, 0));
        tween(pre)
            .by(0.3, { position: v3(-50, 80) }, { easing: "quadOut" })
            .by(0.3, { position: v3(0, -80) }, { easing: "quadInOut" })
            .start();
    }
    //    //新植物提示
    open_ZhiWuTip() {
        if (ZWDZJS_GameDate.TipPool.length > 0 && this.UI.getChildByName("新植物提示界面").getChildByName("提示框").active == false) {
            let id = ZWDZJS_GameDate.TipPool.pop();
            let pre = this.UI.getChildByName("新植物提示界面").getChildByName("提示框");
            ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + ZWDZJS_GameDate.GetNameById(id)).then((sp: SpriteFrame) => {
                pre.getChildByName("图片").getComponent(Sprite).spriteFrame = sp;
            });
            pre.getChildByName("描述文本").getComponent(Label).string = ZWDZJS_GameDate.GetTextById[id];
            pre.active = true;
            pre.scale = v3(0, 0, 0);
            tween(pre)
                .to(0.3, { scale: v3(1, 1, 1) }, { easing: "backOut" })
                .call(() => { this.PauseGame(); })
                .start();
        } else {
            return;
        }
    }
    //    //关闭植物提示
    Exit_ZhiWuTip() {
        this.ContinueGame();
        let pre = this.UI.getChildByName("新植物提示界面").getChildByName("提示框");
        tween(pre)
            .to(0.3, { scale: v3(0, 0, 0) }, { easing: "backIn" })
            .call(() => {
                pre.active = false;
                this.open_ZhiWuTip();
            })
            .start();
    }
    //    //广告-解锁所有的菜单
    OnGuanGao1Click() {
        Banner.Instance.ShowVideoAd(() => { ZWDZJS_GameManager.Instance.OnGuanGao1ClickCallBack(); });
    }
    //    //广告-解锁所有的菜单回调
    OnGuanGao1ClickCallBack() {
        this.ZhiWuLan.removeAllChildren();
        let ZhiWuCaoNumber: number = 0;
        for (let i = 0; i < ZWDZJS_GameDate.JieSuo.length; i++) {
            ZhiWuCaoNumber++;
            this.ZhiWuCai_PuSh(i);
        }
        this.ZhiWuCao_Show(ZhiWuCaoNumber);
        this.UI.getChildByName("广告").getChildByName("解锁所有植物").active = false;
    }
    //    //广告-500阳光
    OnGuanGao2Click() {
        Banner.Instance.ShowVideoAd(() => { ZWDZJS_GameManager.Instance.Changge_YanGuang(500); });
    }
    //    //下一关
    Next_scene() {
        ZWDZJS_GameManager.Scence++;
        UIManager.ShowPanel(Panel.LoadingPanel, [director.getScene().name]);
    }
    //    //打开暂停菜单
    Open_Menu() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "植物大战僵尸");
        this.UI.getChildByName("暂停").active = true;
        this.PauseGame();
    }
    //    //关闭暂停菜单
    Exit_Menu() {
        this.UI.getChildByName("暂停").active = false;
        this.ContinueGame();
    }
    //    //暂停游戏
    PauseGame() {
        director.pause();
    }
    //    //继续游戏
    ContinueGame() {
        director.resume();
    }
    //    //返回主菜单
    ReMian() {
        this.ContinueGame();
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, "ZWDZJS_Start", () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "植物大战僵尸");
            });
        })
    }
    //    //重新游戏
    ReStar() {
        this.ContinueGame();
        director.loadScene(director.getScene().name);
    }

    //给sprite赋上当前关卡的阳关图标
    SetSpriteSum(sp: Sprite) {
        ZWDZJS_Incident.LoadSprite("Sprite/阳光默认图/" + ZWDZJS_GameManager.GameMode).then((spritef: SpriteFrame) => {
            if (sp) sp.spriteFrame = spritef;
        })
    }

    //点击更多游戏
    OnMoreGameClick() {
        UIManager.ShowPanel(Panel.MoreGamePanel);
    }
}


