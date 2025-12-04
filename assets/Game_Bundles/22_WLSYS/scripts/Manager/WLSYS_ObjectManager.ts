import { _decorator, Component, Event, instantiate, Node, Prefab, Vec2 } from 'cc';
import Banner from 'db://assets/Scripts/Banner';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('ObjectManager')
export class ObjectManager extends Component {
    instance: ObjectManager = null;


    @property(Prefab)
    straightWirePrefab: Prefab;
    @property(Prefab)
    BatteryPrefab: Prefab;
    @property(Prefab)
    BuldPrefab: Prefab
    @property(Prefab)
    SwitchPrefab: Prefab;

    @property(Node)
    ObjectListParent: Node;

    protected onLoad(): void {
        this.instance = this;
        let straightWire = instantiate(this.straightWirePrefab);
        let Battery = instantiate(this.BatteryPrefab);
        let Buld = instantiate(this.BuldPrefab);
        let SwitchPrefab = instantiate(this.SwitchPrefab);
        straightWire.setParent(this.ObjectListParent.children[0]);
        straightWire.setScale(1.2, 1.2, 1.2);
        straightWire.setPosition(-55, -40, 0);
        Battery.setParent(this.ObjectListParent.children[1]);
        Battery.setScale(1.2, 1.2, 1.2);
        Battery.setPosition(-55, -40, 0);
        Buld.setParent(this.ObjectListParent.children[2]);
        Buld.setScale(1.2, 1.2, 1.2);
        Buld.setPosition(-55, -40, 0);
        SwitchPrefab.setParent(this.ObjectListParent.children[3]);
        SwitchPrefab.setScale(1.2, 1.2, 1.2);
        SwitchPrefab.setPosition(-55, -40, 0);

        ProjectEventManager.emit(ProjectEvent.游戏开始);
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "ReturnButton":
                if (Banner.IsShowServerBundle) {
                    UIManager.ShowPanel(Panel.MoreGamePanel, [true]);
                } else {
                    UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.StartScene]);
                }
                break;
        }
    }


}


