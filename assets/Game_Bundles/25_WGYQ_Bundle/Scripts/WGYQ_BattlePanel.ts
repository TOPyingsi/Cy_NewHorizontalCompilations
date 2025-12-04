import { _decorator, Animation, AudioClip, clamp, Collider2D, Component, Contact2DType, IPhysics2DContact, Label, Node, Prefab, RigidBody2D, Sprite, SpriteFrame, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_BattleUI } from './WGYQ_BattleUI';
import { WGYQ_RewardPanel } from './WGYQ_RewardPanel';
import { WGYQ_YardManager } from './WGYQ_YardManager';
import { WGYQ_Audio } from './WGYQ_Audio';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_BattlePanel')
export class WGYQ_BattlePanel extends Component {

    private static instance: WGYQ_BattlePanel;
    public static get Instance(): WGYQ_BattlePanel {
        return this.instance;
    }

    @property(Sprite)
    hpBar: Sprite;

    @property(Sprite)
    jieaoBar: Sprite;

    @property(Animation)
    countPanel: Animation;

    @property(Animation)
    player: Animation;

    @property(Node)
    dogRoot: Node;

    @property(Node)
    controlPanel: Node;

    @property(Node)
    chats: Node;

    @property(Node)
    winPanel: Node;

    @property(Node)
    failPanel: Node;

    @property(WGYQ_RewardPanel)
    rewardPanel: WGYQ_RewardPanel;

    @property(UITransform)
    canvas: UITransform;

    @property(Sprite)
    kite: Sprite;

    @property([Prefab])
    dogPrefabs: Prefab[] = [];

    @property([Prefab])
    atkPrefabs: Prefab[] = [];

    @property([Prefab])
    hitPrefabs: Prefab[] = [];

    @property([SpriteFrame])
    fireSfs: SpriteFrame[] = [];

    @property([SpriteFrame])
    kickSfs: SpriteFrame[] = [];

    @property([SpriteFrame])
    kiteSfs: SpriteFrame[] = [];

    @property([AudioClip])
    clips: AudioClip[] = [];

    level: number;

    hp = 100;
    public get Hp(): number {
        return this.hp;
    }
    public set Hp(value: number) {
        this.hp = value;
        this.hpBar.fillRange = this.hp / (100 + 50 * (this.level - 1));
        console.log(this.hp, 100 + 50 * (this.level - 1));
        if (this.hp <= 30 * this.level) {
            this.hpBar.node.parent.getComponent(Animation).play();
            this.ChangeChat(this.dyingChat);
        }
        if (this.hp == 0) {
            this.Fail();
            WGYQ_Audio.Instance.Play(this.clips[1]);
        }
        else WGYQ_Audio.Instance.Play(this.clips[0]);
    }

    jieao = 100;
    public get Jieao(): number {
        return this.jieao;
    }
    public set Jieao(value: number) {
        this.jieao = clamp(value, 0, 100 + 50 * (this.level - 1));
        this.jieaoBar.fillRange = this.jieao / (100 + 50 * (this.level - 1));
        if (this.jieao == 0) this.Win();
    }

    isEnd = false;

    cds = [0, 0, 0];
    weapons: number[];
    weaponLevel: number[];

    normalChat = [
        "给狗哥吃火龙果！！",
        "放个风筝",
        "我要看血流成河",
        "咬人的狗活该挨打，揍它"
    ]

    winChat = [
        "牛逼",
        "666",
        "妙手回春",
        "眼神瞬间清澈了👍"
    ]

    dyingChat = [
        "这是虐狗吧",
        "别打了！！狗都快死了！！",
        "虐狗，举报了",
        "怎么这么残忍"
    ]

    dieChat = [
        "？这是把狗打死了吗",
        "死了",
        "神金，举报了",
        "把帽子叔叔叫来"
    ]

    runChat = [
        "兽人永不为奴！！！",
        "水平不行啊，笑死2333333",
        "狗：这事我能吹一辈子",
        "草哈哈哈哈哈哈哈哈哈"
    ]

    protected onLoad(): void {
        WGYQ_BattlePanel.instance = this;
        this.Init();
    }

    start() {
        this.schedule(this.JieaoUpdate, 0.1);
    }

    update(deltaTime: number) {
        this.Check();
    }

