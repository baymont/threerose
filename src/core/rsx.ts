import Component from './Component';
import IComponentProps from './common/IComponentProps';

declare global {
    export namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends Component<IComponentProps> {}
        interface ElementAttributesProperty {
            props: {};
        }
        interface ElementChildrenAttribute {
            children: {};
        }
        interface IntrinsicAttributes {
            key?: string;
            ref?: (component: Component<IComponentProps>) => void;
        }
        // tslint:enable:no-empty-interface
    }
}

export namespace React {
    export function createElement<T extends Component<TT>, TT>(
        constructorFn: new (key: string, ref: () => T, props: TT) => T,
        attributes: TT,
        child: Component<IComponentProps>
    ) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: Component<IComponentProps>[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }

        const component: Component<TT> = new constructorFn(
            attributes === undefined ? undefined : (<any>attributes).key,
            attributes === undefined ? undefined : (<any>attributes).ref,
            attributes
        );
        children.forEach((child: Component<IComponentProps>) => {
            component.mountChild(child);
        });
        return component;
    }
}
