# plex-episode-renamer

A simple CLI tool to rename your Plex episodes. Call the script and point it to a folder containing your TV show files. It will find all the images in the folder that match existing episodes. If it finds an episode, it will rename the file to match the episode filename so that Plex can find it.

## Usage

1. Add image files to your TV show folder, in their respective season folders.
   - For example:
     - `/path/to/Your TV Show/Season 1/s01e01.jpg`
     - `/path/to/Your TV Show/Season 1/s01e02.jpg`
     - `/path/to/Your TV Show/Season 2/s02e01.jpg`
2. Run the script `npx plex-episode-renamer '/path/to/Your TV Show'`
   - Optional: Use the `-d` or `--dry-run` flag to see what files will be renamed without actually renaming them.

## Options

| Option            | Description                                                                   | Default |
| ----------------- | ----------------------------------------------------------------------------- | ------- |
| `-d`, `--dry-run` | Run in dry-run mode, without actually renaming files.                         | `false` |
| `-v`, `--verbose` | Run in verbose mode, showing more information about what the script is doing. | `false` |
