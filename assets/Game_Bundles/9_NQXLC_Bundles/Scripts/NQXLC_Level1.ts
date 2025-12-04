import { _decorator, Prefab, Node, Sprite, tween, UIOpacity, v3, Vec3, instantiate, UITransform, director } from 'cc';
import { NQXLC_Level } from './NQXLC_Level';
import { NQXLC_Camera } from './NQXLC_Camera';
import { NQXLC_GameManager } from './NQXLC_GameManager';
import { NQXLC_DialogBox } from './NQXLC_DialogBox';
import { NQXLC_Chat } from './NQXLC_Chat';
import { CHATTYPE } from './NQXLC_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_Level1')
export class NQXLC_Level1 extends NQXLC_Level {
    public static Instance: NQXLC_Level1 = null;

    @property(Node)
    StartAni: Node = null;

    @property(Sprite)
    NextSprite: Sprite = null;

    @property(Node)
    FigureNodeNZ: Node = null;

    @property(UIOpacity)
    FigureUIOpacityNZ: UIOpacity = null;

    @property(Node)
    FigureNodeNZ2: Node = null;

    @property(UIOpacity)
    FigureUIOpacityNZ2: UIOpacity = null;

    @property(Node)
    HandNode: Node = null;

    @property(Node)
    Records: Node = null;

    @property(Node)
    Content: Node = null;

    @property(Node)
    PhoneClickNode: Node = null;

    @property(Node)
    SelectPanel1: Node = null;

    @property(Node)
    SelectPanel2: Node = null;

    @property(Node)
    SelectPanel3: Node = null;

    @property(Node)
    SelectPanel4: Node = null;

    @property(Node)
    FigureNodeSJ: Node = null;

    @property(UIOpacity)
    FigureUIOpacitySJ: UIOpacity = null;

    @property(UIOpacity)
    FigureUIOpacitySJ2: UIOpacity = null;

    @property(Node)
    FigureNodeSMR: Node = null;

    @property(UIOpacity)
    FigureUIOpacitySMR: UIOpacity = null;

    @property(UIOpacity)
    FigureUIOpacitySMR2: UIOpacity = null;

    @property(Node)
    EndAniPanel: Node = null;

    @property(UIOpacity)
    BlackUIOpacity: UIOpacity = null;

    @property(Node)
    CarNode: Node = null;

    @property(Node)
    NZNode: Node = null;

    @property(Node)
    XZNode: Node = null;

    @property(Sprite)
    Scene2: Sprite = null;

    @property(Node)
    Text: Node = null;

    private _figueInitPos: Vec3 = new Vec3();
    private _isPlaying: boolean = false;//是否进入额外的动画
    private _handInitPos: Vec3 = new Vec3();
    private _isClick: boolean = false;
    private _phoneClickStart: boolean = false;
    /**
 *      [
        "你叫路小染，19岁，这一届的大一新生，对于即将迎来的大学新生活————",
        "你既充满了期待，又莫名有些不安。",
        "你看了一下身旁放着行李的空座位，突然觉得有些伤感，不由得想起了高中的那些死党们。",
        "不知他们正在做什么，是否也坐上了去往各自大学的校车，忐忑或期待着未来的新生活。",
        // "",//手机对话
        "你 真不是做梦吧......",
        "你 简直太好了，嘻嘻!",
        "虽然刚刚嘴上说着不在意，其实心里还是高兴又激动的，没想到能与高中的死党再聚,",
        "简直是天大的幸运!然而正当你喜滋滋地依着车窗窃笑之时，突然————",//车子抖动
        "一阵剧烈的摇晃后，车子缓缓停靠在了路边。",
        "伴着大家渐渐涌起的骚动，司机从驾驶位走了下来，一脸的无奈。",
        "司机 抱歉了各位家长同学们，车子出故障抛锚了你们可能要下车多走一段路了。",
        "闻此，车厢内顿时响起一片议论之声，隐约夹杂着不满的质疑与抱怨。",//对话选择
        "抱怨的呼声越来越高，在座的一些人纷纷提出了要让学校派其他车辆来接的要求。",
        "司机 再派其他车来倒也可以，不过今天新生到校，校车都在接学生的路上没有空车。",
        "司机 如果你们不介意等的话倒是可以等，不过其实校门离这里很近，穿过商业街就是。",
        "司机 等其他车送完学生回来接，或者自己多走几步路，你们自己选吧",
        "司机 不管怎样这车上是不能呆了。大家拿好行李有序下车吧，想等的在路边等着。",
        "司机 不过，我可不保证你们要等多久。",
        "司机的言外之意是相当明确了......",
        "大家虽然有诸多不满，但是第一天报到不想惹事，也就都乖乖下车了。",
        "无奈，你也只得跟在其他人的身后，拖着沉重的行李走下了校车。",
    ]
 */
    private _dialog1: string[] = [
        "你叫路小染，19岁，这一届的大一新生，对于即将迎来的大学新生活————",
        "你既充满了期待，又莫名有些不安。",
        "你看了一下身旁放着行李的空座位，突然觉得有些伤感，不由得想起了高中的那些死党们。",
        "不知他们正在做什么，是否也坐上了去往各自大学的校车，忐忑或期待着未来的新生活。",
    ];

