import Component from '../core/Component';

export interface ISpinningProps {
  clockwise?: boolean;
  speed?: number;
}

export default class Spinning extends Component<ISpinningProps> {
    constructor(props: ISpinningProps = { clockwise: true, speed: 0.005 }) {
        super(props);
    }

    public tick() {
        this.context.node.rotation.y +=
            (this.props.clockwise ? 1 : -1) * Math.abs(this.props.speed);
    }
}
