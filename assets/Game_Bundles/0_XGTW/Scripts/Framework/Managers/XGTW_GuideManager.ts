import { _decorator, Component, find, instantiate, Node, Tween } from 'cc';
import { BundleManager } from '../../../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('XGTW_GuideManager')
export default class XGTW_GuideManager extends Component {
    private static guide: Node | null = null;
    public static MoveByLine(lines: Node[], timeGap: number = 0.5, repeatTimes: number = 3, cb: Function = () => { }) {
        if (!lines) return;

        this.Stop();

        switch (lines.length) {
            case 2:
                XGTW_GuideManager.MoveByPoints2(lines, timeGap, repeatTimes, cb);
                break;
            case 3:
                XGTW_GuideManager.MoveByPoints3(lines, timeGap, repeatTimes);
                break;
            case 4:
                XGTW_GuideManager.MoveByPoints4(lines, timeGap, repeatTimes);
                break;
            default:
                if (lines.length > 4) {
                    console.error("节点长度超过4");
                    lines = [lines[0], lines[1], lines[2], lines[3]];
                    XGTW_GuideManager.MoveByPoints4(lines, timeGap, repeatTimes);
                }
                break;
        }
    }
    public static Stop() {
        if (!this.guide) return;
        Tween.stopAllByTarget(this.guide);
        this.guide.active = false;
    }
    private static MoveByPoints2(lines: Node[], timeGap: number = 0.5, repeatTimes: number = 3, cb: Function = () => { }) {
        const canvas = find("Canvas");
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "小手").then((prefab) => {
            let node = instantiate(prefab) as Node;
            this.guide = node;
            Show(node);
        });

        function Show(node: Node): void {
            node.setParent(canvas);
            node.active = true;
            // node.opacity = 0;
            // node.setPosition(ZTool_Mtr.GetPosition(canvas, lines[0]));

            // let tween = cc.tween(node)
            //     .to(timeGap * 0.5, { opacity: 255 })
            //     .to(timeGap, { position: cc.v3(ZTool.GetPosition(canvas, lines[1])) })
            //     .to(timeGap, { opacity: 0 })
            //     .call(() => { node.setPosition(ZTool.GetPosition(canvas, lines[0])); })
            //     .delay(timeGap);

            // cc.tween(node).repeat(repeatTimes, tween).call(() => {
            //     node.active = false;
            //     cb && cb();
            // }).start();
        }
    }
    private static MoveByPoints3(lines: Node[], timeGap: number = 0.5, repeatTimes: number = 3) {
        // const canvas = cc.find("Canvas");
        // ResourceUtil.LoadPrefab("小手").then((prefab) => {
        // let node = cc.instantiate(prefab) as cc.Node;
        // node.setParent(cc.find("Canvas"));
        // node.opacity = 0;

        // let positions = [];
        // lines.forEach(e => { positions.push(ZTool.GetPosition(canvas, e)); });
        // node.setPosition(positions[0]);

        // let timerGap2 = cc.Vec3.distance(positions[1], positions[2]) / cc.Vec3.distance(positions[0], positions[1]) * timeGap;
        // let tween = cc.tween(node)
        // .to(timeGap * 0.5, { opacity: 255 })
        // .to(timeGap, { position: cc.v3(positions[1]) })
        // .to(timerGap2, { position: cc.v3(positions[2]) })
        // .to(timeGap, { opacity: 0 })
        // .call(() => { node.setPosition(positions[0]); })
        // .delay(timeGap);

        // cc.tween(node).repeat(repeatTimes, tween).call(() => { node.destroy(); }).start();
        // });
    }
    private static MoveByPoints4(lines: Node[], timeGap: number = 0.5, repeatTimes: number = 3) {
        // const canvas = cc.find("Canvas");
        // ResourceUtil.LoadPrefab("小手").then((prefab) => {
        // let node = cc.instantiate(prefab) as cc.Node;
        // node.setParent(cc.find("Canvas"));
        // node.opacity = 0;

        // let positions = [];
        // lines.forEach(e => { positions.push(ZTool.GetPosition(canvas, e)); });
        // node.setPosition(positions[0]);

        // let timerGap2 = cc.Vec2.distance(positions[1], positions[2]) / cc.Vec2.distance(positions[0], positions[1]) * timeGap;
        // let timerGap3 = cc.Vec2.distance(positions[2], positions[3]) / cc.Vec2.distance(positions[0], positions[1]) * timeGap;
        // let tween = cc.tween(node)
        // .to(timeGap * 0.5, { opacity: 255 })
        // .to(timeGap, { position: cc.v3(positions[1]) })
        // .to(timerGap2, { position: cc.v3(positions[2]) })
        // .to(timerGap3, { position: cc.v3(positions[3]) })
        // .to(timeGap, { opacity: 0 })
        // .call(() => { node.setPosition(positions[0]); })
        // .delay(timeGap);

        // cc.tween(node).repeat(repeatTimes, tween).call(() => { node.destroy(); }).start();
        // });
    }
}