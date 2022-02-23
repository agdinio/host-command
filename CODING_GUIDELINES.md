# Coding Guidelines

## Comments

* Comments are rarely useful
* favor simplicity over comments
* Comments should describe _WHY_ and _NOT WHAT_

```js
// BAD
// delete connections
yield call(deleteItem, CONNECTIONS)

// GOOD
// Since this is a new installation of app,
// we do not have previously stored connections
// so go ahead and delete previously stored connections
yield call(deleteItem, CONNECTIONS)
```

## Be thorough

* Imagine the next person landing in your code to have no context whatsoever and VERY limited time to change it.
* Explain without the assumption that people already know how your code works
* Explain the hacks you needed to do and why they work
* Explain the internal interdependencies that aren't explicit (eg other systems relying on structure or api)
* Be ok w/ writing a longer paragraph whenever needed

## TDD

* Write tests for everything you create
* Tests should be co-located with feature/component inside `__tests` folder
* Test filenames should end with `.spec.js`
* A snapshot test should be present for each component

## Naming conventions

* NO SHORT NAMES are allowed. Be as explicit as you can be

```js
// BAD
const a, req, txt, conReq, res, d,

// GOOD
const invitationRequest, connectionRequest, authenticationRequest
```

## Types

* Add flow types for every new file that you create
* Good if you add flow types to existing files as well
* New files should have `// @flow` at the top of the file and must adhere to flow types and fix flow errors
* Do not use `any` for flow types

## UI components - use PureComponent or functional components

* Use common layout components for almost every layout need
* Try to use as many common components as possible
* No inline style

> _Note:_ This is a work in progress guidelines and will keep on improving as we move along
