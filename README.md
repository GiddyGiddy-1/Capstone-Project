# Planet

Planet is a small website that shows facts about the planets in our solar system. I built it for my TS Academy Capstone Project using HTML, CSS and JavaScript. You can switch between light and dark mode, and the planet data comes from an API.

**Live site:** _add your link here_
**Repository:** _add your link here_

## About this submission

I did this project on my own, so it is a personal submission. Because I was the only person on my team, I was also the team lead.

## What it does

- Switch between light and dark mode. The site remembers your choice and uses your device's setting the first time you visit.
- Search for a planet by name. If nothing matches, it tells you.
- See a card for each planet with its name, picture, type, distance from the sun, mass, diameter, period, temperature, gravity, moons and a short description.
- Compare all the planets in one table. The planet you searched for is highlighted.
- Works on phones, tablets and computers. The phone view is a little different, as in the design.
- Has hover, focus and error styles from the design.
- Uses proper HTML tags, works with a keyboard, and has labels for screen readers.

## Author

| Name | GitHub | What I did |
| ---- | ------ | ---------- |
| _Your full name_ | [@GiddyGiddy-1](https://github.com/GiddyGiddy-1) | All of it: the HTML, the CSS (light and dark mode, phone layout), the JavaScript (loading data, search, theme button), this README and putting the site online |

## Files

```
index.html       The page itself
styles.css       Colors, light and dark mode, layout and phone styles
script.js        Loads the data, shows the planets, handles search and the theme button
planets.json     A copy of the planet data
images/logo.png  The Planet logo
```

## How to run it on your computer

1. Download the project: `git clone <repo-url>`
2. Go into the folder: `cd <repo-folder>`
3. Start a local server: `npx serve .` (or use the Live Server extension in VS Code)
4. Open the link it shows you in your browser

The site gets its data from the internet, so you need to be online. Using a local server works better than opening `index.html` by double-clicking it.

## Where the data comes from

At the top of `script.js` there is a line that says where to get the data:

```js
const API_URL = "https://anurella.github.io/json/planet.json";
```

`planets.json` is a copy of the same data. If you want to use the copy, for example when you are offline, change that line to `"planets.json"`.

Each planet has these details: `name`, `type`, `distanceFromSun`, `image`, `mass`, `diameter`, `period`, `temperature`, `gravity`, `moons` and `description`.

## How I used Git

- I worked on separate branches.
- I added my changes to `main` using Pull Requests.
- I kept my commits small and only made them when a task was done.

## Credits

The design is by Amaka N. The planet facts come from NASA. I built the site at TS Academy.