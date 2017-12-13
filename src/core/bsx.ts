import BComponent from './BComponent';
import IComponentProps from './common/IComponentProps';

declare global {
    export namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends BComponent<IComponentProps> { }
        interface ElementAttributesProperty { props: {}; }
        interface ElementChildrenAttribute { children: {}; }
        interface IntrinsicAttributes {
            key?: string;
            ref?: (component: BComponent<IComponentProps>) => void;
         }
        // tslint:enable:no-empty-interface
    }
}

export module React {
    export function createElement<T extends BComponent<TT>, TT>(constructorFn: new (key: string, ref: () => T, props: TT) => T, attributes: TT, child: BComponent<IComponentProps>) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: BComponent<IComponentProps>[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }
        
        const component: BComponent<TT> = new constructorFn(attributes === undefined ? undefined : (<any>attributes).key, attributes === undefined ? undefined : (<any>attributes).ref, attributes);
        children.forEach((child: BComponent<IComponentProps>) => {
            component.mountChild(child);
        });
        return component;
    }
}