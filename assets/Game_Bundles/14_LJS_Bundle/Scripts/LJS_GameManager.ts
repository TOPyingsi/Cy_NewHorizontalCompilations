import { _decorator, Component, JsonAsset, Node, PhysicsSystem2D } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('LJS_GameManager')
export class LJS_GameManager extends Component {

    private static recipes: { inputs: string[], output: string }[] = [];
    private static unlockedElements: Set<string> = new Set(["火", "空气", "水", "土"]);

    onLoad() {
        this.loadRecipes();
        PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
    }


    private loadRecipes() {

        BundleManager.LoadJson("14_LJS_Bundle", "LJS_PeiFang").then((JsonAsset: JsonAsset) => {
            for (let i = 0; i < 49; i++) {
                LJS_GameManager.recipes.push(JsonAsset.json[i])
            }
        });
    }

    public static getRecipes(): { inputs: string[], output: string }[] {
        return this.recipes;
    }

    public static getUnlockedElements(): Set<string> {
        return this.unlockedElements;
    }

    public static unlockElement(element: string) {
        this.unlockedElements.add(element);
    }
}


