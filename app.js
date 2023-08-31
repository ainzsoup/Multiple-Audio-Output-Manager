import shell from 'shelljs';
import readline from 'readline';
import { PulseAudio } from 'pulseaudio.js';
import prompt from 'prompt-sync';
import PromptSync from 'prompt-sync';

const green = '\x1b[32m';
const reset = '\x1b[0m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';

async function combineSinks(devices) {
	console.clear();
    let slaves = devices.split(' ').join(',');
	const prompt = PromptSync();
	const description = prompt('Enter Name >');

    const pactlCommand = `pactl load-module module-combine-sink slaves="${slaves}" sink_properties="device.description=${description}" `;
	console.log (pactlCommand);

    const result = shell.exec(pactlCommand);

    if (result.code === 0) {
        console.log('Comb created');
    } else {
        console.error('Error creating comb:', result.stderr);
    }
}

function help() {
	console.clear();
	let list = `list: lists the available outputs\n`;
	list +=    `switch: switch output device\n`;
	list +=    `comb: create a multiple output comb\n`;
	list +=    `del: delete a comb`;
	console.log(list);
}

function listSinks(sinks, combs = true) {
	console.clear();
	console.log('------------------------------------------');
	console.log(`${red}Available Devices:${reset}`);
	for (let sink of sinks.devices)
		console.log(sink.index, sink.description);
	if (combs.length > 0) {
		console.log(`${red}Available combs:${reset}`);
		for (let sink of sinks.combs)
			console.log(sink.index, sink.description);
	}
	console.log('------------------------------------------');
}

async function updateSinks(pa) {
	let sinks = await pa.getAllSinks();
	let devices = [];
	let combs = [];
	for (let sink of sinks) {
		if (sink.driver !== 'module-combine-sink.c')
			devices.push(sink);
		else if (sink.driver === 'module-combine-sink.c')
	 		combs.push(sink);
	} 
	return {devices, combs};
}

async function unloadModule(moduleIndex) {
    shell.exec(`pactl unload-module ${moduleIndex}`);
    console.log('Module unloaded:', moduleIndex);
}

function listCombs(sinks) {
	console.clear();
	if (sinks.combs.length === 0) {
		console.log('no available combs.');
		return false;
	}
	console.log(`${red}Pick the index of the comb to delete:${reset}`);
	for (let sink of sinks.combs) {
		console.log(sink.module, sink.description);
	}
	return true;
}

async function switchOutput (pa, sinks) {
	listSinks(sinks);
	const prompt = PromptSync();
	const output = prompt('Enter index of output to switch to >');
	await pa.setDefaultSink(output);
	console.log(`${green}Output switched to: ${sinks.devices.concat(sinks.combs).find(sink => sink.index === parseInt(output)).description}${reset}`);
}

async function main () {
	const pa = new PulseAudio();
	await pa.connect();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
	console.log('Welcome to scuffed Audio-manager v1.0.\nType "help" for more information.')
    const promptUser = async () => {
		let sinks = await updateSinks(pa);
        rl.question(`> `, async (command) => {
            switch (command) {
				case '':
					break;
				case 'clear':
					console.clear();
					break;
                case 'help':
                    help();
                    break;
                case 'list':
					listSinks(sinks);
                    break;
				case 'comb':
					if (sinks.devices.length < 2)
						console.log('Not enough devices to combine.');
					else
						listSinks(sinks, false)
						rl.question('type indexes of devices to comb space sparated\n> ', async (devices) => {
							await combineSinks(devices);
							promptUser();
						});
						
					break;
				case 'del':
					if (listCombs(sinks)) {
						rl.question('> ', async (number) => {
							const moduleIndex = parseInt(number);
							await unloadModule(moduleIndex);
							promptUser();
						});
						return;
					}
					break;
				case 'switch':
						await switchOutput(pa, sinks);
					break;
                default:
                    console.log('Unknown command. Type "help" for available commands.');
            }

            promptUser();
        });
    };

    promptUser();
}
main();