    private _dialog2: string[] = [
        "你 真不是做梦吧......",
        "你 简直太好了，嘻嘻!",
        "虽然刚刚嘴上说着不在意，其实心里还是高兴又激动的，没想到能与高中的死党再聚,",
        "简直是天大的幸运!然而正当你喜滋滋地依着车窗窃笑之时，突然————"
    ];

    private _dialog3: string[] = [
        "一阵剧烈的摇晃后，车子缓缓停靠在了路边。",
        "伴着大家渐渐涌起的骚动，司机从驾驶位走了下来，一脸的无奈。",
        "司机 抱歉了各位家长同学们，车子出故障抛锚了你们可能要下车多走一段路了。",
    ];

    private _dialog4: string[] = [
        "闻此，车厢内顿时响起一片议论之声，隐约夹杂着不满的质疑与抱怨。",
        "抱怨的呼声越来越高，在座的一些人纷纷提出了要让学校派其他车辆来接的要求。",
        "司机 再派其他车来倒也可以，不过今天新生到校，校车都在接学生的路上没有空车。",
        "司机 如果你们不介意等的话倒是可以等，不过其实校门离这里很近，穿过商业街就是。",
        "司机 等其他车送完学生回来接，或者自己多走几步路，你们自己选吧",
        "司机 不管怎样这车上是不能呆了。大家拿好行李有序下车吧，想等的在路边等着。",
        "司机 不过，我可不保证你们要等多久。",
        "司机的言外之意是相当明确了......",
        "大家虽然有诸多不满，但是第一天报到不想惹事，也就都乖乖下车了。",
        "无奈，你也只得跟在其他人的身后，拖着沉重的行李走下了校车。",
    ];


    /**
     * 
     * 在么？
     * ：）
     * 
     * 1
     * 有何贵干，校草大人。
     * 嘻嘻，可是你本来就是嘛。
     * 咳咳，别这样叫我啊，我都不好意思了。
     * 2
     * 什么事儿啊傻逼同桌。
     * 喂，都上大学了怎么还这么粗鲁
     * 怎么，不行么?不服来战。
     * 3
     * 在的，什么事啊?
     * 
     * 听说你今天去新学校报到，还顺利么?
     * 到目前为止还算顺利啦，已经坐上迎新的校车了，应该很快就到学校了。
     * 嗯，你一个人在外面，可得机灵点儿，别被人欺负了。
     * 
     * 1
     * 一旦被欺负了你可要来救我哦。
     * 嗯，一定去。
     * 2
     * 放心吧，我会小心的。
     * 3
     * 还有人敢欺负我?!呵呵。
     * 说的也是，那你不要欺负别人然后被学校开除了
     * 什么呀!我什么时候主动欺负过人，从来都是人不犯我我不犯人，人若犯我，狗腿打折。
     * 
     * 你现在在干什么，高考之后就跟失踪了一样，最后是考上了么?
     * 托你的福，考上了。
     * 真的?!太好了，不枉我帮你辅导了那么久!
     * 是哪所学校啊?
     * 一间不出名的学校，不值得一提
     * 那也可以啊，说实话，真的没有想到你这个从来都不学习的家伙最后靠着突击复习也能考上大学
     * 
     * 1
     * 果然是我教导有方！
     * 你还是一如既往的脸大。
     * 2
     * 看来你真的是很有潜力哦!
     * 得了，这都得归功于你为了帮我这么费心。
     * 3
     * 你还真是又帅又聪明呢!
     * 小丫头你的嘴真的是太甜了吧。
     * 
     * 不过还有一件事我说出来，你可不要生气。
     * 哦?什么事啊?
     * 虽然考上了，但是我最终还是决定放弃念了。
     * 抱歉，辜负你的努力了......
     * 啊?为什么啊?
     * 我也不是什么学习的料，那样一间不上不下的大学，读了也是浪费时间。
     * 如果是跟你同一间大学的话，那我肯定念了。
     * 嘁，这学校可是我拼死拼活拼三年才考上的，要是你临时抱佛脚三个月就能来，我可要被气死的
     * 怎么，你不希望我跟你在一个地方么?
     * 说的像希望的话你就真能来一样
     * 
     * charutupian
     * 
     * 明天就去了。
     * ? !
     * 你来做什么啊?
     * 去看你啊。
     * 你别逗我了!
     * 哈哈。
     * 你知道我一直都喜欢写歌创作的吧。
     * 前阵子运作后签下了一家公司的合同，明天就去正式报到了。
     * 这个决定虽然有些草率，不过你会支持我的吧?
     * 
     * 1
     * 我当然会支持你了加油。
     * 我就知道，你最好了。
     * 2
     * 未来的大明星，出名了可要给我大腿抱哦!
     * 给给给，让你天天抱着。
     * 3
     * 醒醒吧别做梦了，演艺圈哪是那么好混的，你还是赶紧找个富婆嫁了比较靠谱。
     * 你这家伙还是这么毒舌!
     * 
     * 好了不说了，我知道你坐车看手机久了就会头晕的，等你都安顿好了，我再找你聊天。
     * 嗯，好的，你也抓紧时间收拾行李吧明天的飞机可不要忘带东西了。
     * 我可没你那么迷糊，等着我去找你吧，不要太激动哦!
     * 才不会呢，略略略。
     * 
     */

