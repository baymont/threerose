# bframe (alpha)

The functional Mixed Reality framework for web devs. Powered by Babylon.JS. TypeScript first.

## Set Up

`npm install bframe`

That's it!

## Goals

1. Make it simple for web devs to build 3D experiences.
2. Make it functional and declaritive.
3. Abstract the underlying engine (No need to know Babylon.JS).

## Concepts

### Components

At the core of bframe are *components*. Primitive ones include: `Sphere`, `Box`, `Cylinder`, and so on.

### Complex

'ImageScreen`, 'StackContainer`, etc.

### Behaviors

Components by themselves aren't enough to build rich experiences. This is where behaviors kick in. They can be added to any component to add some juice to them. `ClickBehavior` takes a callback that's triggered when click. `AnimationBehavior` lets you create simple and complex animations.
