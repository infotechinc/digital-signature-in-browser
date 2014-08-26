Digital Signature in the Browser
================================

This web page with associated JavaScript creates a random RSA
key pair, and allows a user to:

* Digitally sign local files with the private key, and save the signed version
* Verify previously signed files with the matching public key

This example is provided to illustrate how to use the W3C
[Web Cryptography API](http://www.w3.org/TR/WebCryptoAPI/ "API Draft")
to perform digital signing and verifying inside a web browser. It is based
on the [working draft](http://www.w3.org/TR/2014/WD-WebCryptoAPI-20140325/ "Dated Working Draft")
of the standard available when this example was created.

Using this example requires a web browser that implements a compatible version
of the Web Cryptography API. When the example was created, current versions of
the Google Chrome browser and recent nightly builds of the Firefox browser could
run the example.

**This is not intended to be a production tool.** Rather, it may
be helpful to developers who intend to create their own tools using
the Web Cryptography API.

Copyright (c) 2014 Info Tech, Inc.
Provided under the MIT license.
See LICENSE file for details.