    private _phoneDialog1: string[] = [
        "0在么？",
        "0：）",
    ]

    private _phoneDialog2: string[] = [
        "0听说你今天去新学校报到，还顺利么?",
        "1到目前为止还算顺利啦，已经坐上迎新的校车了，应该很快就到学校了。",
        "0嗯， 你一个人在外面， 可得机灵点儿， 别被人欺负了。",
    ]

    private _phoneDialog3: string[] = [
        "1你现在在干什么，高考之后就跟失踪了一样，最后是考上了么?",
        "0托你的福，考上了。",
        "1真的?!太好了，不枉我帮你辅导了那么久!",
        "1是哪所学校啊?",
        "0一间不出名的学校，不值得一提",
        "1那也可以啊，说实话，真的没有想到你这个从来都不学习的家伙最后靠着突击复习也能考上大学",
    ]

    private _phoneDialog4: string[] = [
        "0不过还有一件事我说出来，你可不要生气。",
        "1哦?什么事啊?",
        "0虽然考上了，但是我最终还是决定放弃念了。",
        "0抱歉，辜负你的努力了......",
        "1啊?为什么啊?",
        "0我也不是什么学习的料，那样一间不上不下的大学，读了也是浪费时间。",
        "0如果是跟你同一间大学的话，那我肯定念了。",
        "1嘁，这学校可是我拼死拼活拼三年才考上的，要是你临时抱佛脚三个月就能来，我可要被气死的",
        "0怎么，你不希望我跟你在一个地方么?",
        "1说的像希望的话你就真能来一样",
    ]

    private _phoneDialog5: string[] = [
        "0明天就去了。",
        "1? !",
        "1你来做什么啊?",
        "0去看你啊。",
        "1你别逗我了!",
        "0哈哈。",
        "0你知道我一直都喜欢写歌创作的吧。",
        "0前阵子运作后签下了一家公司的合同，明天就去正式报到了。",
        "0这个决定虽然有些草率，不过你会支持我的吧?",
    ]

    private _phoneDialog6: string[] = [
        "0好了不说了，我知道你坐车看手机久了就会头晕的，等你都安顿好了，我再找你聊天。",
        "1嗯，好的，你也抓紧时间收拾行李吧明天的飞机可不要忘带东西了。",
        "0我可没你那么迷糊，等着我去找你吧，不要太激动哦!",
        "1才不会呢，略略略。",
    ]

    /**
     * 
     * 车子抛锚的地方是一处颇为繁华的商业街，看来教育产业真的是很能带动周边经济啊。
     * 这里到学校仅一条步行街的距离，算是第二校门了，所以很多接送学生的车都停在这里。
     * 这样看来，坚持再等第二辆校车来接确实有些矫情，但你的情况又实在是跟其他人不一样。
     * 别人好歹都有父母亲人的帮助，而你回头看看了看自己的两大箱沉重行李，心灰意冷。
     * 而就在这时，你的耳边传来了一个十分低沉的磁性声音一
     * 
     * 抱歉打扰了
     * 你的箱子挡在我车前了，可以稍微挪一下么，我要出车位。
     * 啊，抱歉抱歉，我现在就拿开。
     * 你赶忙想把箱子提上人行道，但是箱子太重居然一下子没提起来，自己反倒险些摔倒了，
     * 你当心点儿，还是我来吧，
     * 真是麻烦你了，谢谢。
     * 你这是，一个人来学校报到?
     * 嗯
     * 这……
     * 你打量了一下眼前的这个男子，大概二十八九的年纪，长相英俊衣品不俗，开的是豪车。
     * 看样子应该是个商界精英型的人物，不过学校周围并没有大型的商务区，所以他大概是--
     */

    private _dialog21: string[] = [
        "车子抛锚的地方是一处颇为繁华的商业街，看来教育产业真的是很能带动周边经济啊。",
        "这里到学校仅一条步行街的距离，算是第二校门了，所以很多接送学生的车都停在这里。",
        "这样看来，坚持再等第二辆校车来接确实有些矫情，但你的情况又实在是跟其他人不一样。",
        "别人好歹都有父母亲人的帮助，而你回头看看了看自己的两大箱沉重行李，心灰意冷。",
        "而就在这时，你的耳边传来了一个十分低沉的磁性声音一",
        "神秘人 抱歉打扰了————",
        "神秘人 你的箱子挡在我车前了，可以稍微挪一下么，我要出车位。",
        "你 啊，抱歉抱歉，我现在就拿开。",
        "你赶忙想把箱子提上人行道，但是箱子太重居然一下子没提起来，自己反倒险些摔倒了。",
        "神秘人 你当心点儿，还是我来吧。",
        "你 真是麻烦你了，谢谢。",
        "神秘人 你这是，一个人来学校报到?",
        "你 嗯",
        "你 这……",
        "你打量了一下眼前的这个男子，大概二十八九的年纪，长相英俊衣品不俗，开的是豪车。",
        "看样子应该是个商界精英型的人物，不过学校周围并没有大型的商务区，所以他大概是--",
    ];

