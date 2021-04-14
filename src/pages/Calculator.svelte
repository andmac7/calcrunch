<script>
	import moment from 'moment';
	import { v4 as uuidv4 } from 'uuid';

    import { onMount } from 'svelte';
    import { STORAGE_KEYS } from '../shared/storage';
    import { saveValue } from '../shared/utils';

    const MESSAGES = {
        ADD: 'Lägg till logg',
        ADDED: 'Tillagd i logg!'
    }

    let buttonText = MESSAGES.ADD;

	let kcals;
	let grams;
	let result = 0;
	let dayEntries = [];

	function calc() {
        buttonText = MESSAGES.ADD;

		if (!kcals || !grams) return;

		result = Math.round((kcals/100) * grams);
	}

	function addToDay() {
        if (!kcals || !grams) return;

		const entry = {
			id: uuidv4(),
			time: moment().format("DD[/]MM, HH:mm"),
			kcal: result,
		};
		dayEntries = [...dayEntries, entry];

        saveValue(STORAGE_KEYS.DAY_ENTRIES, dayEntries);
        buttonText = MESSAGES.ADDED;
        clearValues();
	}

    function clearValues() {
        kcals = 0;
        grams = 0;
        result = 0;
    }

    onMount(() => {
        dayEntries = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_ENTRIES)) ?? [];
    });
</script>

<main>
	<div class="container">
		<div class="row title">
			<h1>Räknare</h1>
		</div>
		<div class="row">
			<div class="column">
		  		<p>Kcal/100g:</p>
			</div>
			<div class="column">
				<input id="kcals" type="number" bind:value={ kcals } on:change={ calc } />
			</div>
		</div>
		<br>
		<div class="row">
			<div class="column">
				<p>Hur många gram:</p>
			</div>
			<div class="column">
				<input id="grams" type="number" bind:value={ grams } on:change={ calc } />
			</div>
		</div>
		<div class="row">
			<div class="column">
				<h3 id="result">{ result } kcal</h3>
			</div>
		</div>
		<div class="row">
			<div class="column">
				<button id="btn-add" on:click={ addToDay }>{ buttonText }</button>
			</div>
		</div>
    </div>
</main>

<style>
</style>