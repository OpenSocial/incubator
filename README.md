incubator
=========
To contribute, you need to sign our Contributor License Agreement once that is in place.  We will use CLAHub to enforce our CLA all incoming pull requests.

## Pump.io prototyping
If you are using Pump.io to prototype, then please read README-pump.io.md.

## Components
- [Activity Streams Action Handlers](http://opensocial.org/projects/) - agnostic javascript component for working with Activity Streams, Actions, and Action Handlers.  Based on v2 draft of Action Handlers, needs to be updated to [v3 draft](http://www.ietf.org/id/draft-snell-activitystreams-actions-03.txt) of Action Handlers specification.

## Building Docs
This project is fully documented using JSDoc 3.

To build the documentation you can run the provided script.  You will need to have
the jsdoc command installed globally first.

    $ buildDoc.sh

or you can alternatively run

    $ jsdoc -c jsdoc.conf

Visit https://github.com/jsdoc3/jsdoc for more information about using JSDoc 3.
