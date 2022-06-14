
const DISPLAY_MOBILE = 'Display Mobile Version';
const DISPLAY_WEB = 'Display Desktop Version';
let newURL = '';
let changeURLElement = document.getElementById('changeURL');
let newWindowElement = document.getElementById('newWindow');
let statusElement = document.getElementById('status');

// Saves options to chrome.storage
function save_options() {
  var newWindowValue = newWindowElement.checked;
  chrome.storage.sync.set({
    newWindowValue: newWindowValue
  }, function() {
    // Update status to let user know options were saved.
    // statusElement.textContent = 'Options saved.';
    statusElement.style.display = 'block';
    setTimeout(function() {
      // statusElement.textContent = '';
      statusElement.style.display = 'none';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  // Use default value newWindowValue = false.
  chrome.storage.sync.get({
    newWindowValue: false
  }, function(items) {
    newWindowElement.checked = items.newWindowValue;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restore_options();
  newWindowElement.addEventListener('click', save_options);

  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    urlString = tabs[0].url;
    let urlConstructor = new URL(urlString);
    if(urlConstructor.host.substr(0, 2).includes('m.')) {
      changeURLElement.innerHTML = DISPLAY_WEB;
    } else {
      changeURLElement.innerHTML = DISPLAY_MOBILE;
    }
  });
  changeURLElement.addEventListener('click', function(event) {
    switchURL(event);
  });
});

function switchURL(event) {
  // Access URL
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    urlString = tabs[0].url;
    // use `url` here inside the callback because it's asynchronous!

    // Modify URL
    let urlConstructor = new URL(urlString);
    // JavaScript can access the current URL in parts. For this URL:
    // https://example.com/page1/index.html?s=hello
    // window.location.protocol = “https:”
    // window.location.host = “example.com”
    // window.location.pathname = “/page1/index.html”
    // window.location.search = “?s=hello
    // So to get the full URL path in JavaScript:
    // var newURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search

    if(urlConstructor.host.substr(0, 2).includes('m.')) {
      newURL = urlConstructor.protocol + '//' + urlConstructor.host.substr(2) + urlConstructor.pathname + urlConstructor.search;
      event.target.innerText = DISPLAY_MOBILE;
    } else {
      if(urlConstructor.host.substr(0, 4).includes('www.')) {
        newURL = urlConstructor.protocol + '//' + 'm.' + urlConstructor.host.substr(4) + urlConstructor.pathname + urlConstructor.search;
        event.target.innerText = DISPLAY_WEB;
      } else {
        newURL = urlConstructor.protocol + '//' + 'm.' + urlConstructor.host + urlConstructor.pathname + urlConstructor.search;
        event.target.innerText = DISPLAY_WEB;
      }
    }

    // Create New URL
    if(newWindowElement.checked) {
      // Create URL in new tab
      chrome.tabs.create({url: newURL});
    } else {
      // Create URL in current tab
      chrome.tabs.update({url: newURL});
    }

  });
}
