Working with Pump.io
--------------------

Pump.io is a convenient activity stream to use for prototyping this project.  The main changes have been made on the form where you can submit new Notes.  These Notes are activity entries that get placed into the user's activity stream.  You can attach ActionHandler data using the extensions that have been added to that web form.

![pump.io](http://i.imgur.com/KyXWp6v.png)

OpenSocial has a fork of Pump.io with a branch that includes changes to bootstrap developing Activity Streams Action Handlers.

  https://github.com/OpenSocial/pump.io/tree/as_actions
  
Check out this branch to work with Pump.io.  A comparison of this branch with Pump.io will make it clear where the changes have been made.  If you have changes you want to make to Pump.io in order to support Action Handlers, issue pull requests against `as_actions` branch in OpenSocial's fork.

  https://github.com/OpenSocial/pump.io/compare/as_actions
  
The Incubator github repository needs to be symlinked (or synchronized) to `pump.io/public/javascript/libs` in order for this branch of Pump.io to function properly.
  
Below I am including my sample `/etc/pump.io.json` configuration file.  For more details on setting up and running Pump.io, I refer to you the Pump.io documentation at http://pump.io/.

```javascript
{
    "driver":  "memory",
    "params":  {},
    "secret":  "my cat has fleas",
    "noweb":  false,
    "site":  "Matt's Sandbox",
    "owner":  "Matt Marum",
    "ownerURL":  "http://opensocial.org",
    "port":  8000,
    "hostname":  "localhost",
    "address":  "localhost",
    "nologger":  false,
    "serverUser":  "mmarum",
    "uploaddir": "./uploads",
    "debugClient": true,
    "firehose": false,
    "scripts" : []
}
```
