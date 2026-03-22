// What keyword should the links contain to create events for?
// If the URL is something like https://www.example.com/product/1234
// keyword = "/product/"
const keyword = '*';

// Name for the event
const saEventName = 'link_click';

// This function binds an events to a link
function bindToLinks(element) {
  // We check if the keyword is filled in
  if (!keyword || keyword !== '*')
    return console.warn('Simple Analytics: No keyword set');

  // Filter the links we want to bind to
  if (
    !element.href ||
    (element.href.indexOf(keyword) === -1 && keyword !== '*')
  )
    return;

  // We use dataset to check if we already added our event to this link
  if (element.dataset.simpleAnalytics) return;
  element.dataset.simpleAnalytics = 'link-event';

  // Here we listen for links that are submitted
  element.addEventListener('click', function (e) {
    // Stop when we already handled this event
    if (element.dataset.simpleAnalyticsClicked) return;

    // If the Simple Analytics script is not loaded, we don't do anything
    if (!window.sa_loaded) return;

    // We prevent the visitor from being navigated away, because we do this later after sa_event
    e.preventDefault();

    // We look for a button in the link to find the button text
    const text = element.textContent?.trim()
      ? element.textContent.trim().toLowerCase()
      : element.ariaLabel?.trim()
        ? element.ariaLabel.trim().toLowerCase()
        : null;

    // We add this text to the metadata of our event
    const metadata = {
      text,
      hostname: element.hostname,
      path: element.pathname,
      id: element.getAttribute('id'),
    };

    // We send the event to Simple Analytics
    window.sa_event(saEventName, metadata, function () {
      // Now we click the link for real
      element.dataset.simpleAnalyticsClicked = 'true';
      element.click();
    });
  });
}

// This function finds all links and passes it to the bindToLinks function
function onDOMContentLoaded() {
  document.querySelectorAll('a').forEach(bindToLinks);
}

// This code runs the onDOMContentLoaded function when the page is done loading
if (document.readyState === 'ready' || document.readyState === 'complete') {
  onDOMContentLoaded();
} else {
  document.addEventListener('readystatechange', function (event) {
    if (event.target.readyState === 'complete') onDOMContentLoaded();
  });
}
