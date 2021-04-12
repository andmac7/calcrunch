<script>
	let kcals;
	let grams;
	let result = 0;

	function calc() {
		if (!kcals || !grams) return;
		result = (kcals/100) * grams;
	}
</script>

<main>
	<div class="container">
		<div class="row">
			<div class="column">
		  		<p>Kcal/100g:</p>
			</div>
			<div class="column">
				<input id="kcals" type="number" bind:value={ kcals } />
			</div>
		</div>
		<br>
		<div class="row">
			<div class="column">
				<p>Hur många gram:</p>
			</div>
			<div class="column">
				<input id="grams" type="number" bind:value={ grams } />
			</div>
		</div>
		<br>
		<div class="row">
			<div class="column">
		  		<button id="btn-calculate" on:click={ calc }>Räkna ut</button>
			</div>
			<div class="column">
				<h3 id="result">{ result } kcal</h3>
			</div>
		</div>
	  </div>
</main>

<style>
	:global(body) {
		background-color: #fdfdfd;
		background-image: url("img/tomatoes.jpg");
		background-position: left 150px top 111px;
		box-shadow: 0 0 57px 8px white inset;
		background-repeat: no-repeat;
	}

	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;
	}

	.container {
		margin-left: auto;
		margin-right: auto;
		width: 28em
	}

	.row {
		display: flex;
	}

	.column {
		flex: 50%;
		margin-top: auto;
	}

	.column button {
		width: 100%;
	}

	.column p {
		float: left;
	}

	@media (max-width: 640px) {
		p {
			font-size: 28px;
		}

		h3 {
			font-size: 42px;
		}

		.container {
			width: inherit;
		}

		.row {
			display: inherit;
		}

		input {
			width: 100%;
			font-size: 30px;
		}

		button {
			height: 74px;
    		font-size: 26px;
		}

		:global(body) {
			background-size: 300%;
			background-position-x: -45px;
			background-position-y: 270px;
		}
	}
</style>