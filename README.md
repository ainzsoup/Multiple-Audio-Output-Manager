# Multiple-Audio-Output-Manager v1.0
Command-line tool for managing audio outputs and creating combined audio sinks. It interacts with PulseAudio to provide basic audio management functionality right from your terminal.

## Features

- List available output devices and combined sinks.
- Switch the default output device.
- Create a combined audio sink with multiple output devices.
- Delete a combined audio sink.

## Requirements

- Node.js (>=12.0.0)
- PulseAudio

## Installation

1. Clone this repository to your local machine:
   ```bash
   git clone git@github.com:ainzsoup/Pactl-Multiple-Output-Manager.git

2. Navigate to the project directory:
    ```bash
    cd Pactl-Multiple-Output-Manager
3. Install the required Node.js packages:
   ```bash
   npm install
## Usage
1. run the app
    ```bash
    node app.js
2. You will be presented with a command prompt. Enter the desired command:
   - list: List available output devices and combined sinks.
   - switch: Switch the default output device.
   - comb: Create a combined audio sink with multiple output devices.
   - del: Delete a combined audio sink.
   - exit: Exit the Audio-manager.

## Contributing
Contributions are welcome! If you find a bug or want to suggest an improvement, please open an issue or create a pull request.
