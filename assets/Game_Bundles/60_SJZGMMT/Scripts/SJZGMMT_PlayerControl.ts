import { _decorator, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D, Sprite, tween, v3, Vec3 } from 'cc';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_PlayerSkeleton, SJZGMMT_PlayerSkeletonName } from './SJZGMMT_PlayerSkeleton';
import { SJZGMMT_Unit } from './SJZGMMT_Unit';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_vessel } from './SJZGMMT_vessel';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_GameManager } from './SJZGMMT_GameManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_PlayerControl')
export class SJZGMMT_PlayerControl extends Component {
    private _dir: Vec3 = v3(0, 0, 0);

    public UnitData: SJZGMMT_Unit = null;
    public anchoringVessel: SJZGMMT_vessel = null;//锚定的容器
    public anchoringNode = null;//可交互对象
    public anchoringName: string = "";//锚定对象名

    private PlayerSkeleton: SJZGMMT_PlayerSkeleton = null;//
    private AnimationNode: Node = null;
    private collider: Collider2D = null;
    private rg: RigidBody2D = null;
    protected onLoad(): void {
        this.PlayerSkeleton = this.node.getChildByName("动画").getComponent(SJZGMMT_PlayerSkeleton);
        this.UnitData = this.node.getComponent(SJZGMMT_Unit);
        this.AnimationNode = this.node.getChildByName("动画")
        this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.直升机出场, false, () => {
            this.SetPlayerState(0);
            director.getScene().emit(SJZGMMT_EventManager.主角准备就绪);
            //装备武器
            this.UnitData.EquipWeapon(SJZGMMT_GameData.Instance.PlayerData[0]);
        });
    }
    start() {
        this.InitData();
        if (SJZGMMT_GameData.Instance.GameData[4] == 0) {
            this.UnitData.AddBuff("防御力增加", 100000000, 100000000);
        }
        this.collider = this.node.getComponent(Collider2D);
        this.rg = this.node.getComponent(RigidBody2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);//添加碰撞监听
        director.getScene().on(SJZGMMT_EventManager.单位死亡, this.Die, this);
        this.schedule(() => {//主角寻敌逻辑0.1秒计算一次
            if (this.UnitData.EnemyArray.length > 0) {
                this.UnitData.FindLockEnemy();
            }
        }, 0.1)
        this.node.getChildByName("血条").active = false;
        this.node.getChildByName("子弹条").active = false;
        this.scheduleOnce(() => {
            this.node.getChildByName("血条").active = true;
            this.node.getChildByName("子弹条").active = true;
        }, 3)
    }
    //初始化数据
    InitData() {
        director.getScene().on(SJZGMMT_EventManager.MOVEMENT, this.onMove, this);
        director.getScene().on(SJZGMMT_EventManager.MOVEMENT_STOP, this.onStopMove, this);
        director.getScene().on(SJZGMMT_EventManager.FIRE_START, this.FIRE_START, this);
        director.getScene().on(SJZGMMT_EventManager.FIRE_STOP, this.FIRE_STOP, this);
        director.getScene().on(SJZGMMT_EventManager.主角换弹, this.ShowChangeUI, this);
        director.getScene().on(SJZGMMT_EventManager.主角滑铲, this.Slide, this);
        director.getScene().on(SJZGMMT_EventManager.释放摸金罗盘, this.Skill_LP, this);
        this.scheduleOnce(() => {//动态加载延迟注册
            director.getScene().on(SJZGMMT_EventManager.换弹键按下, () => {
                if (!this.UnitData.IsBlock) {
                    this.UnitData.Weapon.Reload();
                }
            });
        }, 3)
        director.getScene().on(SJZGMMT_EventManager.点击打开按钮, this.Interaction, this);
        director.getScene().on(SJZGMMT_EventManager.攻击模式切换, this.ChangeFindModle, this);

        director.getScene().on(SJZGMMT_EventManager.通用摇杆移动, this.onJoyStickMove, this);
        director.getScene().on(SJZGMMT_EventManager.通用摇杆停止, this.onJoyStickStop, this);
        director.getScene().on(SJZGMMT_EventManager.主角使用血包, this.StartTreat, this);
        director.getScene().on(SJZGMMT_EventManager.主角复活, this.Revive, this);
        //初始化主角数据
        //干员加成
        let Agentdata = SJZGMMT_Constant.getAgentDataByName(SJZGMMT_GameData.Instance.AgentSelect);
        let AgentLevel: number = SJZGMMT_GameData.Instance.GetAgentLevelByName(SJZGMMT_GameData.Instance.AgentSelect);
        this.UnitData.Hp = 500 + (Agentdata.生命 * (1 + AgentLevel * 0.1));
        this.UnitData.MaxHp = 500 + (Agentdata.生命 * (1 + AgentLevel * 0.1));
        this.UnitData.Attack = 80 + (Agentdata.攻击 * (1 + AgentLevel * 0.1));
        this.UnitData.Defensive = 0 + (Agentdata.护甲 * (1 + AgentLevel * 0.1));
        //研究所加成
        this.UnitData.Hp += SJZGMMT_Constant.LaboratoryLevelData[0][SJZGMMT_GameData.Instance.LaboratoryLevel[0]];
        this.UnitData.MaxHp += SJZGMMT_Constant.LaboratoryLevelData[0][SJZGMMT_GameData.Instance.LaboratoryLevel[0]];
        this.UnitData.Attack += SJZGMMT_Constant.LaboratoryLevelData[1][SJZGMMT_GameData.Instance.LaboratoryLevel[1]]
        //装备加成
        if (SJZGMMT_GameData.Instance.PlayerData[1] != "无") {
            this.UnitData.Hp += SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.PlayerData[1]).property;
            this.UnitData.MaxHp += SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.PlayerData[1]).property;
        }
        if (SJZGMMT_GameData.Instance.PlayerData[2] != "无") {
            this.UnitData.Defensive += SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.PlayerData[2]).property;
        }
        //皮肤加成  
        let hp = SJZGMMT_Constant.getSkinDataByName(SJZGMMT_GameData.Instance.Skin).AddHP;
        this.UnitData.Hp += hp;
        this.UnitData.MaxHp += hp;
        //针剂效果
        switch (SJZGMMT_GameData.Instance.Enhance) {
            case "生命针": this.UnitData.Hp += 500; this.UnitData.MaxHp += 500; SJZGMMT_GameData.Instance.Enhance = "无"; break;
            case "防御针": this.UnitData.Defensive += 50; SJZGMMT_GameData.Instance.Enhance = "无"; break;
            case "攻击针": this.UnitData.Attack += 50; SJZGMMT_GameData.Instance.Enhance = "无"; break;
            case "移速针": this.UnitData.moveSpeed *= 1.2; SJZGMMT_GameData.Instance.Enhance = "无"; break;
        }
        //被动技能加成
        switch (SJZGMMT_GameData.Instance.AgentSelect) {
            case "游侠": this.UnitData.moveSpeed *= 1.1; break;
            case "巫医": this.schedule(() => {
                if (this.UnitData.UnitState != 3) {
                    this.UnitData.AddHP(5);
                }
            }, 1); break;
            case "先锋": director.getScene().emit(SJZGMMT_EventManager.重置滑铲CD, -1); break;
            case "道士": this.UnitData.Defensive *= 1.1; break;
        }
    }

    //进入碰撞
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZGMMT_Constant.Group.Interact) {//互动层
            if (otherCollider.node.getComponent(SJZGMMT_vessel)) {//容器
                this.anchoringVessel = otherCollider.node.getComponent(SJZGMMT_vessel);
                this.anchoringName = otherCollider.node.name;
                director.getScene().emit(SJZGMMT_EventManager.进入容器范围, otherCollider.node);
            }
            if (otherCollider.node.name == "撤离点") {//撤离点
                director.getScene().emit(SJZGMMT_EventManager.进入撤离点);
            }
            if (otherCollider.node.name == "青铜门") {//青铜门
                this.anchoringNode = otherCollider.node;
                director.getScene().emit(SJZGMMT_EventManager.进入青铜门范围, otherCollider.node);
            }
        }
    }
    //离开碰撞
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZGMMT_Constant.Group.Interact) {//互动层
            if (otherCollider.node.getComponent(SJZGMMT_vessel) && this.anchoringVessel == otherCollider.node.getComponent(SJZGMMT_vessel)) {//容器
                this.anchoringVessel = null;
                this.anchoringName = "";
                director.getScene().emit(SJZGMMT_EventManager.离开容器范围, otherCollider.node);
            }
            if (otherCollider.node.name == "撤离点") {//撤离点
                director.getScene().emit(SJZGMMT_EventManager.离开撤离点);
            }
            if (otherCollider.node.name == "青铜门") {//青铜门
                this.anchoringNode = null;
                director.getScene().emit(SJZGMMT_EventManager.离开青铜门范围);
            }
        }
    }



    onMove(Dir: Vec3) {
        if (this.UnitData.UnitState == 3) return;
        this._dir = v3(Dir.x, Dir.y, 0);
        if (Dir.x < 0) {
            this.UnitData.SetOrientation(true);
        } else if (Dir.x > 0) {
            this.UnitData.SetOrientation(false);
        }
        if (this.UnitData.UnitState == 0) {
            this.SetPlayerState(1);
        }
    }

    onStopMove() {
        this._dir = v3(0, 0, 0);
        if (this.UnitData.UnitState == 1) {
            this.SetPlayerState(0);
        }
    }

    update(deltaTime: number) {
        if (this.UnitData.UnitState == 1 || this.UnitData.UnitState == 2) {
            let offset = v3(this._dir.x * this.UnitData.moveSpeed * deltaTime, this._dir.y * this.UnitData.moveSpeed * deltaTime);
            this.node.position = this.node.position.add(offset);
        }


    }



    //设置主角转态
    SetPlayerState(state: number) {
        if (this.UnitData.UnitState == state) {
            return;
        }
        this.UnitData.UnitState = state;
        switch (this.UnitData.UnitState) {
            case 0: this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.待机); break;
            case 1: this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.跑); break;
            case 2: this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.滑铲, false, () => {
                this.SetPlayerState(0);
            }); break;
            case 3:
                this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.死亡, false, () => {
                    SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.DeadPanel);
                });
                this.onStopMove();
                break;
            case 4: this.PlayerSkeleton.ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.释放摸金罗盘, false, () => {
                SJZGMMT_GameManager.Instance.ShowNearbyContainer(this.node.worldPosition, 750);
                this.SetPlayerState(0);
            });
                SJZGMMT_AudioManager.globalAudioPlay("乾坤借法");
                break;
        }
    }
    //攻击按下
    FIRE_START(Havedirection: boolean, direction?: Vec3) {
        this.UnitData.FIRE_START(Havedirection, direction);
    }
    //攻击抬起
    FIRE_STOP() {
        this.UnitData.FIRE_STOP();
    }

    //显示换弹UI
    ShowChangeUI(time: number) {
        let nd = this.node.getChildByName("换弹");
        nd.getChildByName("加载条").getComponent(Sprite).fillRange = 0;
        nd.active = true;
        tween(nd.getChildByName("加载条").getComponent(Sprite))
            .to(time, { fillRange: 1 })
            .call(() => { nd.active = false; })
            .start();
    }


    //滑铲
    Slide() {
        if (this.UnitData.UnitState == 3) return;
        this.UnitData.AddBuff("增加移速", 1000, 0.54);
        this.SetPlayerState(2);
    }
    //罗盘释放
    Skill_LP() {
        if (this.UnitData.UnitState == 3) return;
        this.SetPlayerState(4);
    }
    //交互
    Interaction() {
        this.onStopMove();
        if (this.anchoringName == "鸟窝" || this.anchoringName == "蓝色小保险" || this.anchoringName == "航天箱"
            || this.anchoringName == "纸箱" || this.anchoringName == "木箱" || this.anchoringName == "敌人掉落箱子"
            || this.anchoringName == "boss箱子"
        ) {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.KnapsackPanel, [this.anchoringVessel.vesselData]);
            this.anchoringVessel.SetHalfBlack();
        }
        //特殊箱子
        if (this.anchoringName == "密码保险箱") {
            if (this.anchoringVessel.IsLock) {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.KnapsackPanel, [this.anchoringVessel.vesselData]);
                this.anchoringVessel.SetHalfBlack();
            } else {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.OfficePanel, [() => {
                    SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.KnapsackPanel, [this.anchoringVessel?.vesselData]);
                    this.anchoringVessel?.SetHalfBlack();
                }]);
            }
        }
        //青铜门
        if (this.anchoringNode?.name == "青铜门") {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.OfficePanel2, [() => {
                if (this.anchoringNode) {
                    this.anchoringNode.active = false;
                }
            }]);
        }
    }

    //更改索敌模式
    public ChangeFindModle(modle: number) {
        this.UnitData.setFindModle(modle);
    }

    //通用摇杆事件
    public onJoyStickMove(Name: string, Dir: Vec3) {
        if (Name == "攻击摇杆") {
            this.onAttackJoyStickMove(true, Dir);
        }
    }
    //通用摇杆事件
    public onJoyStickStop(Name: string) {
        if (Name == "攻击摇杆") {
            this.onAttackJoyStickStop();
        }
    }


    //攻击摇杆移动
    public onAttackJoyStickMove(Havedirection: boolean, direction?: Vec3) {
        this.UnitData.FIRE_START(Havedirection, direction);
    }
    //攻击摇杆停止
    public onAttackJoyStickStop() {
        this.UnitData.FIRE_STOP();
    }
    //使用血包
    StartTreat(id: number) {
        switch (id) {
            case 0:
                this.UnitData.StartTreat(10, 3);
                break;
            case 1:
                this.UnitData.StartTreat(25, 2);
                break;
            case 2:
                this.UnitData.StartTreat(50, 1);
                break;
        }
    }


    //死亡事件
    Die(nd: Node) {
        if (nd == this.node) {
            this.SetPlayerState(3);
            ProjectEventManager.emit(ProjectEvent.游戏结束, "三角洲古墓迷途")
        }
    }
    //复活
    public Revive() {
        this.UnitData.Hp = this.UnitData.MaxHp;
        SJZGMMT_UIManager.Instance.ShowText("复活成功！获得3秒无敌！");
        this.UnitData.AddBuff("防御力增加", 9999999999, 3);
        this.SetPlayerState(0);
    }
}