    private _dialog22: string[] = [
        "所以，面对这个看上去十分“善意”的邀约，你决定一",
    ];

    /***
     * 1
     * 小开心小激动
     * 
     * 难免有些小激动呢!
     * 偷偷瞄了那人的侧颜，沉稳优雅，虽然热心但还有一点点的高冷，真是越看越帅!
     * 
     * 2
     * 忐忑不安
     * 
     * 3
     * 毫无波澜
     * 
     * 向男子道谢后，你拖着行李向校园走去。
     */
    private _dialog23: string[] = [
        "你 嗯，那我就不客气了，谢谢。",
        "如果拖着这些行李走过步行街，估计到学校也累瘫了。难得遇到好心人，当然不要推辞了。",
        "头一次坐这样的豪车，此刻你的内心一",
        "虽然绕过商业街到校门口的距离并不远，不过今天交通不畅，车走走停停耽误了不少时间。",
        "即便车内飘着悠扬的乐声，但安静的气氛还是难免让人觉得尴尬，要不要搭讪缓解一下",
    ];

    private _dialog24: string[] = [
        "你 不用了谢谢，我自己可以。",
        "一个不认识的陌生人，无事献殷勤，还是小心谨慎点好，累就累吧，认命了。",
        "神秘人 好吧，那你自己当心点，祝你大学生活愉快。",
        "男子送上一个礼貌的微笑，然后转身离开了你望了望长长的步行街深深叹了气。",
    ];



    protected onLoad(): void {
        super.onLoad();
        NQXLC_Level1.Instance = this;
        this.PhoneClickNode.on(Node.EventType.TOUCH_END, this.onPhoneClick, this);
    }

    start() {
        this._figueInitPos = this.FigureNodeNZ.getPosition();
        this._handInitPos = this.HandNode.getPosition();
        this.startAni();
        // this.showHand();
        // this.startDialog3();
        // this.startDialog22();
        // this.startNoDX();
        // this.startDX();

    }

    startAni() {
        tween(this.StartAni)
            .to(1, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .call(() => {
                this.NextSprite.node.active = true;
                tween(this.NextSprite)
                    .to(0.5, { fillRange: 1 }, { easing: `sineOut` })
                    .call(() => {
                        //游戏开始
                        this.showFigureNZ(() => {
                            this.startDialog1();
                        });
                    })
                    .start();
            })
            .start();
    }

    endAni(cb: Function = null) {
        this.EndAniPanel.active = true;
        this.BlackUIOpacity.node.active = true;
        tween(this.BlackUIOpacity)
            .to(1, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                this.CarNode.active = true;
                this.NZNode.active = true;
                tween(this.NZNode)
                    .to(1, { position: v3(0, 0, 0) }, { easing: `sineOut` })
                    .call(() => {
                        this.XZNode.active = true;
                        NQXLC_Camera.Instance.shakeCamera();
                        tween(this.XZNode)
                            .by(0.1, { position: v3(0, -500, 0) }, { easing: `sineOut` })
                            .call(() => {
                                this.scheduleOnce(() => {
                                    tween(this.Scene2)
                                        .to(1, { fillRange: 1 }, { easing: `sineOut` })
                                        .call(() => {
                                            cb && cb();
                                        })
                                        .start();
                                }, 1)
                            })
                            .start();
                    })
                    .start();
            })
            .start();
    }

