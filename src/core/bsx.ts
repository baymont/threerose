import BComponent, { IComponentContext } from './BComponent';

declare global {
    namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends BComponent<any> { }
        interface ElementAttributesProperty { props: {}; }
        interface ElementChildrenAttribute { children: {}; }
        // tslint:enable:no-empty-interface
    }
}

export function createElement<T extends BComponent<TT>, TT>(constructorFn: new (props: TT, children: BComponent<any>[]) => T, attributes: any, child: BComponent<any>) {
    // Children can be more than one argument
    let childrenLength = arguments.length - 2;
    let children: BComponent<any>[] = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
        children[i] = arguments[i + 2];
    }

    const component: BComponent<TT> = new constructorFn(attributes, children);
    children.forEach((child: BComponent<any>) => {
        component.addChild(child);
    });
    return component;
}