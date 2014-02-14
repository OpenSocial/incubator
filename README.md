incubator
=========
To contribute, you need to <a href="http://www.clahub.com/agreements/OpenSocial/incubator">sign the Contributor License Agreement</a>.  We use CLAHub to enforce this on all incoming pull requests.

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