    Init() {
        this.level = WGYQ_GameData.Instance.getNumberData("Level");
        this.hpBar.fillRange = 1;
        this.jieaoBar.fillRange = 1;
        this.hp = 100 + 50 * (this.level - 1);
        this.jieao = 100 + 50 * (this.level - 1);
        let prefab = this.dogPrefabs.find((value, index, obj) => { if (value.name == "Battle" + WGYQ_GameData.Instance.getObjectData("CurrentDog").dogType) return value; });
        let dog: Node = PoolManager.GetNodeByPrefab(prefab, this.dogRoot);
        dog.setPosition(Vec3.ZERO);
        let collider = this.dogRoot.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.DogHit, this);
        this.weapons = WGYQ_GameData.Instance.getArrayData("Weapons");
        this.kite.spriteFrame = this.kiteSfs[this.weapons[2]];
        let shop = WGYQ_GameData.Instance.getArrayData("Shop");
        this.weaponLevel = [shop[0][this.weapons[0]], shop[1][this.weapons[1]], shop[2][this.weapons[2]]];
    }

    BattleInit() {
        this.scheduleOnce(() => { this.countPanel.play(); });
    }

    BattleStart() {
        WGYQ_BattleUI.Instance.bgAni.play();
        this.player.play("playermove");
        this.dogRoot.children[0].getComponent(Animation).play("move");
        this.dogRoot.getComponent(RigidBody2D).linearVelocity = v2(10, 0);
        this.controlPanel.active = true;
    }

    Check() {
        if (!this.controlPanel.active || this.isEnd) return;
        let box = this.dogRoot.getComponent(UITransform).getBoundingBoxToWorld();
        let bgBox = this.canvas.getBoundingBoxToWorld();
        if (!bgBox.intersects(box)) this.Fail();
    }

    JieaoUpdate() {
        if (this.isEnd) return this.unscheduleAllCallbacks();
        this.Jieao += this.level * 2;
    }

    ChangeChat(strs: string[]) {
        for (let i = 0; i < this.chats.children.length; i++) {
            const element = this.chats.children[i].getComponent(Label);
            element.string = "：" + strs[i];
        }
    }

    Attack() {
        let atk: Node = PoolManager.GetNodeByPrefab(this.atkPrefabs[0], this.node);
        atk.getComponent(Animation).play();
        let pos = this.dogRoot.getPosition();
        pos.x -= 60;
        pos.x = Math.max(pos.x, -250);
        this.dogRoot.setPosition(pos);
        this.Jieao -= 5;
        let particle: Node = PoolManager.GetNodeByPrefab(this.hitPrefabs[0], this.node);
        let pos2 = this.dogRoot.getPosition().add(v3(0, 150));
        particle.setPosition(pos2);
        particle.getComponent(Animation).play();
        WGYQ_Audio.Instance.Play(this.clips[2]);
    }

    Fire() {
        if (this.cds[0] > 0) return;
        let atk: Node = PoolManager.GetNodeByPrefab(this.atkPrefabs[1], this.node);
        atk.children[0].getComponent(Sprite).spriteFrame = this.fireSfs[this.weapons[0]];
        let pos = this.player.node.getPosition();
        pos.y = -100;
        atk.setPosition(pos);
        atk.getComponent(Collider2D).enabled = true;
        //@ts-ignore
        if (this.player._crossFade._managedStates[0].state._name != "playerkite") this.player.play("playerfire");
        this.cds[0] = 5;
        this.schedule(() => {
            this.cds[0]--;
        }, 1, 4);
        let cd = this.controlPanel.children[1].children[1].getComponent(Sprite);
        cd.fillRange = 1;
        tween(cd)
            .to(5, { fillRange: 0 })
            .start();
        WGYQ_Audio.Instance.Play(this.clips[2]);
    }

    Kick() {
        if (this.cds[1] > 0) return;
        let atk: Node = PoolManager.GetNodeByPrefab(this.atkPrefabs[2], this.node);
        atk.children[0].getComponent(Sprite).spriteFrame = this.kickSfs[this.weapons[1]];
        let pos = this.player.node.getPosition();
        pos.y = -100;
        atk.setPosition(pos);
        atk.getComponent(Collider2D).enabled = true;
        //@ts-ignore
        if (this.player._crossFade._managedStates[0].state._name != "playerkite") this.player.play("playerkick");
        this.cds[1] = 5;
        this.schedule(() => {
            this.cds[1]--;
        }, 1, 4);
        let cd = this.controlPanel.children[2].children[1].getComponent(Sprite);
        cd.fillRange = 1;
        tween(cd)
            .to(5, { fillRange: 0 })
            .start();
        WGYQ_Audio.Instance.Play(this.clips[2]);
    }

    Kite() {
        if (this.cds[2] > 0) return;
        this.player.play("playerkite");
        this.cds[2] = 5;
        this.schedule(() => {
            this.cds[2]--;
        }, 1, 4);
        let cd = this.controlPanel.children[3].children[1].getComponent(Sprite);
        cd.fillRange = 1;
        tween(cd)
            .to(5, { fillRange: 0 })
            .start();
        WGYQ_Audio.Instance.Play(this.clips[2]);
    }

    KiteHit() {
        this.Hp -= 20;
        this.Jieao -= 30 * (this.weapons[2] + 1) + (this.weaponLevel[2] - 1) * 5;
        let pos = this.dogRoot.getPosition();
        pos.x -= 200;
        pos.x = Math.max(pos.x, -250);
        this.dogRoot.setPosition(pos);
    }

    Win() {
        if (this.isEnd) return;
        this.isEnd = true;
        this.controlPanel.active = false;
        console.log("胜利");
        this.dogRoot.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
        this.dogRoot.children[0].getComponent(Animation).play("bow");
        this.ChangeChat(this.winChat);
        tween(this.player.node)
            .to(1, { position: v3(-150, -300) })
            .call(() => {
                this.player.play("playeridle");
                WGYQ_BattleUI.Instance.bgAni.pause();
            }).start();
        tween(this.dogRoot).to(1, { position: v3(150, -300) }).start();
        this.winPanel.active = true;
        this.rewardPanel.Init();
        WGYQ_GameData.Instance.setNumberData("IsCatch", 1);
        let exp = WGYQ_GameData.Instance.getNumberData("Experience");
        exp += 10;
        let level = WGYQ_GameData.Instance.getNumberData("Level");
        if (exp >= level * 100) {
            exp = 0;
            level++;
        }
        WGYQ_GameData.Instance.setNumberData("Experience", exp);
        WGYQ_GameData.Instance.setNumberData("Level", level);
        WGYQ_BattleUI.Instance.Init();
    }

    Fail() {
        if (this.isEnd) return;
        this.isEnd = true;
        this.controlPanel.active = false;
        console.log("失败");
        if (this.hp == 0) {
            let dog = this.dogRoot.children[0];
            this.dogRoot.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
            dog.getComponent(Animation).play("bow");
            dog.getComponent(Sprite).grayscale = true;
            this.ChangeChat(this.dieChat);
            tween(this.dogRoot)
                .to(1, { position: v3(150, -300) })
                .call(() => {
                    WGYQ_BattleUI.Instance.bgAni.pause();
                }).start();
        }
        else {
            this.ChangeChat(this.runChat);
            WGYQ_BattleUI.Instance.bgAni.pause();
        }
        tween(this.player.node)
            .to(1, { position: v3(-150, -300) })
            .call(() => { this.player.play("playeridle"); }).start();
        this.failPanel.active = true;
        this.rewardPanel.Init();
    }

    DogHit(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isEnd) return;
        if (otherCollider.node.name == "火龙果") {
            this.Hp -= 20;
            this.Jieao -= 35 * (this.weapons[0] + 1) + 5 * (this.weaponLevel[0] - 1);
            let hit: Node = PoolManager.GetNodeByPrefab(this.hitPrefabs[1], this.node);
            let pos = this.dogRoot.getPosition().add(v3(0, 150));
            hit.setPosition(pos);
            hit.getComponent(Animation).play();
            let pos2 = this.dogRoot.getPosition();
            pos2.x -= 60;
            pos2.x = Math.max(pos2.x, -250);
            this.dogRoot.setPosition(pos2);
            this.scheduleOnce(() => { PoolManager.PutNode(otherCollider.node); });
        }
        else if (otherCollider.node.name == "窝心脚") {
            this.Hp -= 30;
            this.Jieao -= 40 * (this.weapons[1] + 1) + 5 * (this.weaponLevel[0] - 1);
            let hit: Node = PoolManager.GetNodeByPrefab(this.hitPrefabs[1], this.node);
            let pos = this.dogRoot.getPosition().add(v3(0, 150));
            hit.setPosition(pos);
            hit.getComponent(Animation).play();
            let pos2 = this.dogRoot.getPosition();
            pos2.x -= 60;
            pos2.x = Math.max(pos2.x, -250);
            this.dogRoot.setPosition(pos2);
            this.scheduleOnce(() => { PoolManager.PutNode(otherCollider.node); });
        }
    }

}


