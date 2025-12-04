import { _decorator, BoxCollider2D, Component, ERigidBody2DType, Layers, Node, PhysicsSystem2D, RigidBody2D, TiledMap, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Map')
export class WGYQ_Map extends Component {

    private static instance: WGYQ_Map;
    public static get Instance(): WGYQ_Map {
        return this.instance;
    }

    @property(TiledMap)
    map: TiledMap;

    protected onLoad(): void {
        WGYQ_Map.instance = this;
    }

    start() {
        this.setColliders();
    }

    update(deltaTime: number) {
    }

    setColliders() {
        let tiledSize = this.map.getTileSize();
        let layer = this.map.getLayer('Obstacle');
        let layerSize = layer.getLayerSize();

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tiled = layer.getTiledTileAt(i, j, true);
                tiled.node.layer = this.node.layer;
                if (tiled.grid != 0) {
                    let rig = tiled.node.addComponent(RigidBody2D);
                    rig.gravityScale = 0;
                    rig.type = ERigidBody2DType.Static;
                    let collider = tiled.node.addComponent(BoxCollider2D);

                    collider.offset = new Vec2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }
    }

}


