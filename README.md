# Market Insights Add-on

An AI-powered marketing analysis and optimization tool for Adobe Express, created with [_@adobe/create-ccweb-add-on_]. This project demonstrates how to build an Adobe Express Add-on using JavaScript and the Document Sandbox Runtime.

## Features

- **Design Analyzer:** Analyze and optimize your current design using AI.
- **Caption Generator:** Generate engaging captions for multiple platforms (Instagram, Facebook, Twitter, LinkedIn) with customizable tone, audience, emojis, and hashtags.
- **Campaign Generator:** Create marketing campaign ideas and mockups, including influencer suggestions.
- **Auto-fill with AI:** Instantly populate form fields using AI-powered suggestions.
- **Export Options:** Export analysis results as `.txt` files.

## Technologies Used

- HTML
- CSS
- JavaScript
- Adobe Add-on SDK

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Build the application:
   ```sh
   npm run build
   ```
3. Start the application:
   ```sh
   npm run start
   ```

## File Structure

```
src/
  index.html
  manifest.json
  styles.css
  sandbox/
    code.js
    tsconfig.json
  ui/
    index.js
    styles.css
    tsconfig.json
package.json
README.md
tsconfig.json
```

## Usage

- Open Adobe Express and load the Add-on.
- Fill in the product/service, industry, and target demographic.
- Use the Design Analyzer, Caption Generator, or Campaign Generator as needed.
- Export your results for further use.

