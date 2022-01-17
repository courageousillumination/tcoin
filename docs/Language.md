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
