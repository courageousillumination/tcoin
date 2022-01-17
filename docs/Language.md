Should we writet the full VM? Or maybe we can get away with a simple tree walk interpreter over a lisp-like.

Let's play around with a simple lisp-like.
What are the built-ins?

`getStorage [string] => unknown`
`setStorage [string] [value] => void`
`= (a) (b) => boolean`
`if [boolean] [branch1] [branch2]`
`exists value => boolean`
`id`

First of all I want to support a very simple "name registry" smart contract.

```
(if (exists (getStorage "value"))
    ()
    (setStorage "key" "value"))
```

Ok, so basically I want to define a couple of functions that let someone interact
with the registry. I need a constructor that creates the registry. And then I need
a fuction to query it. And I need a function to set a value.

So the entire smart contract may look something like this:

`
(define register-value (lambda (key value) (setStorage! key value)))

(define get-value (lambda (key) (getStorage key)))
`

Then we could interact with this either via directly inspecting the blockchain, or via
another smart contract.
