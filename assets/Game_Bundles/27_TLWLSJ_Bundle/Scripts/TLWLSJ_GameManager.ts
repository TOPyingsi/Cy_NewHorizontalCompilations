import { _decorator, Component, director, find, instantiate, Node, Prefab } from "cc";
import { TLWLSJ_Panel } from "./TLWLSJ_Panel";
import { TLWLSJ_BlankScreen } from "./TLWLSJ_BlankScreen";
import TLWLSJ_PlayerController from "./TLWLSJ_PlayerController";
import { TLWLSJ_MapController } from "./TLWLSJ_MapController";
import { TLWLSJ_TipsController } from "./TLWLSJ_TipsController";
import { Audios, TLWLSJ_AudioManager } from "./TLWLSJ_AudioManager";
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from "./TLWLSJ_EventManager";
import { TLWLSJ_Tool } from "./TLWLSJ_Tool";
import { TLWLSJ_PrefsManager } from "./TLWLSJPrefsManager";
import { TLWLSJ_GameMapName, TLWLSJ_MAP } from "./TLWLSJ_Constant";
import { BundleManager } from "../../../Scripts/Framework/Managers/BundleManager";
import { GameManager } from "../../../Scripts/GameManager";
import { ProjectEvent, ProjectEventManager } from "../../../Scripts/Framework/Managers/ProjectEventManager";
import { Panel, UIManager } from "../../../Scripts/Framework/Managers/UIManager";
const { ccclass, property } = _decorator;

@ccclass("TLWLSJ_GameManager")
export class TLWLSJ_GameManager extends Component {
  public static Instance: TLWLSJ_GameManager = null;

  @property(Node)
  MoreGameBtn: Node = null;

  @property(Node)
  BackpackPanel: Node = null;

  @property(Node)
  ShopPanel: Node = null;

  @property(Node)
  Canvas: Node = null;

  @property(Node)
  BulletLayout: Node = null;

  @property(Node)
  EnemyLayout: Node = null

  @property(Node)
  MapLayout: Node = null

  @property(Node)
  PackButton: Node = null;

  IsRecharge: boolean = false;
  IsPause: boolean = false;
  private _isClick: boolean = false;
  private _isClick2: boolean = false;

  protected onLoad(): void {
    TLWLSJ_GameManager.Instance = this;
    TLWLSJ_AudioManager.PlayMusic(Audios.BGM);
    ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGameBtn);
  }

  protected start(): void {
    this.loadMap("", true);
  }

  backpackBtn() {
    TLWLSJ_AudioManager.PlaySound(Audios.Open);
    this.IsPause = true;
    this.BackpackPanel.active = true;
    if (TLWLSJ_TipsController.Instance.IsPack && !this._isClick && TLWLSJ_TipsController.Instance.IsPackStart) {
      this._isClick = true;
      TLWLSJ_TipsController.Instance.nextTips2D(0);
    }
  }

  closeBackpack() {
    TLWLSJ_AudioManager.PlaySound(Audios.Open);
    this.IsPause = false;
    this.close(this.BackpackPanel);
    if (TLWLSJ_TipsController.Instance.IsPack && !this._isClick2 && TLWLSJ_TipsController.Instance.IsPackStart) {
      this._isClick2 = true;
      TLWLSJ_TipsController.Instance.nextTips2D(4);
    }
  }

  shopBtn() {
    TLWLSJ_AudioManager.PlaySound(Audios.Open);
    this.IsPause = true;
    this.ShopPanel.active = true;
  }

  closeShop() {
    TLWLSJ_AudioManager.PlaySound(Audios.Open);
    this.IsPause = false;
    this.close(this.ShopPanel);
    TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_UPDATESLD);
  }

  close(panel: Node) {
    panel.getComponent(TLWLSJ_Panel).close(() => {
      panel.active = false;
    });
  }

  show() {
    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "过渡黑屏").then(
      (prefab: Prefab) => {
        const node: Node = instantiate(prefab);
        node.parent = this.Canvas;
        node.getComponent(TLWLSJ_BlankScreen).show();
      }
    );
  }

  loadMap(name: string = "", isFirst: boolean = false) {
    if (!isFirst) {
      BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "加载中").then((prefab: Prefab) => {
        const panel = instantiate(prefab);
        panel.parent = this.Canvas;
      })
    }
    if (name === "") name = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_MAP, TLWLSJ_PrefsManager.Instance.userData.CurMap);
    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${name}`).then((prefab: Prefab) => {
      this.EnemyLayout.removeAllChildren();
      const map = instantiate(prefab);
      this.MapLayout.removeAllChildren();
      map.parent = this.MapLayout;
      TLWLSJ_PlayerController.Instance.node.setWorldPosition(map.getComponent(TLWLSJ_MapController).getPlayerInitPos());
      if (TLWLSJ_MapController.Instance.IsMAP1) {
        TLWLSJ_PlayerController.MAXHP = 9999;
        TLWLSJ_PlayerController.Instance.CurHp = TLWLSJ_PlayerController.MAXHP;
      } else {
        TLWLSJ_PlayerController.MAXHP = 1000;
      }
    })
  }

  nextMap() {
    TLWLSJ_PrefsManager.Instance.userData.CurMap = TLWLSJ_Tool.getAdjacentEnumCirculation(TLWLSJ_MAP, TLWLSJ_PrefsManager.Instance.userData.CurMap);
    TLWLSJ_PrefsManager.Instance.saveData();
    this.loadMap();
  }

  startGame() {
    this.IsPause = false;
    const gameMapName: string = TLWLSJ_GameMapName[TLWLSJ_PrefsManager.Instance.userData.CurMap];
    this.loadMap(gameMapName);
  }

  gameFail() {
    this.IsPause = true; ''
    this.loadMap();
    TLWLSJ_PlayerController.Instance.cure();
  }

  backBtn() {
    ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
      UIManager.ShowPanel(Panel.LoadingPanel, GameManager.GameData.startScene, () => {
        ProjectEventManager.emit(ProjectEvent.返回主页, "逃离物理试卷");
      })
    })
  }
}
