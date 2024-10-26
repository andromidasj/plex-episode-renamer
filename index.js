#!/usr/bin/env node

import chalk from "chalk";
import commandLineArgs from "command-line-args";
import { promises as fs } from "fs";
import path from "path";
import { logDivider } from "./utils.js";

const { log } = console;

const error = chalk.bold.red;
const info = chalk.bold.blue;
const success = chalk.bold.green;
const fileName = chalk.bold.yellow;

log(success("Starting..."));

const DIR_TO_IGNORE = [".git", "node_modules", "@eaDir"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".tbn"];
const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".m4v", ".avi", ".mov"];

const optionDefinitions = [
  {
    name: "dry-run",
    alias: "d",
    type: Boolean,
  },
  {
    name: "path",
    alias: "p",
    type: String,
    defaultValue: "./",
    defaultOption: true,
  },
  {
    name: "verbose",
    alias: "v",
    type: Boolean,
  },
];

const options = commandLineArgs(optionDefinitions);

const workingDirectory = path.resolve(process.cwd(), options.path);
if (options.verbose) {
  logDivider("=");
  log(info("Options:"));
  log(info("CLI options:", JSON.stringify(options, null, 2)));
  log(info("workingDirectory:", workingDirectory));
}

renameImagesInDirectory(workingDirectory);

async function renameImagesInDirectory(directoryPath) {
  logDivider("=");
  log(info("Processing directory:", directoryPath));

  const directoryContents = (await fs.readdir(directoryPath)).filter(
    (name) => DIR_TO_IGNORE.indexOf(name) === -1
  ); // Filter out directories to ignore

  options.verbose && log("directoryContents", directoryContents);

  for (const directoryItem of directoryContents) {
    const itemPath = path.join(directoryPath, directoryItem);
    try {
      const stat = await fs.lstat(itemPath);
      if (stat.isDirectory()) {
        await renameImagesInDirectory(itemPath);
      }
    } catch (error) {
      error("Error processing directory item:", directoryItem, error);
    }
  }

  const videos = directoryContents.filter((name) =>
    VIDEO_EXTENSIONS.includes(path.extname(name))
  );
  options.verbose && log("videos:", videos);

  const images = directoryContents.filter((name) =>
    IMAGE_EXTENSIONS.includes(path.extname(name))
  );
  options.verbose && log("images:", images);

  const imageEpisodeMap = new Map();

  images.forEach((image) => {
    const parsed = extractSeasonAndEpisode(image);
    if (!parsed) {
      options.verbose && log(error("No season and episode found for", image));
      return;
    }

    const { season, episode } = parsed;
    imageEpisodeMap.set(`${season}-${episode}`, image);
  });

  for (const videoName of videos) {
    logDivider();

    const parsed = extractSeasonAndEpisode(videoName);
    if (!parsed) {
      log("No season and episode found for", videoName);
      continue;
    }

    const { season, episode } = parsed;
    const image = imageEpisodeMap.get(`${season}-${episode}`);

    if (!image) {
      log("No image found for", fileName(videoName));
      continue;
    }

    const imageExtension = image.split(".").pop();
    const videoBaseName = videoName.split(".").slice(0, -1).join(".");
    const newImageName = `${videoBaseName}.${imageExtension}`;
    options.verbose && log("newImageName:", newImageName);

    const imagePath = path.resolve(directoryPath, image);
    options.verbose && log("imagePath:", imagePath);
    const newImagePath = path.join(directoryPath, newImageName);
    options.verbose && log("newImagePath:", newImagePath);
    const wouldSkip = imagePath === newImagePath;

    if (options["dry-run"]) {
      if (wouldSkip) {
        log("Would skip:");
        log("  ", imagePath);
        log("  as it is already named correctly.");
        continue;
      }
      log(
        `Would rename file for ${chalk.underline(
          `Season ${season} Episode ${episode}`
        )}:`
      );
      log("  OLD:", fileName(imagePath));
      log("  NEW:", info(newImagePath));
    } else {
      if (wouldSkip) {
        log(
          `Skipping ${fileName(imagePath)} as it is already named correctly.`
        );
        continue;
      }

      try {
        // FIXME: renaming doesn't work with special characters in filename
        await fs.rename(imagePath, newImagePath);
        log("Renamed:");
        log("  ", fileName(imagePath));
        log("  to");
        log("  ", fileName(newImagePath));
      } catch (error) {
        error(
          `Error renaming "${fileName(imagePath)}" to "${info(newImagePath)}"`,
          error
        );
      }
    }
  }
}

function extractSeasonAndEpisode(str) {
  const regex = /s(\d+)\s?e(\d+)/i;
  const match = str.match(regex);

  if (match) {
    const season = parseInt(match[1], 10); // Convert captured season number to integer
    const episode = parseInt(match[2], 10); // Convert captured episode number to integer
    return { season, episode };
  } else {
    return null; // Return null if no match found
  }
}