    showFigureNZ(cb: Function = null) {
        tween(this.FigureNodeNZ)
            .to(1, { position: v3(0, this._figueInitPos.y, this._figueInitPos.z) }, { easing: `sineOut` })
            .start();
        tween(this.FigureUIOpacityNZ)
            .to(1, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    hideFigureNZ(cb: Function = null) {
        tween(this.FigureUIOpacityNZ)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    showFigureNZ2(cb: Function = null) {
        tween(this.FigureUIOpacityNZ2)
            .to(1, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    hideFigureNZ2(cb: Function = null) {
        tween(this.FigureUIOpacityNZ2)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    showFigureSJ(cb: Function = null) {
        tween(this.FigureNodeSJ)
            .to(1, { position: v3(0, this._figueInitPos.y, this._figueInitPos.z) }, { easing: `sineOut` })
            .start();
        tween(this.FigureUIOpacitySJ)
            .to(1, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    hideFigureSJ(cb: Function = null) {
        tween(this.FigureUIOpacitySJ)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    changeSJ2Opacity(targetOpacity: number, cb: Function = null) {
        tween(this.FigureUIOpacitySJ2)
            .to(1, { opacity: targetOpacity }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    showFigureSMR(cb: Function = null) {
        tween(this.FigureNodeSMR)
            .to(1, { position: v3(0, this._figueInitPos.y, this._figueInitPos.z) }, { easing: `sineOut` })
            .start();
        tween(this.FigureUIOpacitySMR)
            .to(1, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    hideFigureSMR(cb: Function = null) {
        tween(this.FigureUIOpacitySMR)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    changeSMR2Opacity(targetOpacity: number, cb: Function = null) {
        tween(this.FigureUIOpacitySMR2)
            .to(1, { opacity: targetOpacity }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    showHand() {
        tween(this.HandNode)
            .by(1, { position: v3(0, 1030) }, { easing: `sineOut` })
            .parallel(
                tween(this.HandNode).to(1, { position: v3(this._handInitPos.x, -116, this._handInitPos.z) }, { easing: `sineOut` }).start(),
                tween(this.HandNode).to(1, { scale: v3(1.66, 1.572, 1) }, { easing: `sineOut` }).start()
            )
            .call(() => {
                this._isClick = true;
            })
            .start();
    }

    startChitchat() {
        if (!this._isClick) return;
        this.HandNode.active = false;
        this.Records.active = true;
        this._phoneClickStart = true;
        this.PhoneClickNode.active = true;
        this.startPhoneDialog();
    }

    /**
     * 播放第一段场景
     * @param count 第几句
     * @returns 
     */
    startDialog1(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog1.length <= 0) {
            this.showHand();
            return;
        }
        if (!this._isPlaying && count == 1) {
            this.Text.active = true;
        } else if (!this._isPlaying && count == 2) {
            this.Text.active = false;
        } else if (!this._isPlaying && count == 3) {
            this.hideFigureNZ(() => {
                this._isPlaying = true;
                this.startDialog1(count);
            })
            return;
        }
        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog1.shift(), () => {
                this.IsNext = true;
                this.startDialog1(count + 1);
            });
        })
    }

    /**
     * 播放第二段场景
     * @param count 第几句
     * @returns 
     */
    startDialog2(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog2.length <= 0) {
            this.startDialog3();
            return;
        }

        if (!this._isPlaying && count == 1) {
            this.showFigureNZ(() => {
                this._isPlaying = true;
                this.startDialog2(count);
            })
            return;
        } else if (!this._isPlaying && count == 3) {
            this.hideFigureNZ(() => {
                this._isPlaying = true;
                this.startDialog2(count);
            })
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog2.shift(), () => {
                this.IsNext = true;
                this.startDialog2(count + 1);
            });
        })
    }

    startDialog3(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog3.length <= 0) {
            this._isPlaying = false
            this.startDialog4();
            return;
        }

        if (!this._isPlaying && count == 1) {
            NQXLC_Camera.Instance.shakeCamera(() => {
                this._isPlaying = true;
                this.startDialog3(count);
            })
            return;
        } else if (!this._isPlaying && count == 3) {
            this.showFigureSJ(() => {
                this._isPlaying = true;
                this.startDialog3(count);
            })
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog3.shift(), () => {
                this.IsNext = true;
                this.startDialog3(count + 1);
            });
        })
    }

    startDialog4(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog4.length <= 0) {
            //最后
            this.endAni(() => {
                this.startDialog21()
            });
            return;
        }

        if (!this._isPlaying && count == 1) {
            this.changeSJ2Opacity(255, () => {
                this._isPlaying = true;
                this.startDialog4(count);
            })
            return;
        } else if (!this._isPlaying && count == 3) {
            this.changeSJ2Opacity(0, () => {
                this._isPlaying = true;
                this.startDialog4(count);
            })
            return;
        } else if (!this._isPlaying && count == 8) {
            this.hideFigureSJ(() => {
                this._isPlaying = true;
                this.startDialog4(count);
            })
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog4.shift(), () => {
                this.IsNext = true;
                this.startDialog4(count + 1);
            });
        })
    }

    private _select1: boolean = true;
    private _select2: boolean = true;
    private _select3: boolean = true;
    private _select4: boolean = true;

    startPhoneDialog() {
        let text: string = "";
        if (this._phoneDialog1.length > 0) {
            text = this._phoneDialog1.shift();
        } else if (this._phoneDialog2.length > 0) {
            if (this._select1) {
                this._select1 = false;
                this.SelectPanel1.active = true;
                return;
            }
            text = this._phoneDialog2.shift();
        } else if (this._phoneDialog3.length > 0) {
            if (this._select2) {
                this._select2 = false;
                this.SelectPanel2.active = true;
                return;
            }
            text = this._phoneDialog3.shift();
        } else if (this._phoneDialog4.length > 0) {
            if (this._select3) {
                this._select3 = false;
                this.SelectPanel3.active = true;
                return;
            }
            text = this._phoneDialog4.shift();
        } else if (this._phoneDialog5.length > 0) {

            text = this._phoneDialog5.shift();
        } else if (this._phoneDialog6.length > 0) {
            if (this._select4) {
                this._select4 = false;
                this.SelectPanel4.active = true;
                return;
                // this._phoneDialog2[]
            }
            text = this._phoneDialog6.shift();
        } else {
            tween(this.Records)
                .by(1, { position: v3(0, -1080, 0) }, { easing: `sineOut` })
                .call(() => {
                    this.Records.parent.active = false;
                    this.startDialog2();
                    // console.log(`1111111111111`);
                })
                .start();
            return;
        }
        let path: string = "";
        let type: CHATTYPE = CHATTYPE.LEFT
        if (text[0] == "0") {
            path += "昊昊消息"
        } else if (text[0] == "1") {
            path += "女主消息"
            type = CHATTYPE.RIGHT;
        }
        text = text.slice(1);

        BundleManager.LoadPrefab("9_NQXLC_Bundles", path).then((prefab: Prefab) => {
            const chat: Node = instantiate(prefab);
            chat.parent = this.Content;
            chat.getComponent(NQXLC_Chat).showText(text, type);
        })


    }

    /**
     * 
     * 1
     * 有何贵干，校草大人。
     * 咳咳，别这样叫我啊，我都不好意思了。
     * 嘻嘻，可是你本来就是嘛。
     * 2
     * 什么事儿啊傻逼同桌。
     * 喂，都上大学了怎么还这么粗鲁
     * 怎么，不行么?不服来战。
     * 3
     * 在的，什么事啊?
     * 
     */
    showSelect1(event: TouchEvent, type: string) {
        if (type == "1") {
            this._phoneDialog2 = [
                "1有何贵干，校草大人。",
                "0咳咳，别这样叫我啊，我都不好意思了。",
                "1嘻嘻，可是你本来就是嘛。",
                ...this._phoneDialog2
            ]
        } else if (type == "2") {
            this._phoneDialog2 = [
                "1什么事儿啊XX同桌。",
                "0喂，都上大学了怎么还这么粗鲁。",
                "1怎么，不行么?不服来战。",
                ...this._phoneDialog2
            ]
        } else if (type == "3") {
            this._phoneDialog2 = [
                "1在的，什么事啊?",
                ...this._phoneDialog2
            ]
        }
        this.SelectPanel1.active = false;
        this.startPhoneDialog();
    }

    /**
     * 
     * 一旦被欺负了你可要来救我哦。
     * 嗯，一定去。
     * 2
     * 放心吧，我会小心的。
     * 3
     * 还有人敢欺负我?!呵呵。
     * 说的也是，那你不要欺负别人然后被学校开除了
     * 什么呀!我什么时候主动欺负过人，从来都是人不犯我我不犯人，人若犯我，狗腿打折。
     */
    showSelect2(event: TouchEvent, type: string) {
        if (type == "1") {
            this._phoneDialog3 = [
                "1一旦被欺负了你可要来救我哦。",
                "0嗯，一定去。",
                ...this._phoneDialog3
            ]
        } else if (type == "2") {
            this._phoneDialog3 = [
                "1放心吧，我会小心的。",
                ...this._phoneDialog3
            ]
        } else if (type == "3") {
            this._phoneDialog3 = [
                "1还有人敢欺负我?!呵呵。",
                "0说的也是，那你不要欺负别人然后被学校开除了。",
                "1什么呀！我什么时候主动欺负过人， 从来都是人不犯我我不犯人，人若犯我，狗腿打折。",
                ...this._phoneDialog3
            ]
        }
        this.SelectPanel2.active = false;
        this.startPhoneDialog();
    }

    /**
     * 
     * 果然是我教导有方！
     * 你还是一如既往的脸大。
     * 2
     * 看来你真的是很有潜力哦!
     * 得了，这都得归功于你为了帮我这么费心。
     * 3
     * 你还真是又帅又聪明呢!
     * 小丫头你的嘴真的是太甜了吧。
     * @param type 
     */

    showSelect3(event: TouchEvent, type: string) {
        if (type == "1") {
            this._phoneDialog4 = [
                "1果然是我教导有方！",
                "0你还是一如既往的脸大。",
                ...this._phoneDialog4
            ]
        } else if (type == "2") {
            this._phoneDialog4 = [
                "1看来你真的是很有潜力哦!",
                "0得了，这都得归功于你为了帮我这么费心。",
                ...this._phoneDialog4
            ]
        } else if (type == "3") {
            this._phoneDialog4 = [
                "1你还真是又帅又聪明呢!",
                "0小丫头你的嘴真的是太甜了吧。",
                ...this._phoneDialog4
            ]
        }
        this.SelectPanel3.active = false;
        this.startPhoneDialog();
    }

    /**
     * 
      * 1
     * 我当然会支持你了加油。
     * 我就知道，你最好了。
     * 2
     * 未来的大明星，出名了可要给我大腿抱哦!
     * 给给给，让你天天抱着。
     * 3
     * 醒醒吧别做梦了，演艺圈哪是那么好混的，你还是赶紧找个富婆嫁了比较靠谱。
     * 你这家伙还是这么毒舌!
     */

    showSelect4(event: TouchEvent, type: string) {
        if (type == "1") {
            this._phoneDialog5 = [
                "1我当然会支持你了加油。",
                "0我就知道，你最好了。",
                ...this._phoneDialog5
            ]
        } else if (type == "2") {
            this._phoneDialog5 = [
                "1未来的大明星，出名了可要给我大腿抱哦!",
                "0给给给，让你天天抱着。",
                ...this._phoneDialog5
            ]
        } else if (type == "3") {
            this._phoneDialog5 = [
                "1醒醒吧别做梦了，演艺圈哪是那么好混的，你还是赶紧找个富婆嫁了比较靠谱。",
                "0你这家伙还是这么毒舌!",
                ...this._phoneDialog5
            ]
        }
        this.SelectPanel4.active = false;
        this.startPhoneDialog();
    }

    contenAddHeight(height: number) {
        if (this.Content.getComponent(UITransform).contentSize.height > 986) {
            this.Content.setPosition(this.Content.getPosition().add3f(0, height, 0));
        }
    }

    onPhoneClick(event: TouchEvent) {
        if (!this._phoneClickStart) return;
        this.startPhoneDialog();
    }

    startDialog21(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog21.length <= 0) {
            // this.showHand();
            this.hideFigureNZ2();
            this.hideFigureSMR();
            this.SelectPanel21.active = true;
            return;
        }
        if (!this._isPlaying && count == 6) {
            this.showFigureSMR(() => {
                this._isPlaying = true;
                this.startDialog21(count);
            })
            return;
        } else if (!this._isPlaying && count == 8) {
            this.changeSMR2Opacity(255, () => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startDialog21(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 10) {
            this.hideFigureNZ2(() => {
                this.changeSMR2Opacity(0, () => {
                    this._isPlaying = true;
                    this.startDialog21(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 11) {
            this.changeSMR2Opacity(255, () => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startDialog21(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 12) {
            this.hideFigureNZ2(() => {
                this.changeSMR2Opacity(0, () => {
                    this._isPlaying = true;
                    this.startDialog21(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 13) {
            this.changeSMR2Opacity(255, () => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startDialog21(count);
                })
            })
            return;
        }
        console.log(count);

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog21.shift(), () => {
                this.IsNext = true;
                this.startDialog21(count + 1);
            });
        })
    }

    startDialog22(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog22.length <= 0) {
            this.SelectPanel22.active = true;
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog22.shift(), () => {
                this.IsNext = true;
                this.startDialog22(count + 1);
            });
        })
    }

    startDialog23(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog23.length <= 0) {
            this.SelectPanel24.active = true;
            return;
        }
        if (!this._isPlaying && count == 1) {
            this.showFigureNZ2(() => {
                this._isPlaying = true;
                this.startDialog23(count);
            })
        } else if (!this._isPlaying && count == 2) {
            this.hideFigureNZ2(() => {
                this._isPlaying = true;
                this.startDialog23(count);
            })
        } else if (!this._isPlaying && count == 4) {
            this._isPlaying = true;
            this.SelectPanel23.active = true;
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog23.shift(), () => {
                this.IsNext = true;
                this.startDialog23(count + 1);
            });
        })
    }

    startDialog24(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dialog24.length <= 0) {
            this.EndPanel.active = true;
            ProjectEventManager.emit(ProjectEvent.游戏结束, "女寝修罗场");
            //结束
            return;
        }
        if (!this._isPlaying && count == 1) {
            this.showFigureNZ2(() => {
                this._isPlaying = true;
                this.startDialog24(count);
            })
            return;
        } else if (!this._isPlaying && count == 2) {
            this.hideFigureNZ2(() => {
                this._isPlaying = true;
                this.startDialog24(count);
            })
            return;
        } else if (!this._isPlaying && count == 3) {
            this.showFigureSMR(() => {
                this._isPlaying = true;
                this.startDialog24(count);
            })
            return;
        } else if (!this._isPlaying && count == 4) {
            this.hideFigureSMR(() => {
                this._isPlaying = true;
                this.startDialog24(count);
            })
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dialog24.shift(), () => {
                this.IsNext = true;
                this.startDialog24(count + 1);
            });
        })
    }

    private _dx: string[] = [
        "你 这曲子可真好听啊，是",
        "神秘人 巴赫的C大调前奏曲",
        "你 哦...",
        "他答完话后就没有再理你……你觉得有些小失落，交流不顺，难道这就是代沟么?",
        "而对方似乎也看出了你的小心思，趁着等红灯的时间转过头看向你。",
        "神秘人 你别误会，我不是不愿同你聊天，只是我这个人习惯开车的时候专心一些。",
        "你 啊，没有没有!我没有那么想啦!",
        "你 你有些尴尬的摆了摆手，内心觉得这个人--",
        "你 (认真稳重，应该是个不错的人。)",
        "车子过了红灯，拐了个弯就到了校门口",
    ]

    private _noDX: string[] = [
        "就在你纠结犹豫的时候，车已经到了校门口。",
        "校门前一个巨大的禁行牌子立在那里，车子绕过学校的正门，停靠在了校门旁的路边。",
        "神秘人 今天是报到日所以禁止校外车辆进入了，看来只能送你到这里了。",
        "你 送到这里就已经很感谢了!",
        "神秘人 举手之劳，我去帮你拿行李下来。",
        "向男子道谢后，你拖着行李向校园走去。",
        "再次向男子道谢后，你下了车，拖着行李走进了校园。",
    ]

    startDX(count: number = 1) {
        if (!this.IsNext) return;
        if (this._dx.length <= 0) {
            this._noDX.shift();
            this.startNoDX(2);
            return;
        }
        if (!this._isPlaying && count == 1) {
            this.showFigureNZ2(() => {
                this._isPlaying = true;
                this.startDX(count);
            })
            return;
        } else if (!this._isPlaying && count == 2) {
            this._isPlaying = true;
            this.SelectPanel25.active = true;
            return;
        } else if (!this._isPlaying && count == 3) {
            this.hideFigureNZ2(() => {
                this.showFigureSMR(() => {
                    this._isPlaying = true;
                    this.startDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 4) {
            this.hideFigureSMR(() => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 7) {
            this.hideFigureNZ2(() => {
                this.showFigureSMR(() => {

                    this._isPlaying = true;
                    this.startDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 8) {
            this.hideFigureSMR(() => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 11) {
            this.hideFigureNZ2(() => {
                this._isPlaying = true;
                this.startDX(count);
            })
            return;
        }


        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._dx.shift(), () => {
                this.IsNext = true;
                this.startDX(count + 1);
            });
        })
    }

    startNoDX(count: number = 1) {
        if (!this.IsNext) return;
        if (this._noDX.length <= 0) {
            this.EndPanel.active = true;
            return;
        }
        if (!this._isPlaying && count == 3) {
            this.showFigureSMR(() => {
                this._isPlaying = true;
                this.startNoDX(count);
            })
            return;
        } else if (!this._isPlaying && count == 4) {
            this.hideFigureSMR(() => {
                this.showFigureNZ2(() => {
                    this._isPlaying = true;
                    this.startNoDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 5) {
            this.hideFigureNZ2(() => {
                this.showFigureSMR(() => {
                    this._isPlaying = true;
                    this.startNoDX(count);
                })
            })
            return;
        } else if (!this._isPlaying && count == 6) {
            this.hideFigureSMR(() => {
                this._isPlaying = true;
                this.startNoDX(count);
            })
            return;
        } else if (!this._isPlaying && count == 7) {
            tween(this.XX)
                .to(1, { fillRange: 1 }, { easing: `sineOut` })
                .call(() => {
                    this._isPlaying = true;
                    this.startNoDX(count);
                })
                .start();
            return;
        }

        this._isPlaying = false;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.node;
            node.getComponent(NQXLC_DialogBox).showDialog(this._noDX.shift(), () => {
                this.IsNext = true;
                this.startNoDX(count + 1);
            });
        })
    }


    showSelect21(event: TouchEvent, type: string) {
        //包养女学生的金主无疑了，呃，也不完全，有可能是男学生呢?嘿嘿嘿
        if (type == "1") {
            this._dialog22 = [
                "大概是在校生的亲属吧，是谁的哥哥或者男朋友么，无论是什么，那个人可真是幸运呢。",
                ...this._dialog22
            ]
        } else if (type == "2") {
            this._dialog22 = [
                "包养女学生的金主无疑了，呃，也不完全，有可能是男学生呢?嘿嘿嘿...",
                ...this._dialog22
            ]
        }
        this.SelectPanel21.active = false;
        this.startDialog22();
    }

    showSelect22(event: TouchEvent, type: string) {
        this.SelectPanel22.active = false;
        if (type == "1") {
            tween(this.Card)
                .to(1, { fillRange: 1 }, { easing: `sineOut` })
                .call(() => {
                    this.startDialog23();
                })
                .start();
        } else if (type == "2") {
            this.startDialog24();
        }
    }

    showSelect23(event: TouchEvent, type: string) {
        if (type == "1") {
            this._dialog23 = [
                "难免有些小激动呢!",
                "偷偷瞄了那人的侧颜，沉稳优雅，虽然热心但还有一点点的高冷，真是越看越帅!",
                ...this._dialog23
            ]
        } else if (type == "2") {
            this._dialog23 = [
                "你的内心十分忐忑，真皮座椅很贵吧?万一被你的行李刮坏了可怎么办...",
                "再者，到了学校要是让人看到从豪车上下来会不会被说闲话?",
                ...this._dialog23
            ]
        } else if (type == "3") {
            this._dialog23 = [
                "你的内心毫无波澜，车子而已，只要能跑的都差不多。再说人家也只是顺路带自己一程。",
                "想那么多做什么...",
                ...this._dialog23
            ]
        }
        this.SelectPanel23.active = false;
        this.startDialog23(4);
    }

    showSelect24(event: TouchEvent, type: string) {
        this.SelectPanel24.active = false;
        if (type == "1") {
            this.IsNext = true;
            this.startDX();
        } else if (type == "2") {
            this.IsNext = true;
            this.startNoDX();
        }
    }

    showSelect25(event: TouchEvent, type: string) {
        if (type == "1") {
            this._dx = [
                "是莫扎特的曲子吧?",
                ...this._dx
            ]
        } else if (type == "2") {
            this._dx = [
                "是巴赫的曲子吧?",
                ...this._dx
            ]
        } else if (type == "3") {
            this._dx = [
                "是肖邦的曲子吧?",
                ...this._dx
            ]
        }
        this.SelectPanel25.active = false;
        this.startDX(2);
    }

    @property(Node)
    SelectPanel21: Node = null;


    @property(Node)
    SelectPanel22: Node = null;

    @property(Node)
    SelectPanel23: Node = null;

    @property(Node)
    SelectPanel24: Node = null;

    @property(Node)
    EndPanel: Node = null;

    @property(Node)
    SelectPanel25: Node = null;

    @property(Sprite)
    Card: Sprite = null;

    @property(Sprite)
    XX: Sprite = null;

    breackSatrt() {
        ProjectEventManager.emit(ProjectEvent.返回主页, "女寝修罗场");
        director.loadScene(GameManager.StartScene);
    }

}


