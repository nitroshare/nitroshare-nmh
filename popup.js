/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Nathan Osman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

$(function() {

    const METHOD_DEVICES = "devices";
    const METHOD_SENDURL = "sendurl";

    let $spinner = $('.spinner'),
        $error = $('.error'),
        $devices = $('.devices'),
        lastRequest;

    // Create a port for interacting with the native messaging host
    let port = chrome.runtime.connectNative('net.nitroshare.nmh');

    // Send a request to the host
    function request(name, parameters) {
        $spinner.show();
        $error.add($devices).hide();
        lastRequest = name;
        port.postMessage({
            name: name,
            parameters: parameters
        });
    }

    // Send the current URL to the specified device
    function sendUrl(device) {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            request(METHOD_SENDURL, {
                device: device.uuid,
                enumerator: device.deviceEnumeratorName,
                url: tabs[0].url
            });
        });
    }

    // Process the list of devices
    function processDeviceList(devices) {
        $devices.empty();
        $.each(devices, function() {
            let $a = $('<a>')
                .attr('href', '#')
                .text(this.name);
            $a.click(() => {
                sendUrl(this);
            });
            $devices.append($('<li>').append($a));
        });
        $devices.show();
    }

    // Process the response from sending a URL
    function processSendUrl() {
        window.close();
    }

    // Process incoming messages
    port.onMessage.addListener(function(msg) {
        $spinner.hide();
        if ('error' in msg) {
            $error.text(msg.error).show();
        } else {
            if (lastRequest == METHOD_DEVICES) {
                processDeviceList(msg);
            } else {
                processSendUrl();
            }
        }
    });

    // TODO: properly implement this

    port.onDisconnect.addListener(function() {
    });

    // Load the initial list
    request(METHOD_DEVICES, {})
});
