'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon.png": "5dcef449791fa27946b3d35ad8803796",
"manifest.json": "a83bbbd9d23ea4d752fbcd44cdc544fa",
"index.html": "6b848d47eeb04d776f3c88144699f750",
"/": "6b848d47eeb04d776f3c88144699f750",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/AssetManifest.json": "d8d8242d8453b834bca02515887089eb",
"assets/FontManifest.json": "7587c102a16672bc2bb42e4a87149fa6",
"assets/assets/images/google-play-badge.png": "468ef7f576ce6cfef78231938349ab0b",
"assets/assets/images/bitsblockchain.jpg": "9e22d095c4026af6cca5c1a8a78009e7",
"assets/assets/images/cooprata/cooprata4.png": "88d020316ccd7b37a4dbddf3f8c54dc7",
"assets/assets/images/cooprata/cooprata2.png": "89c9ff032061c9561275029122947e8f",
"assets/assets/images/cooprata/cooprata3.png": "a126cbd24b41e878ece8a144e963abed",
"assets/assets/images/cooprata/cooprata1.png": "0a39f71f3a61364d023b9a931bd6d509",
"assets/assets/images/bitsblockchain/bitsblockchain1.png": "834c31f010012b5c4951466e11653a61",
"assets/assets/images/bitsblockchain/bitsblockchain3.png": "a397330ea639c22537992cbf97ef2d4f",
"assets/assets/images/bitsblockchain/bitsblockchain2.png": "17de6c39ba5a319fe6a424b0ca438652",
"assets/assets/images/bitsblockchain/bitsblockchain4.png": "dbc006acd1061d61bde496071dabcc7d",
"assets/assets/images/zenaide/zenaide1.png": "869b5dd0c7e2dedd656adc9e60f27211",
"assets/assets/images/zenaide/zenaide2.png": "d0ed24fdc553a0af3c0db46c2502c13b",
"assets/assets/images/zenaide/zenaide3.png": "88efa8a5e9e4b036c5f2cb389d66053c",
"assets/assets/images/twitter.png": "247d003f20654c85d3aaba07811e36ec",
"assets/assets/images/github-logo.png": "064ace4777ac86d7627f455f36975452",
"assets/assets/images/linkedin.png": "30c453b7f5fbdb09ea0cb42a5dc7a6e5",
"assets/assets/images/quarentify.jpeg": "78af19e0e99c3a1da97a38d8d60b0973",
"assets/assets/images/profile.jpeg": "b89c607a2c81091c3c8ab5b6f82b7fbd",
"assets/assets/images/github.png": "472739dfb5857b1f659f4c4c6b4568d0",
"assets/assets/images/quarentify/quarentify1.png": "d54492d1c4fd5311c34bb83bb6c5b997",
"assets/assets/images/quarentify/quarentify3.png": "ca706da49939fd301ead36b8848fa251",
"assets/assets/images/quarentify/quarentify2.png": "a16ad94cb0b289880e7b92bc3d19071e",
"assets/assets/images/cooprata.jpeg": "3091d0659a61bd6fb14a09107fa1bb7a",
"assets/assets/images/zenaide.jpeg": "6f84c634250c9dc57cdf598294ec0ad0",
"assets/assets/fonts/FiraCode-Bold.ttf": "01f3d4803613ee9556769509a85dba50",
"assets/assets/fonts/FiraCode-Regular.ttf": "d60b1090972c3e6230c555347da880db",
"assets/NOTICES": "646b8b06e7d06214005eddefacc4ab56",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"main.dart.js": "60f7debf6e4231b121e55fcff0f2b0fd"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
