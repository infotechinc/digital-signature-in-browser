// Digital Signatures with Web Cryptography API
//
// Copyright 2014 Info Tech, Inc.
// Provided under the MIT license.
// See LICENSE file for details.

// Will create a random key pair for digital signing and
// verification. A file can be selected and then signed, or
// a signed file can be verified, with that key pair.

document.addEventListener("DOMContentLoaded", function() {
    "use strict";

    // Fix Apple prefix if needed
    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
        window.crypto.subtle = window.crypto.webkitSubtle;  // Won't work if subtle already exists
    }

    if (!window.crypto || !window.crypto.subtle) {
        alert("Your current browser does not support the Web Cryptography API! This page will not work.");
        return;
    }

    var keyPair;    // Used by several handlers later

    createAndSaveAKeyPair().
    then(function() {
        // Only enable the cryptographic operation buttons if a key pair can be created
        document.getElementById("sign").addEventListener("click", signTheFile);
        document.getElementById("verify").addEventListener("click", verifyTheFile);
    }).
    catch(function(err) {
        alert("Could not create a keyPair or enable buttons: " + err.message + "\n" + err.stack);
    });



    // Key pair creation:

    function createAndSaveAKeyPair() {
        // Returns a promise.
        // Takes no input, yields a key pair to the then handler.
        // Side effect: updates keyPair in enclosing scope with new value.

        return window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
                hash: {name: "SHA-256"}
            },
            true,   // can extract it later if we want
            ["sign", "verify"]).
        then(function (key) {
            keyPair = key;
            return key;
        });
    }



    // Click handlers to sign or verify the given file:

    function signTheFile() {
        // Click handler. Reads the selected file, then signs it to
        // the random key pair's private key. Creates a Blob with the result,
        // and places a link to that Blob in the download-results section.

        var sourceFile = document.getElementById("source-file").files[0];

        var reader = new FileReader();
        reader.onload = processTheFile;
        reader.readAsArrayBuffer(sourceFile);

        // Asynchronous handler:
        function processTheFile() {
            // Load handler for file reader. Needs to reference keyPair from
            // enclosing scope.

            var reader = this;              // Was invoked by the reader object
            var plaintext = reader.result;

            sign(plaintext, keyPair.privateKey).
            then(function(blob) {
                var url = URL.createObjectURL(blob);
                document.getElementById("download-links").insertAdjacentHTML(
                    'beforeEnd',
                    '<li><a href="' + url + '">Signed file</a></li>');
            }).
            catch(function(err) {
                alert("Something went wrong signing: " + err.message + "\n" + err.stack);
            });


            function sign(plaintext, privateKey) {
                // Returns a Promise that yields a Blob to its
                // then handler. The Blob points to an signed
                // representation of the file. The structure of the
                // Blob's content's structure:
                //    16 bit integer length of the digital signature
                //    Digital signature
                //    Original plaintext

                return window.crypto.subtle.sign(
                    {name: "RSASSA-PKCS1-v1_5"},
                    privateKey,
                    plaintext).
                then(packageResults);


                function packageResults(signature) {
                    // Returns a Blob representing the package of
                    // the signature it is provided and the original
                    // plaintext (in an enclosing scope).

                    var length = new Uint16Array([signature.byteLength]);
                    return new Blob(
                        [
                            length,     // Always a 2 byte unsigned integer
                            signature,  // "length" bytes long
                            plaintext   // Remainder is the original plaintext
                        ],
                        {type: "application/octet-stream"}
                    );
                }

            } // End of sign
        } // end of processTheFile
    } // end of signTheFile click handler




    function verifyTheFile() {
        // Click handler. Reads the selected file, then verify the digital
        // signature using the random key pair's public key. Shows an alert
        // saying whether the signature is valid or not. If the signature is
        // valid, it also creates a Blob with the original file
        // and places a link to that Blob in the download-results section.

        var sourceFile = document.getElementById("source-file").files[0];

        var reader = new FileReader();
        reader.onload = processTheFile;
        reader.readAsArrayBuffer(sourceFile);


        function processTheFile() {
            // Load handler for file reader. Needs to reference keyPair from
            // enclosing scope.
            var reader = this;              // Invoked by the reader object
            var data = reader.result;

            // First, separate out the relevant pieces from the file.
            var signatureLength = new Uint16Array(data, 0, 2)[0];   // First 16 bit integer
            var signature       = new Uint8Array( data, 2, signatureLength);
            var plaintext       = new Uint8Array( data, 2 + signatureLength);

            verify(plaintext, signature, keyPair.publicKey).
            then(function(blob) {
                if (blob === null) {
                    alert("Invalid signature!");
                } else {
                    alert("Signature is valid.");
                    var url = URL.createObjectURL(blob);
                    document.getElementById("download-links").insertAdjacentHTML(
                        'beforeEnd',
                        '<li><a href="' + url + '">Verified file</a></li>');
                }
            }).
            catch(function(err) {
                alert("Something went wrong verifying: " + err.message + "\n" + err.stack);
            });


            function verify(plaintext, signature, publicKey) {
                // Shows an alert stating whether the signature is
                // valid or not, and returns a Promise the yields
                // either a Blob containing the original plaintext
                // or null if the signature was invalid.

                return window.crypto.subtle.verify(
                    {name: "RSASSA-PKCS1-v1_5"},
                    publicKey,
                    signature,
                    plaintext
                ).
                then(handleVerification);


                function handleVerification(successful) {
                    // Returns either a Blob containing the original plaintext
                    // (if verification was successful) or null (if not).
                    if (successful) {
                        return new Blob([plaintext], {type: "application/octet-stream"});
                    } else {
                        return null;
                    }
                }

            } // end of verify
        } // end of processTheFile
    } // end of decryptTheFile

});
