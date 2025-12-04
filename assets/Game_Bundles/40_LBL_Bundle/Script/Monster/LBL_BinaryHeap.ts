import { LBL_AStarNode } from "./LBL_AStar";

// 二叉堆实现
export class LBL_BinaryHeap {
    private elements: LBL_AStarNode[] = [];
    
    get count(): number {
        return this.elements.length;
    }
    
    push(node: LBL_AStarNode) {
        this.elements.push(node);
        let childIndex = this.elements.length - 1;
        
        while (childIndex > 0) {
            const parentIndex = Math.floor((childIndex - 1) / 2);
            if (this.elements[childIndex].fCost >= this.elements[parentIndex].fCost)
                break;
                
            this.swap(childIndex, parentIndex);
            childIndex = parentIndex;
        }
    }
    
    pop(): LBL_AStarNode | undefined {
        if (this.elements.length === 0) return undefined;
        
        const frontItem = this.elements[0];
        const lastIndex = this.elements.length - 1;
        this.elements[0] = this.elements[lastIndex];
        this.elements.pop();
        
        let parentIndex = 0;
        while (true) {
            const leftChildIndex = 2 * parentIndex + 1;
            const rightChildIndex = 2 * parentIndex + 2;
            let smallestChildIndex = parentIndex;
            
            if (leftChildIndex < this.elements.length && 
                this.elements[leftChildIndex].fCost < this.elements[smallestChildIndex].fCost) {
                smallestChildIndex = leftChildIndex;
            }
            
            if (rightChildIndex < this.elements.length && 
                this.elements[rightChildIndex].fCost < this.elements[smallestChildIndex].fCost) {
                smallestChildIndex = rightChildIndex;
            }
            
            if (smallestChildIndex === parentIndex)
                break;
                
            this.swap(parentIndex, smallestChildIndex);
            parentIndex = smallestChildIndex;
        }
        
        return frontItem;
    }
    
    private swap(index1: number, index2: number) {
        const temp = this.elements[index1];
        this.elements[index1] = this.elements[index2];
        this.elements[index2] = temp;
    }
    
    contains(node: LBL_AStarNode): boolean {
        return this.elements.includes(node);
    }
    
    updateNode(node: LBL_AStarNode) {
        const index = this.elements.indexOf(node);
        if (index === -1) return;
        
        let childIndex = index;
        while (childIndex > 0) {
            const parentIndex = Math.floor((childIndex - 1) / 2);
            if (this.elements[childIndex].fCost >= this.elements[parentIndex].fCost)
                break;
                
            this.swap(childIndex, parentIndex);
            childIndex = parentIndex;
        }
    }
}
