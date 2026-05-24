<img width="1280" height="693" alt="after running the code" src="https://github.com/user-attachments/assets/0789a683-fdf9-4374-a22c-14855e16b1fb" /># Google Contacts Anchor Harvester

A lightweight browser-console tool designed to harvest and export large Google Workspace Contacts directories to an Excel-safe CSV file. 

This script features **Slow Network Pacing** to allow dynamic directories to load reliably on slower connections, along with a **Fast-Forward Resume System** to help recover from unexpected page reloads or network drops without losing your place.

![Google Contacts Anchor Harvester Demo after running the code.gif…]()!


## Features

- **Row-Scoped Extractions:** Identifies contacts using the email address as an "anchor," extracting the matching name, job title, phone, and profile image scoped specifically to that row.
- **Slow Network Friendly:** Configurable scroll intervals and distances give slow APIs plenty of time to fetch and render elements.
- **Fast-Forward Auto-Resume:** Skip manually scrolling down thousands of rows. The script can auto-scroll at high speeds until it encounters your selected "resume" contact, then switches back to safe harvesting mode.
- **Pre-load CSV History:** Paste your previous CSV backup directly into the configuration to automatically populate your previous list and resume seamlessly.

## How to Use

1. Navigate to your target directory on [Google Contacts](https://contacts.google.com/directory).
2. Open your browser's Developer Tools Console (`F12` or right-click -> `Inspect` -> `Console`).
3. If your browser blocks pasting, type `allow pasting` in the command line and hit **Enter**.
4. Configure the settings at the top of `harvest.js` if you are resuming a session:
   - **To resume a previous export:** Paste your previous CSV output between the backticks of `previousCSV`.
   - **To start fresh from a specific contact:** Enter the target contact's exact email in `startAfterEmail`.
5. Copy the configuration and paste it into the console, then hit **Enter**.
6. The script will initialize a floating UI window displaying current progress. Click **DOWNLOAD CLEAN CSV** at any time to export your collected contacts.

## Configuration Settings

Adjust these variables at the top of the file depending on your network conditions:

* `SCROLL_INTERVAL` (default: `8000`ms): Paced waiting time for slow connections. Increase this if you experience loading loops.
* `SCROLL_STEP` (default: `200`px): Distance scrolled per cycle. Smaller numbers are safer for slower renders.
* `NUDGE_STEP` (default: `400`px): A helper distance scroll used to kick-start the directory API when stuck.

## Disclaimer
This script is intended for personal utility and data migration purposes. Use responsibly and in accordance with your organization's compliance and data protection guidelines.
