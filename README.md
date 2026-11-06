# Common Ground

## Publish the single HTML file

Upload **github-pages/index.html** from this archive to the root of a GitHub repository. Under **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, and save. Open the web address GitHub shows there. For a repository with an existing site, use a separate repository or put the file at the root of the chosen publishing folder. [GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

The public HTML includes its styles and scripts. It works when opened directly in a browser and from a GitHub Pages project address. All six paths use two questions, a tailored guided exercise, practice, corrections and a check-in. Visitors can keep plans in memory for the current visit or export text.

## Use live AI on your Mac

From the workspace root, run:

```sh
node --env-file=.env.local outputs/common-ground/server.mjs
```

From an extracted copy with its own securely configured server environment, run `npm start` in the `common-ground` folder. Open [Common Ground on this Mac](http://127.0.0.1:4191/) while the server runs. Choose **Get AI guidance** and review the sharing choice. This uses a real AI service when the server has working API credentials and credits.

The last live provider test, on 1 November 2026, returned `credit_balance_exhausted`. The request and revision flows in this update were tested with fictional data and a simulated provider response. Live response quality remains unverified. [OpenAI API billing](https://platform.openai.com/settings/organization/billing)

## Connect a hosted AI preview to GitHub Pages

GitHub Pages serves the HTML. The API runs on a separate HTTPS host that can run the included Node server. The built-in access code supports a limited group of invited testers. Each request remains subject to the provider account’s usage and credits.

Set these values in the server’s environment:

| Setting | Value |
| --- | --- |
| `OPENAI_API_KEY` | Your server’s OpenAI credential, stored as a secret. |
| `PUBLIC_ORIGIN` | The exact Pages origin, for example `https://your-account.github.io`. Leave off the repository path and trailing slash. |
| `PUBLIC_API_ORIGIN` | The exact HTTPS origin of the API service, with the same host passed through by its HTTPS proxy. |
| `PUBLIC_ACCESS_TOKEN` | A random secret of 32–256 URL-safe characters. Give it privately to approved testers. |
| `PORT` | The port your HTTPS proxy sends requests to. |
| `BIND_HOST` | Leave as `127.0.0.1` for a proxy on the same host. Set `0.0.0.0` only inside a private service network when the HTTPS proxy needs it. |

Use the HTTPS proxy as the only external route to the service. In `index.html`, set the empty `apiBaseUrl` value to the API’s HTTPS origin. Publish only the HTML to Pages. Keep the provider key and tester access code out of the HTML and repository. For the modular build, the public address is set in `www/runtime-config.js`.

The app asks visitors for their tester code and explicit consent before sending an AI request. The hosted API requires that code and the configured Pages origin. A GitHub Pages origin can cover several projects under one account, so the code is required even when the origin matches. The server is ready for configuration. No hosted AI service is deployed with this delivery.

## Data and participation

The browser exercises, drafts and practice replies stay on the device for the current visit. Use **Clear** or reload to clear them. An exported copy stays wherever the user saves it.

With consent, the app sends the situation, goal and listed revision details to the configured server and OpenAI. The included server neither saves nor logs reflection text. It requests responses with storage disabled. Provider retention is governed by the provider’s data controls. [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data)

Shared exercises use one visible screen. Take part voluntarily, keep personal details to a minimum, and use the support option if you feel unsafe. Treat guidance as a starting point for reflection and communication.

## Prepare iPhone and Android versions

This source package includes Capacitor 8 configuration. Dependencies were installed, both native projects were generated in a separate build check, and web assets were synced. **Native compilation and device execution remain unverified** because Xcode and Android Studio are not installed here. There are no signed store binaries or configured developer accounts in this delivery.

Capacitor packages the web interface into native projects; see its [getting-started documentation](https://capacitorjs.com/docs/getting-started). Prepare Node.js 22 or later and the appropriate platform tools: Xcode 26 or later on macOS for iOS, or Android Studio 2025.2.1 or later with the required Android SDK for Android. Check the current [environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup).

Choose a permanent app identifier before creating native projects. The current `org.commonground.prototype` identifier is a placeholder. From the extracted `common-ground` folder:

```sh
npm ci
npm run ios:add
npm run android:add
npm run sync
```

Add only the platforms needed, once each. Then `npm run ios` opens Xcode and `npm run android` opens Android Studio. Select a simulator or device and configure signing as required. Follow the official [iOS guide](https://capacitorjs.com/docs/ios) or [Android guide](https://capacitorjs.com/docs/android). After editing `www/`, run `npm run sync` again before rebuilding.

Phone and store builds can run guided exercises on the device. A live AI connection requires a hosted service set up for the native app’s origin and access controls. The native build itself has not been tested on a device for this release.
