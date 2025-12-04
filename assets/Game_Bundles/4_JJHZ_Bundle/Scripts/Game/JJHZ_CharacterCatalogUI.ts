import { _decorator, Component, Event, Node, Sprite, Tween, tween, v3 } from 'cc';
import { JJHZ_CatalogButton } from './JJHZ_CatalogButton';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { JJHZ_CardData } from './JJHZ_CardData';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_CharacterCatalogUI')
export class JJHZ_CharacterCatalogUI extends Component {

    @property(Node)
    content: Node;

    protected onLoad(): void {
        for (let i = 0; i < JJHZ_CatalogButton.cards.length; i++) {
            const element = JJHZ_CatalogButton.cards[i];
            let card = this.content.children[i];
            card.children[0].getComponent(Sprite).spriteFrame = element;
        }
    }

    protected onEnable(): void {
        var data = JJHZ_CardData.Cards;
        for (let i = 0; i < this.content.children.length; i++) {
            const element = this.content.children[i];
            element.children[1].active = data[i] == 0;
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Page(event: Event) {
        var node: Node = event.target;
        var num = node.getSiblingIndex();
        Tween.stopAllByTarget(this.content);
        tween(this.content)
            .to(0.5, { position: v3(num == 0 ? 0 : -1294, 0) })
            .start();
    }

    Close() {
        PoolManager.PutNode(this.node);
    }
}


