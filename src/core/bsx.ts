import BComponent from './BComponent';
import IComponentProps from './common/IComponentProps';

declare global {
    export namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends BComponent<IComponentProps, {}> { }
        interface ElementAttributesProperty { props: {}; }
        interface ElementChildrenAttribute { children: {}; }
        interface IntrinsicAttributes {
            key?: string;
         }
        // tslint:enable:no-empty-interface
    }
}

export module React {
    export function createElement<T extends BComponent<TT, TTT>, TT, TTT>(constructorFn: new (key: string, props: TT) => T, attributes: TT, child: BComponent<IComponentProps, {}>) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: BComponent<IComponentProps, {}>[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }
        
        const component: BComponent<TT, TTT> = new constructorFn(attributes === undefined ? undefined : (<any>attributes).key, attributes);
        children.forEach((child: BComponent<IComponentProps, {}>) => {
            component.mountChild(child);
        });
        return component;
    }
}