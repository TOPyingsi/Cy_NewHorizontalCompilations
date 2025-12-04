import { _decorator, Component, Vec2, v2, Node, RigidBody2D, Collider2D, v3, misc, Prefab, instantiate, PhysicsSystem2D, } from "cc";
import { TLWLSJ_MapCamera } from "./TLWLSJ_MapCamera";
import { TLWLSJ_Weapon } from "./TLWLSJ_Weapon";
import { TLWLSJ_GameWeapon } from "./TLWLSJ_GameWeapon";
import { TLWLSJ_GameData } from "./TLWLSJ_GameData";
import { TLWLSJ_GameManager } from "./TLWLSJ_GameManager";
import { TLWLSJ_UIManager } from "./TLWLSJ_UIManager";
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from "./TLWLSJ_EventManager";
import { TLWLSJ_Tool } from "./TLWLSJ_Tool";
import { TLWLSJ_PrefsManager } from "./TLWLSJPrefsManager";
import { PROPS, TLWLSJ_WEAPON } from "./TLWLSJ_Constant";
import { BundleManager } from "../../../Scripts/Framework/Managers/BundleManager";
import { GameManager } from "../../../Scripts/GameManager";

const { ccclass, property } = _decorator;

@ccclass("TLWLSJ_PlayerController")
export default class TLWLSJ_PlayerController extends Component {
  public static Instance: TLWLSJ_PlayerController = null;
  static MAXHP = 1000;
  static oriPosition: Vec2 = v2();

  rigidbody: RigidBody2D = null;
  collider: Collider2D = null;

  x: number = 0;
  y: number = 0;

  isCooldown: boolean = true; //射击冷却
  isReload: boolean = false; //换弹
  cooldownTimer: number = 0;
  harm: number = 0;
  armorPenetration: number = 0;
  maxSpeed: number = 50;
  speed: number = 50;

  CurHp: number = 0;


  Weapon: Node = null;
  WeaponData: TLWLSJ_Weapon = null;
  WeaponTs: TLWLSJ_GameWeapon = null;

  DirX: number = 1;
  DirY: number = -0.1;

  IsRecoil: boolean = false;

  onLoad() {
    TLWLSJ_PlayerController.Instance = this;
    this.rigidbody = this.node.getComponent(RigidBody2D);
    this.collider = this.node.getComponent(Collider2D);

    PhysicsSystem2D.instance.enable = true;
    // PhysicsSystem2D.instance.debugDrawFlags = 1;


    this.Weapon = this.node.getChildByName("武器");
  }

  start() {
    TLWLSJ_MapCamera.Instance.Target = this.node;
    this.CurHp = TLWLSJ_PlayerController.MAXHP;
  }

  showWeapon() {
    const weaponName: string = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, TLWLSJ_PrefsManager.Instance.userData.CurWeapon);
    this.WeaponData = TLWLSJ_GameData.getWeaponByName(weaponName);
    this.cooldownTimer = this.WeaponData.CoolingTime;
    this.harm = this.WeaponData.Harm;
    this.armorPenetration = this.WeaponData.ArmorPenetration;
    this.Weapon.removeAllChildren();
    const path = `武器_${weaponName}`;
    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
      const weapon: Node = instantiate(prefab);
      weapon.parent = this.Weapon;
    }
    )
  }

  SetMoveDir(x: number, y: number, rate: number) {
    this.x = x;
    this.y = y;
    this.speed = this.maxSpeed * rate;
  }

  SetPlayerDir(x: number, y: number) {
    this.DirX = x;
    this.DirY = y;
    this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);

    let angleRadians = Math.atan2(y, x);
    let angleDegrees = misc.radiansToDegrees(angleRadians);

    this.Weapon.angle =
      (angleDegrees > 90 && angleDegrees <= 180) ||
        (angleDegrees < -90 && angleDegrees >= -180)
        ? 180 - angleDegrees
        : angleDegrees;
  }

  StopMove() {
    this.x = 0;
    this.y = 0;
    if (this.rigidbody.enabled) {
      this.rigidbody.linearVelocity = v2(this.x, this.y);
    }
  }

  update(dt) {
    if (this.rigidbody.enabled && !this.IsRecoil) {
      this.rigidbody.linearVelocity = v2(
        this.x * this.speed,
        this.y * this.speed
      );
    }
  }

  // 施加后坐力的方法
  applyRecoil(recoilStrength: number) {
    // if (!this.rigidbody || this.IsRecoil) return;
    if (this.IsRecoil) return;
    this.IsRecoil = true;
    this.rigidbody.linearVelocity = v2(0, 0);
    const direction: Vec2 = v2(this.DirX, this.DirY).normalize();
    // 施加冲量（impulse）模拟后坐力
    const recoilImpulse = direction.multiplyScalar(-recoilStrength);
    this.rigidbody.applyForceToCenter(recoilImpulse, true);
  }
  retrogress() { }

  hit(harm: number) {
    this.CurHp -= harm;
    if (this.CurHp <= 0) {
      this.CurHp = 0;
      TLWLSJ_GameManager.Instance.IsPause = true;
      TLWLSJ_UIManager.Instance.showTips("玩家死亡，游戏失败！", () => {
        TLWLSJ_GameManager.Instance.gameFail();
      });
      //玩家死亡
    } else if (this.CurHp <= 200) {
      //玩家濒死状态
      TLWLSJ_UIManager.Instance.showAgonalStaged();
    } else {
      // UIManager.Instance.closeAgonalStaged();
      TLWLSJ_UIManager.Instance.showAgonalStagedOnce();
    }
    TLWLSJ_UIManager.Instance.setHPFillRange(this.CurHp / TLWLSJ_PlayerController.MAXHP);
  }

  cure(hp: number = TLWLSJ_PlayerController.MAXHP) {
    this.CurHp += hp;
    this.CurHp = TLWLSJ_Tool.Clamp(this.CurHp, 0, TLWLSJ_PlayerController.MAXHP);
    if (this.CurHp > 200) {
      //玩家濒死状态
      TLWLSJ_UIManager.Instance.closeAgonalStaged();
    }
    TLWLSJ_UIManager.Instance.setHPFillRange(this.CurHp / TLWLSJ_PlayerController.MAXHP);
  }

  propCure(type: PROPS) {
    if (type == PROPS.药丸) {
      this.cure(200);
    } else if (type == PROPS.咖啡) {
      this.cure(800);
    }
  }

  isCure() {
    if (this.CurHp >= TLWLSJ_PlayerController.MAXHP) return false;
    return true;
  }

  protected onEnable(): void {
    TLWLSJ_EventManager.Scene.on(TLWLSJ_MyEvent.TLWLSJ_MOVEMENT, this.SetMoveDir, this);
    TLWLSJ_EventManager.Scene.on(TLWLSJ_MyEvent.TLWLSJ_MOVEMENT_STOP, this.StopMove, this);
    TLWLSJ_EventManager.Scene.on(TLWLSJ_MyEvent.TLWLSJ_SET_ATTACK_DIR, this.SetPlayerDir, this);
  }

  protected onDisable(): void {
    TLWLSJ_EventManager.Scene.off(TLWLSJ_MyEvent.TLWLSJ_MOVEMENT, this.SetMoveDir, this);
    TLWLSJ_EventManager.Scene.off(TLWLSJ_MyEvent.TLWLSJ_MOVEMENT_STOP, this.StopMove, this);
    TLWLSJ_EventManager.Scene.off(TLWLSJ_MyEvent.TLWLSJ_SET_ATTACK_DIR, this.SetPlayerDir, this);
  }

  //#region 玩家数值
}
