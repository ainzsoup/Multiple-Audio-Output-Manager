const shell = require(`shelljs`);
const readline = require('readline');
const green = '\x1b[32m';
const reset = '\x1b[0m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';

async function combineSinks(selectedSinks, combinedSinkName) {
    const combinedSinkIndex = shell.exec(`pactl load-module module-combine-sink sink_name=${combinedSinkName} slaves=${selectedSinks.join(',')}`, { silent: true }).stdout.trim();
    console.log('Combined sink created with index:', combinedSinkIndex);

    // Set the combined sink as the default sink
    shell.exec(`pactl set-default-sink ${combinedSinkIndex}`);

    console.log('Combined sink set as default.');
}

function help() {
	let list = `${blue}list: lists the available outputs\n`;
	list +=    `switch: switch output device`;
	list +=    `comb: create a multiple output comb\n`;
	list +=    `del: delete a comb${reset}`;
	console.log(list);
}

function listSinks(sinks) {
	// console.clear();
	console.log('------------------------------------------');
	console.log(`${red}Available Devices:${reset}`);
	for (let sink of sinks.devices)
		console.log(sink.index, sink.name);
	console.log(`${red}Available combs:${reset}`);
	for (let sink of sinks.combs)
			console.log(sink.index, sink.name);
	console.log('------------------------------------------');
}

function updateSinks() {
	const sinksOutput = shell.exec(`pactl list sinks`, { silent: true }).stdout;
	const sinksArray = sinksOutput.split('Sink #');
	const sinks = sinksArray.slice(1).map(sink => {
		const lines = sink.trim().split('\n');
		const index = parseInt(lines[0]);
		const name = lines.find(line => line.includes('Description:')).split(':')[1].trim();
		const driver = lines.find(line => line.includes('Driver:')).split(':')[1].trim();
		const ownerModule = parseInt(lines.find(line => line.includes('Owner Module:')).split(':')[1].trim());

		return { index, name, driver, ownerModule};
	});
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
	if (sinks.combs.length === 0) {
		console.log('no available combs.');
		return false;
	}
	console.log(`${red}Pick the index of the comb to delete:${reset}`);
	for (let sink of sinks.combs) {
		console.log(sink.ownerModule, sink.name);
	}
	return true;
}

async function main () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
	console.log('Welcome to scuffed Audio-manager v1.0.\nType "help" for more information.')
    const promptUser = async () => {
		let sinks = updateSinks();
        rl.question(`> `, async (command) => {
            switch (command) {
				case '':
					break;
                case 'help':
                    help();
                    break;
                case 'list':
					listSinks(sinks);
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
                default:
                    console.log('Unknown command. Type "help" for available commands.');
            }

            promptUser();
        });
    };

    promptUser();
}
main();
