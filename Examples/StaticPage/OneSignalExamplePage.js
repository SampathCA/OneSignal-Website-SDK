/**
 * Modified MIT License
 * 
 * Copyright 2015 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// OneSignal is defined as an array here and uses push calls because OneSignalSDK.js is loaded async.
// This so the loading of the OneSignalSDK.js file does not slow down the browser when loading your page.
var OneSignal = OneSignal || [];
 
// Enable javascript console logging to debug any problems.
//OneSignal.push(function() { OneSignal.LOGGING = true; });

// If your site is non-HTTPS please uncomment the line below and comment out the default init.
//   Also update the subdomainName parameter with the domain you entered on our dashboard prefixed with 's-'.
//OneSignal.push(["init" , {appId: "5eb5a37e-b458-11e3-ac11-000c2940e62c", subdomainName: "s-onesignalexample"}]);
OneSignal.push(["init" , {appId: "5eb5a37e-b458-11e3-ac11-000c2940e62c"}]);


var consoleStrValue = "";

function getIds() {
  OneSignal.push(["getIdsAvailable", function(ids) {
	console.log("OneSignal GetIdsAvailable");
	console.log(ids);
	consoleStrValue += "getIdsAvailable:"
                  + "\nUserID: " + ids.userId
                  + "\nRegistration ID: " + ids.registrationId + "\n\n";
	document.getElementById("console").innerText = consoleStrValue;
  }]);
}

function getTags() {
	OneSignal.push(["getTags", function(tags) {
    console.log("OneSignal GetTags:");
    console.log(tags);
    consoleStrValue += "getTags: " + JSON.stringify(tags) + "\n\n";
    document.getElementById("console").innerText = consoleStrValue;
	}]);
}

function sendTag() {
	// Use sendTags passing in a JSON object if you want to send more than one key value pair at a time.
	OneSignal.push(["sendTag", document.getElementById("tagKey").value, document.getElementById("tagValue").value]);
}

function registerForPush() {
  OneSignal.push(["registerForPushNotifications"]);
}

OneSignal.push(["addListenerForNotificationOpened", function(data) {
	console.log("Received ONE_SIGNAL_NOTIFICATION_OPENED:");
	console.log(data);
  
  consoleStrValue += "Received ONE_SIGNAL_NOTIFICATION_OPENED:\n\n" + JSON.stringify(data);
  document.getElementById("console").innerText = consoleStrValue;
}]);

function isHttpSite() {
  return (location.protocol !== 'https:' && location.host.indexOf("localhost") != 0 && location.host.indexOf("127.0.0.1") != 0);
}

window.onload = function() {
  document.getElementById("getIds").onclick = getIds;
  document.getElementById("sendTag").onclick = sendTag;
  document.getElementById("getTags").onclick = getTags;
  
  // Checks for HTTPS connection and supported browser.
  OneSignal.push(function() {
    
    // OneSignal can not auto prompt the user for the Notification permission on Non-HTTPS sites.
    // If your site is only HTTP you need to give the user a button or link to click.
    // Then call OneSignal.registerForPushNotifications() to request permission. 
    if (OneSignal.isPushNotificationsSupported()) {
      if (isHttpSite()) {
        OneSignal.isPushNotificationsEnabled(function(enabled) {
          if (!enabled) {
            document.getElementById("registerForPushSpan").style.display = 'block';
            document.getElementById("registerForPushButton").onclick = registerForPush;
          }
        });
      }
    }
    else
      document.getElementById("not-supported-message").style.display = 'block';
  });
}