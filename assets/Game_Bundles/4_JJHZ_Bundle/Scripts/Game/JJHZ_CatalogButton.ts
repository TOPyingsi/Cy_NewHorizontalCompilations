import { _decorator, assetManager, Component, find, Node, Prefab, SpriteFrame } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_CatalogButton')
export class JJHZ_CatalogButton extends Component {

    private static instance: JJHZ_CatalogButton;
    static catalogUIs: Prefab[] = [];
    static cards: SpriteFrame[] = [];


    public static get Instance(): JJHZ_CatalogButton {
        return this.instance;
    }

    protected onLoad(): void {
        JJHZ_CatalogButton.instance = this;
    }

    start() {
        PoolManager.GetNodeByPrefab(JJHZ_CatalogButton.catalogUIs.find((value, index, obj) => {
            return value.name == "CharacterClearUI";
        }), find("Canvas"));
    }

    update(deltaTime: number) {

    }

    OpenCatalog() {
        PoolManager.GetNodeByPrefab(JJHZ_CatalogButton.catalogUIs.find((value, index, obj) => {
            return value.name == "CharacterCatalogUI";
        }), find("Canvas"));
    }
}


