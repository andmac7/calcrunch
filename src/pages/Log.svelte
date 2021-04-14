<script>
    import { onMount } from 'svelte';
    import { STORAGE_KEYS } from '../shared/storage';
    import { saveValue } from '../shared/utils';

    let dayTotal = 0;
    let dayEntriesTotal = 0;
    let dayEntries = [];

    function removeAll() {
        if (confirm('Är du säker på att du vill ta bort alla inlägg?')) {
            dayEntries = [];
            updateDayTotal();
        }
    }

	function updateDayTotal() {
		dayEntriesTotal = 0;
		dayEntries.forEach(entry => dayEntriesTotal += entry.kcal);
        saveValue(STORAGE_KEYS.DAY_ENTRIES, dayEntries);
	}

	function removeFromDay(id) {
		dayEntries = dayEntries.filter(entry => entry.id != id);
		updateDayTotal();
	}

    onMount(() => {
        dayTotal = parseInt(localStorage.getItem(STORAGE_KEYS.DAY_TOTAL) ?? 0);
        dayEntries = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_ENTRIES)) ?? [];
        updateDayTotal();
    });
</script>

<main>
    <div class="container">
        <div class="row title">
			<h1>Logg</h1>
		</div>
		<br>
		<div class="row">
			<div class="column">
		  		<p>Kalorimål för dagen:</p>
			</div>
			<div class="column">
				<input id="kcalsDay" type="number" bind:value={ dayTotal } on:input={() => saveValue(STORAGE_KEYS.DAY_TOTAL, dayTotal)} />
			</div>
			<div class="column">
				<h3 class="{ (dayTotal >= dayEntriesTotal) ? 'green' : 'red' }" id="kcalDif">{ (dayTotal >= dayEntriesTotal) ? '+' : '' }{ dayTotal - dayEntriesTotal }</h3>
			</div>
		</div>
        {#if dayEntries.length > 0}
            <button class="btn-remove danger" on:click={ removeAll }>Rensa alla</button>
        {/if}
		{#each dayEntries as entry}
			<div class="entry-row">
				<div class="column">
					<h4>{entry.time}</h4>
				</div>
				<div class="column">
					<h4>{entry.kcal} kcal</h4>
				</div>
			</div>
			<button class="btn-remove" on:click={ removeFromDay(entry.id) }>Ta bort inlägg</button>
		{/each}
    </div>
</main>

<style>
    .danger {
        border-color: red;
    }
</style>