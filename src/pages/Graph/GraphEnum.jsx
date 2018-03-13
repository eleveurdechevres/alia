class GraphType {

    constructor() {
        GraphType.RED = new Color('RED');
        GraphType.GREEN = new Color('GREEN');
        GraphType.BLUE = new Color('BLUE');
    }

    toString() {
        return `Color.${this.name}`;
    }
}
