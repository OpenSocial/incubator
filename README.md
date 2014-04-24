incubator
=========
Interested in contributing to OpenSocial open source projects? View [CONTRIBUTING.md](https://github.com/OpenSocial/incubator/blob/master/CONTRIBUTING.md) for details.

## Components
- [Activity Streams Action Handlers](http://opensocial.org/projects/) - agnostic javascript component for working with Activity Streams, Actions, and Action Handlers.  Based on [v2 draft](http://www.ietf.org/id/draft-snell-activitystreams-actions-02.txt) of Action Handlers specification.
- Activity Streams 2.0 Java implementation - Activity Streams 2.0 implementation based in Java is included as a submodule of the Incubator.
- Activity Streams 2.0 JS implementation - Activity Streams 2.0 implementation based in Javascript is included as a submodule of the Incubator.

### Pump.io
If you are using Pump.io to prototype, then please read `README-pump.io.md`

## Building Docs
This project is fully documented using JSDoc 3.

To build the documentation you can run the provided script.  You will need to have
the jsdoc command installed globally first.

    $ buildDoc.sh

or you can alternatively run

    $ jsdoc -c jsdoc.conf

Visit https://github.com/jsdoc3/jsdoc for more information about using JSDoc 3.
